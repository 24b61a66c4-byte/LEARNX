package com.learnx.core.service;

import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.PerformanceSnapshot;
import com.learnx.core.model.QuestionEvaluation;
import com.learnx.core.model.QuizEvaluation;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class AnalyticsServiceTest {

    @Test
    void buildsPerformanceSnapshotFromLearnerProgress() {
        CatalogService catalogService = new CatalogService(new com.learnx.core.store.JsonCatalogStore());
        ProgressService progressService = new ProgressService();
        AnalyticsService analyticsService = new AnalyticsService(catalogService);
        LearnerProfile learnerProfile = new LearnerProfile("learner-1", "Ricky");

        QuizEvaluation evaluation = new QuizEvaluation(
                "learner-1",
                "dbms",
                "dbms-sql-basics",
                LocalDateTime.now(),
                List.of(new QuestionEvaluation("q1", "dbms-sql-basics", true, 1.0, "Good", List.of())),
                1.0,
                1,
                0,
                40
        );
        progressService.updateProgress(learnerProfile, evaluation);

        PerformanceSnapshot snapshot = analyticsService.buildSnapshot(learnerProfile, "dbms");

        assertEquals(1.0, snapshot.overallAccuracy());
        assertEquals(1.0, snapshot.recentAverageScore());
        assertFalse(snapshot.topicAccuracy().isEmpty());
    }
}
