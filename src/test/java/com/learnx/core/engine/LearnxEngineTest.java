package com.learnx.core.engine;

import com.learnx.ai.model.TutorRequest;
import com.learnx.ai.model.TutorResponse;
import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.PerformanceSnapshot;
import com.learnx.core.model.QuizAttempt;
import com.learnx.core.model.QuizEvaluation;
import com.learnx.core.model.StudyRecommendation;
import com.learnx.core.model.SubmittedAnswer;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LearnxEngineTest {

    @Test
    void supportsEndToEndLearnerFlow() {
        LearnxEngine engine = LearnxEngine.createDefault();

        LearnerProfile learnerProfile = engine.initializeLearnerProfile("learner-1", "Ricky");
        QuizEvaluation evaluation = engine.submitQuiz(new QuizAttempt(
                learnerProfile.getLearnerId(),
                "dbms",
                "dbms-sql-basics",
                List.of(SubmittedAnswer.forMcq("q-dbms-1", 1)),
                LocalDateTime.now().minusMinutes(2),
                LocalDateTime.now()
        ));

        PerformanceSnapshot snapshot = engine.getPerformanceSnapshot("learner-1", "dbms");
        StudyRecommendation recommendation = engine.getNextRecommendation("learner-1", "dbms", "dbms-jntu-r22");
        TutorResponse tutorResponse = engine.answerDoubt(new TutorRequest(
                "learner-1",
                "dbms",
                recommendation.topicId(),
                "dbms-jntu-r22",
                "Explain this in exam style",
                3
        ));

        assertNotNull(evaluation);
        assertTrue(snapshot.overallAccuracy() > 0.0);
        assertNotNull(recommendation);
        assertFalse(tutorResponse.explanation().isBlank());
    }
}
