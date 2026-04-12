package com.learnx.ai.service;

import com.learnx.ai.model.AiResponseMeta;
import com.learnx.ai.model.SearchQuery;
import com.learnx.ai.model.SearchResult;
import com.learnx.ai.model.SuggestedDrill;
import com.learnx.ai.model.TutorDiagnosis;
import com.learnx.ai.model.TutorPrompt;
import com.learnx.ai.model.TutorRequest;
import com.learnx.ai.model.TutorResponse;
import com.learnx.api.exception.AiServiceException;
import com.learnx.ai.provider.AiProvider;
import com.learnx.ai.search.SearchProvider;
import com.learnx.core.model.ExamContext;
import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.PerformanceSnapshot;
import com.learnx.core.model.Subject;
import com.learnx.core.model.Topic;
import com.learnx.core.model.TopicProgress;
import com.learnx.core.service.CatalogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Builds grounded tutor responses from catalog context, learner state, and AI
 * providers.
 */
public class TutorService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TutorService.class);
    private static final Set<String> BLOCKED_TERMS = Set.of("hate", "kill", "abuse", "harass");
    private static final Set<String> CONCEPT_STOP_WORDS = Set.of(
            "about", "after", "answer", "before", "class", "clear", "concept", "could", "doubt",
            "exam", "explain", "from", "give", "help", "idea", "learn", "like", "make", "need",
            "please", "question", "short", "show", "simple", "study", "teach", "that", "this",
            "topic", "what", "with");
    private static final List<Pattern> BLOCKED_PATTERNS = BLOCKED_TERMS.stream()
            .map(term -> Pattern.compile("(?i)(^|\\W)" + Pattern.quote(term) + "($|\\W)"))
            .collect(Collectors.toUnmodifiableList());

    private final CatalogService catalogService;
    private final SearchProvider searchProvider;
    private final AiProvider primaryAiProvider;
    private final AiProvider fallbackAiProvider;
    private final int maxQuestionLength;
    private final boolean debugPromptLogging;
    private final ConcurrentMap<String, Deque<String>> conversationHistory = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, CachedSearchEntry> searchCache = new ConcurrentHashMap<>();
    private static final Duration SEARCH_CACHE_TTL = Duration.ofMinutes(5);

    public TutorService(
            CatalogService catalogService,
            SearchProvider searchProvider,
            AiProvider primaryAiProvider,
            AiProvider fallbackAiProvider,
            int maxQuestionLength,
            boolean debugPromptLogging) {
        this.catalogService = catalogService;
        this.searchProvider = searchProvider;
        this.primaryAiProvider = primaryAiProvider;
        this.fallbackAiProvider = fallbackAiProvider;
        this.maxQuestionLength = maxQuestionLength;
        this.debugPromptLogging = debugPromptLogging;
    }

    public TutorResponse answerQuestion(TutorRequest request, LearnerProfile learnerProfile,
            PerformanceSnapshot performanceSnapshot) {
        validateMessage(request.userQuestion());

        // Subject and topic are optional; if not provided, answer is personalized by
        // learner profile only
        Subject subject = request.hasSubjectContext() ? catalogService.getSubject(request.subjectId()) : null;
        Topic topic = request.hasTopicContext() && subject != null ? catalogService.getTopic(request.topicId()) : null;
        ExamContext examContext = request.examContextId().isBlank()
                ? null
                : catalogService.findExamContext(request.examContextId()).orElse(null);

        String historyKey = learnerProfile.getLearnerId() + ":" + (subject != null ? subject.id() : "general");
        String conversationContext = getConversationContext(historyKey);

        List<SearchResult> searchResults = subject != null
                ? getCachedSearchResults(new SearchQuery(
                        buildSearchQuery(subject, topic, examContext, request),
                        subject.id(),
                        topic != null ? topic.id() : "",
                        request.maxResources()))
                : List.of();

        TutorPrompt prompt = new TutorPrompt(
                subject != null ? subject.name() : "General knowledge",
                topic != null ? topic.title() : "",
                topic != null ? topic.summary() : "",
                examContext == null ? "" : examContext.title(),
                buildLearnerSummary(learnerProfile, topic, performanceSnapshot),
                conversationContext,
                request.userQuestion(),
                searchResults,
                learnerProfile.getAgeCategory());

        if (debugPromptLogging) {
            LOGGER.info("Tutor prompt debug | learner={} | subject={} | prompt={}",
                    learnerProfile.getLearnerId(), subject != null ? subject.id() : "general", prompt.toPromptText());
        }

        long start = System.currentTimeMillis();
        TutorDiagnosis diagnosis = buildDiagnosis(subject, topic, request, performanceSnapshot);

        try {
            TutorResponse response = attachCitations(primaryAiProvider.generate(prompt), searchResults, "explain",
                    System.currentTimeMillis() - start, diagnosis);
            rememberMessage(historyKey, request.userQuestion());
            return response;
        } catch (RuntimeException primaryError) {
            LOGGER.warn("Primary AI provider failed. Falling back.", primaryError);
            try {
                TutorResponse fallback = attachCitations(fallbackAiProvider.generate(prompt), searchResults, "explain",
                        System.currentTimeMillis() - start, diagnosis);
                rememberMessage(historyKey, request.userQuestion());
                return fallback;
            } catch (RuntimeException fallbackError) {
                throw new AiServiceException("Both primary and fallback tutor providers failed", fallbackError);
            }
        }
    }

    private TutorResponse attachCitations(TutorResponse response, List<SearchResult> searchResults, String mode,
            long latencyMs, TutorDiagnosis diagnosis) {
        return new TutorResponse(
                response.explanation(),
                response.examAnswerOutline(),
                response.keyPoints(),
                searchResults,
                response.fallback(),
                new AiResponseMeta(response.explanation(), response.aiResponse().model(), mode, latencyMs),
                response.diagnosis() == null ? diagnosis : response.diagnosis());
    }

    private TutorDiagnosis buildDiagnosis(
            Subject subject,
            Topic topic,
            TutorRequest request,
            PerformanceSnapshot snapshot) {
        String subjectId = subject != null ? subject.id() : request.subjectId();
        String topicId = topic != null ? topic.id() : request.topicId();
        List<String> weakConcepts = buildWeakConcepts(topic, request.userQuestion(), snapshot);
        double confidence = topic != null ? 0.82 : subject != null ? 0.68 : 0.52;
        String drillHref = !subjectId.isBlank()
                ? "/app/practice?subjectId=" + subjectId + (topicId.isBlank() ? "" : "&topicId=" + topicId)
                : "/app/practice";
        String focus = weakConcepts.isEmpty() ? "the core idea" : weakConcepts.get(0);
        SuggestedDrill suggestedDrill = new SuggestedDrill(
                subjectId,
                topicId,
                6,
                drillHref,
                "Check " + focus + " while the explanation is fresh.");
        String nextAction = topic != null
                ? "Take a short targeted drill on " + topic.title() + " and compare the recovery score."
                : "Pick the closest topic, then take a short targeted drill.";

        return new TutorDiagnosis(subjectId, topicId, weakConcepts, confidence, suggestedDrill, nextAction);
    }

    private List<String> buildWeakConcepts(Topic topic, String prompt, PerformanceSnapshot snapshot) {
        LinkedHashSet<String> concepts = new LinkedHashSet<>();

        if (topic != null && snapshot.weakTopicIds().contains(topic.id())) {
            concepts.add(topic.title() + " recovery");
        }

        Set<String> promptTokens = tokenizeConcepts(prompt);
        if (topic != null) {
            topic.tags().stream()
                    .filter(tag -> promptTokens.isEmpty() || promptTokens.contains(normalizeConcept(tag)))
                    .map(this::humanizeConcept)
                    .forEach(concepts::add);

            catalogService.getQuestionsForTopic(topic.id()).stream()
                    .flatMap(question -> question.acceptedKeywords().stream())
                    .filter(keyword -> promptTokens.contains(normalizeConcept(keyword)))
                    .map(this::humanizeConcept)
                    .forEach(concepts::add);

            if (concepts.isEmpty()) {
                topic.tags().stream().limit(2).map(this::humanizeConcept).forEach(concepts::add);
            }
        }

        snapshot.weakTopicIds().stream()
                .map(catalogService::findTopic)
                .flatMap(Optional::stream)
                .map(Topic::title)
                .forEach(concepts::add);

        if (concepts.isEmpty()) {
            promptTokens.stream().limit(2).map(this::humanizeConcept).forEach(concepts::add);
        }

        if (concepts.isEmpty()) {
            concepts.add("core recall");
        }

        return concepts.stream().limit(3).toList();
    }

    private Set<String> tokenizeConcepts(String value) {
        if (value == null || value.isBlank()) {
            return Set.of();
        }

        return Pattern.compile("[^a-zA-Z0-9-]+")
                .splitAsStream(value.toLowerCase(Locale.ROOT))
                .map(String::trim)
                .filter(token -> token.length() > 3)
                .filter(token -> !CONCEPT_STOP_WORDS.contains(token))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String normalizeConcept(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]", "");
    }

    private String humanizeConcept(String value) {
        if (value == null || value.isBlank()) {
            return "core recall";
        }
        return value.trim().replace('-', ' ');
    }

    private void validateMessage(String message) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Question must not be blank");
        }
        if (message.length() > maxQuestionLength) {
            throw new IllegalArgumentException("Question exceeds max length of " + maxQuestionLength + " characters");
        }

        for (Pattern blockedPattern : BLOCKED_PATTERNS) {
            if (blockedPattern.matcher(message).find()) {
                throw new IllegalArgumentException("Question violates tutor safety policy");
            }
        }
    }

    private void rememberMessage(String historyKey, String userQuestion) {
        conversationHistory.compute(historyKey, (key, existing) -> {
            Deque<String> messages = existing == null ? new ArrayDeque<>() : existing;
            messages.addLast(userQuestion.trim());
            while (messages.size() > 5) {
                messages.removeFirst();
            }
            return messages;
        });
    }

    private List<SearchResult> getCachedSearchResults(SearchQuery query) {
        String cacheKey = query.subjectId() + "|" + query.topicId() + "|" + query.query() + "|" + query.maxResults();
        Instant now = Instant.now();
        CachedSearchEntry cached = searchCache.get(cacheKey);

        if (cached != null && now.isBefore(cached.expiresAt())) {
            return cached.results();
        }

        List<SearchResult> freshResults = searchProvider.search(query);
        searchCache.put(cacheKey, new CachedSearchEntry(freshResults, now.plus(SEARCH_CACHE_TTL)));
        return freshResults;
    }

    public void seedConversationHistory(String historyKey, List<String> userMessages) {
        if (userMessages == null || userMessages.isEmpty()) {
            return;
        }

        conversationHistory.computeIfAbsent(historyKey, ignored -> {
            Deque<String> messages = new ArrayDeque<>();
            userMessages.stream()
                    .filter(message -> message != null && !message.isBlank())
                    .map(String::trim)
                    .forEach(messages::addLast);

            while (messages.size() > 5) {
                messages.removeFirst();
            }
            return messages;
        });
    }

    private String getConversationContext(String historyKey) {
        Deque<String> history = conversationHistory.get(historyKey);
        if (history == null || history.isEmpty()) {
            return "";
        }
        return String.join(" || ", history);
    }

    private String buildSearchQuery(Subject subject, Topic topic, ExamContext examContext, TutorRequest request) {
        StringBuilder builder = new StringBuilder();
        if (topic != null) {
            builder.append(topic.title()).append(' ');
        }
        builder.append(subject.name());
        if (examContext != null) {
            builder.append(' ').append(examContext.title());
        }
        if (!request.userQuestion().isBlank()) {
            builder.append(' ').append(request.userQuestion());
        }
        return builder.toString();
    }

    private String buildLearnerSummary(LearnerProfile learnerProfile, Topic topic, PerformanceSnapshot snapshot) {
        String topicStatus = "No specific topic selected yet.";
        if (topic != null) {
            TopicProgress topicProgress = learnerProfile.getTopicProgress().get(topic.id());
            topicStatus = topicProgress == null
                    ? "No prior attempts on this topic."
                    : "Topic mastery=" + round(topicProgress.getMasteryScore())
                            + ", accuracy=" + round(topicProgress.getAccuracy())
                            + ", attempts=" + topicProgress.getAttempts() + ".";
        }

        return "Overall accuracy=" + round(snapshot.overallAccuracy())
                + ", recent average score=" + round(snapshot.recentAverageScore())
                + ", weak topics=" + snapshot.weakTopicIds()
                + ", strong topics=" + snapshot.strongTopicIds()
                + ". " + topicStatus;
    }

    private String round(double value) {
        return String.format(Locale.ROOT, "%.2f", value);
    }

    private record CachedSearchEntry(List<SearchResult> results, Instant expiresAt) {
    }
}
