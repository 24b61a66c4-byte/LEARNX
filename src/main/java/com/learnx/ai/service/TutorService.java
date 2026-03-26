package com.learnx.ai.service;

import com.learnx.ai.model.SearchQuery;
import com.learnx.ai.model.SearchResult;
import com.learnx.ai.model.TutorPrompt;
import com.learnx.ai.model.TutorRequest;
import com.learnx.ai.model.TutorResponse;
import com.learnx.ai.provider.AiProvider;
import com.learnx.ai.search.SearchProvider;
import com.learnx.core.model.ExamContext;
import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.PerformanceSnapshot;
import com.learnx.core.model.Subject;
import com.learnx.core.model.Topic;
import com.learnx.core.model.TopicProgress;
import com.learnx.core.service.CatalogService;

import java.util.List;
import java.util.Locale;

/**
 * Builds grounded tutor responses from catalog context, learner state, and AI providers.
 */
public class TutorService {

    private final CatalogService catalogService;
    private final SearchProvider searchProvider;
    private final AiProvider primaryAiProvider;
    private final AiProvider fallbackAiProvider;

    public TutorService(
            CatalogService catalogService,
            SearchProvider searchProvider,
            AiProvider primaryAiProvider,
            AiProvider fallbackAiProvider
    ) {
        this.catalogService = catalogService;
        this.searchProvider = searchProvider;
        this.primaryAiProvider = primaryAiProvider;
        this.fallbackAiProvider = fallbackAiProvider;
    }

    public TutorResponse answerQuestion(TutorRequest request, LearnerProfile learnerProfile, PerformanceSnapshot performanceSnapshot) {
        Subject subject = catalogService.getSubject(request.subjectId());
        Topic topic = catalogService.getTopic(request.topicId());
        ExamContext examContext = request.examContextId().isBlank()
                ? null
                : catalogService.findExamContext(request.examContextId()).orElse(null);

        List<SearchResult> searchResults = searchProvider.search(new SearchQuery(
                buildSearchQuery(subject, topic, examContext, request),
                subject.id(),
                topic.id(),
                request.maxResources()
        ));

        TutorPrompt prompt = new TutorPrompt(
                subject.name(),
                topic.title(),
                topic.summary(),
                examContext == null ? "" : examContext.title(),
                buildLearnerSummary(learnerProfile, topic, performanceSnapshot),
                request.userQuestion(),
                searchResults
        );

        try {
            return attachCitations(primaryAiProvider.generate(prompt), searchResults);
        } catch (RuntimeException exception) {
            return attachCitations(fallbackAiProvider.generate(prompt), searchResults);
        }
    }

    private TutorResponse attachCitations(TutorResponse response, List<SearchResult> searchResults) {
        return new TutorResponse(
                response.explanation(),
                response.examAnswerOutline(),
                response.keyPoints(),
                searchResults,
                response.fallback()
        );
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
}
