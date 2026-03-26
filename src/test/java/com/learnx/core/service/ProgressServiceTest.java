package com.learnx.core.service;

import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.QuestionEvaluation;
import com.learnx.core.model.QuizEvaluation;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProgressServiceTest {

    @Test
    void updatesMasteryAfterQuiz() {
        LearnerProfile learnerProfile = new LearnerProfile("learner-1", "Ricky");
        ProgressService progressService = new ProgressService();

        QuizEvaluation evaluation = new QuizEvaluation(
                "learner-1",
                "dbms",
                "dbms-sql-basics",
                LocalDateTime.now(),
                List.of(new QuestionEvaluation("q1", "dbms-sql-basics", true, 1.0, "Good", List.of())),
                1.0,
                1,
                0,
                45
        );

        progressService.updateProgress(learnerProfile, evaluation);

        assertEquals(1, learnerProfile.getTotalQuizzesTaken());
        assertEquals(1.0, learnerProfile.getTopicProgress().get("dbms-sql-basics").getMasteryScore());
    }

    @Test
    void marksWeakTopicAfterRepeatedPoorPerformance() {
        LearnerProfile learnerProfile = new LearnerProfile("learner-1", "Ricky");
        ProgressService progressService = new ProgressService();

        QuizEvaluation evaluation = new QuizEvaluation(
                "learner-1",
                "dbms",
                "dbms-joins",
                LocalDateTime.now(),
                List.of(new QuestionEvaluation("q1", "dbms-joins", false, 0.0, "Revise joins", List.of())),
                0.0,
                0,
                1,
                30
        );

        progressService.updateProgress(learnerProfile, evaluation);
        progressService.updateProgress(learnerProfile, evaluation);

        assertTrue(learnerProfile.getTopicProgress().get("dbms-joins").isWeakTopic());
    }
}
