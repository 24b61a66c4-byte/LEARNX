package com.learnx.core.engine;

import com.learnx.ai.model.TutorRequest;
import com.learnx.ai.model.TutorResponse;
import com.learnx.ai.service.TutorService;
import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.PerformanceSnapshot;
import com.learnx.core.model.QuizAttempt;
import com.learnx.core.model.QuizEvaluation;
import com.learnx.core.model.StudyRecommendation;
import com.learnx.core.model.Subject;
import com.learnx.core.model.Topic;
import com.learnx.core.service.AnalyticsService;
import com.learnx.core.service.CatalogService;
import com.learnx.core.service.ProgressService;
import com.learnx.core.service.QuizEngine;
import com.learnx.core.store.LearnerStore;
import com.learnx.core.store.QuizHistoryStore;

import java.util.List;
import java.util.Optional;

/**
 * Framework-agnostic facade exposing the LearnX library workflows.
 */
public class LearnxEngine {

    private final CatalogService catalogService;
    private final QuizEngine quizEngine;
    private final ProgressService progressService;
    private final AnalyticsService analyticsService;
    private final RecommendationEngine recommendationEngine;
    private final TutorService tutorService;
    private final LearnerStore learnerStore;
    private final QuizHistoryStore quizHistoryStore;

    public LearnxEngine(
            CatalogService catalogService,
            QuizEngine quizEngine,
            ProgressService progressService,
            AnalyticsService analyticsService,
            RecommendationEngine recommendationEngine,
            TutorService tutorService,
            LearnerStore learnerStore,
            QuizHistoryStore quizHistoryStore) {
        this.catalogService = catalogService;
        this.quizEngine = quizEngine;
        this.progressService = progressService;
        this.analyticsService = analyticsService;
        this.recommendationEngine = recommendationEngine;
        this.tutorService = tutorService;
        this.learnerStore = learnerStore;
        this.quizHistoryStore = quizHistoryStore;
    }

    public static LearnxEngine createDefault() {
        return new LearnxEngineFactory().createDefault();
    }

    public LearnerProfile initializeLearnerProfile(String learnerId, String displayName) {
        LearnerProfile learnerProfile = new LearnerProfile(learnerId, displayName, 15); // Default age to 15 (Teens) if
                                                                                        // not provided.
        learnerStore.save(learnerProfile);
        return learnerProfile;
    }

    public Optional<LearnerProfile> findLearnerProfile(String learnerId) {
        return learnerStore.findById(learnerId);
    }

    public List<Subject> getSubjects() {
        return catalogService.getSubjects();
    }

    public List<Topic> getTopicsForSubject(String subjectId) {
        return catalogService.getTopicsForSubject(subjectId);
    }

    public QuizEvaluation submitQuiz(QuizAttempt attempt) {
        LearnerProfile learnerProfile = learnerStore.findById(attempt.learnerId())
                .orElseThrow(() -> new IllegalArgumentException("Unknown learnerId: " + attempt.learnerId()));

        QuizEvaluation evaluation = quizEngine.evaluate(attempt);
        progressService.updateProgress(learnerProfile, evaluation);
        learnerStore.save(learnerProfile);
        quizHistoryStore.append(learnerProfile.getLearnerId(), evaluation);
        return evaluation;
    }

    public PerformanceSnapshot getPerformanceSnapshot(String learnerId, String subjectId) {
        LearnerProfile learnerProfile = learnerStore.findById(learnerId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown learnerId: " + learnerId));
        return analyticsService.buildSnapshot(learnerProfile, subjectId);
    }

    public StudyRecommendation getNextRecommendation(String learnerId, String subjectId, String examContextId) {
        LearnerProfile learnerProfile = learnerStore.findById(learnerId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown learnerId: " + learnerId));
        return recommendationEngine.recommendNextStep(learnerProfile, subjectId, examContextId);
    }

    public TutorResponse answerDoubt(TutorRequest request) {
        LearnerProfile learnerProfile = learnerStore.findById(request.learnerId())
                .orElseGet(() -> initializeLearnerProfile(request.learnerId(), request.learnerId()));
        PerformanceSnapshot snapshot = analyticsService.buildSnapshot(learnerProfile, request.subjectId());
        return tutorService.answerQuestion(request, learnerProfile, snapshot);
    }

    public void seedTutorConversation(String learnerId, String subjectId, List<String> recentMessages) {
        String historyKey = learnerId + ":" + subjectId;
        tutorService.seedConversationHistory(historyKey, recentMessages);
    }

    public List<QuizEvaluation> getQuizHistory(String learnerId) {
        return quizHistoryStore.findByLearnerId(learnerId);
    }
}
