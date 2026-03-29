package com.learnx.core.engine;

import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.QuestionEvaluation;
import com.learnx.core.model.QuizEvaluation;
import com.learnx.core.model.StudyRecommendation;
import com.learnx.core.service.CatalogService;
import com.learnx.core.service.ProgressService;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RecommendationEngineTest {

    @Test
    void recommendsPrerequisiteBeforeBlockedTopics() {
        RecommendationEngine engine = new RecommendationEngine(new CatalogService(new com.learnx.core.store.JsonCatalogStore()));
        LearnerProfile learnerProfile = new LearnerProfile("learner-1", "Ricky", 15);

        StudyRecommendation recommendation = engine.recommendNextStep(learnerProfile, "dbms", "dbms-jntu-r22");

        assertEquals("dbms-sql-basics", recommendation.topicId());
    }

    @Test
    void recommendsAdvancementAfterPrerequisiteMastery() {
        CatalogService catalogService = new CatalogService(new com.learnx.core.store.JsonCatalogStore());
        RecommendationEngine engine = new RecommendationEngine(catalogService);
        ProgressService progressService = new ProgressService();
        LearnerProfile learnerProfile = new LearnerProfile("learner-1", "Ricky", 15);

        QuizEvaluation strongEvaluation = new QuizEvaluation(
                "learner-1",
                "dbms",
                "dbms-sql-basics",
                LocalDateTime.now(),
                List.of(new QuestionEvaluation("q1", "dbms-sql-basics", true, 1.0, "Good", List.of())),
                1.0,
                1,
                0,
                30
        );
        progressService.updateProgress(learnerProfile, strongEvaluation);

        StudyRecommendation recommendation = engine.recommendNextStep(learnerProfile, "dbms", "dbms-jntu-r22");

        assertEquals("dbms-joins", recommendation.topicId());
    }
}
