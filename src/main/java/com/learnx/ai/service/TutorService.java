package com.learnx.ai.service;

import com.learnx.ai.model.AiResponseMeta;
import com.learnx.ai.model.SearchQuery;
import com.learnx.ai.model.SearchResult;
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
import java.util.List;
import java.util.Locale;
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

        Subject subject = catalogService.getSubject(request.subjectId());
        Topic topic = catalogService.getTopic(request.topicId());
        ExamContext examContext = request.examContextId().isBlank()
                ? null
                : catalogService.findExamContext(request.examContextId()).orElse(null);

        String historyKey = learnerProfile.getLearnerId() + ":" + subject.id();
        String conversationContext = getConversationContext(historyKey);

        List<SearchResult> searchResults = getCachedSearchResults(new SearchQuery(
                buildSearchQuery(subject, topic, examContext, request),
                subject.id(),
                topic.id(),
                request.maxResources()));

        TutorPrompt prompt = new TutorPrompt(
                subject.name(),
                topic.title(),
                topic.summary(),
                examContext == null ? "" : examContext.title(),
                buildLearnerSummary(learnerProfile, topic, performanceSnapshot),
                conversationContext,
                request.userQuestion(),
                searchResults,
                learnerProfile.getAgeCategory());

        if (debugPromptLogging) {
            LOGGER.info("Tutor prompt debug | learner={} | subject={} | prompt={}",
                    learnerProfile.getLearnerId(), subject.id(), prompt.toPromptText());
        }

        long start = System.currentTimeMillis();
        try {
            TutorResponse response = attachCitations(primaryAiProvider.generate(prompt), searchResults, "explain",
                    System.currentTimeMillis() - start);
            rememberMessage(historyKey, request.userQuestion());
            return response;
        } catch (RuntimeException primaryError) {
            LOGGER.warn("Primary AI provider failed. Falling back.", primaryError);
            try {
                TutorResponse fallback = attachCitations(fallbackAiProvider.generate(prompt), searchResults, "explain",
                        System.currentTimeMillis() - start);
                rememberMessage(historyKey, request.userQuestion());
                return fallback;
            } catch (RuntimeException fallbackError) {
                throw new AiServiceException("Both primary and fallback tutor providers failed", fallbackError);
            }
        }
    }

    private TutorResponse attachCitations(TutorResponse response, List<SearchResult> searchResults, String mode,
            long latencyMs) {
        return new TutorResponse(
                response.explanation(),
                response.examAnswerOutline(),
                response.keyPoints(),
                searchResults,
                response.fallback(),
                new AiResponseMeta(response.explanation(), response.aiResponse().model(), mode, latencyMs));
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
        builder.append(topic.title()).append(' ').append(subject.name());
        if (examContext != null) {
            builder.append(' ').append(examContext.title());
        }
        if (!request.userQuestion().isBlank()) {
            builder.append(' ').append(request.userQuestion());
        }
        return builder.toString();
    }

    private String buildLearnerSummary(LearnerProfile learnerProfile, Topic topic, PerformanceSnapshot snapshot) {
        TopicProgress topicProgress = learnerProfile.getTopicProgress().get(topic.id());
        String topicStatus = topicProgress == null
                ? "No prior attempts on this topic."
                : "Topic mastery=" + round(topicProgress.getMasteryScore())
                        + ", accuracy=" + round(topicProgress.getAccuracy())
                        + ", attempts=" + topicProgress.getAttempts() + ".";

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
