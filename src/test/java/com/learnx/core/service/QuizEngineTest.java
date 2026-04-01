package com.learnx.core.service;

import com.learnx.core.model.ExamContext;
import com.learnx.core.model.Question;
import com.learnx.core.model.QuestionType;
import com.learnx.core.model.QuizAttempt;
import com.learnx.core.model.QuizEvaluation;
import com.learnx.core.model.SubmittedAnswer;
import com.learnx.core.model.Subject;
import com.learnx.core.model.Topic;
import com.learnx.core.store.CatalogStore;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class QuizEngineTest {

    @Test
    void scoresMcqAnswersCorrectly() {
        QuizEngine quizEngine = new QuizEngine(new CatalogService(new com.learnx.core.store.JsonCatalogStore()));

        QuizAttempt attempt = new QuizAttempt(
                "learner-1",
                "dbms",
                "dbms-sql-basics",
                List.of(SubmittedAnswer.forMcq("q-dbms-1", 2)),
                LocalDateTime.now().minusMinutes(3),
                LocalDateTime.now()
        );

        QuizEvaluation evaluation = quizEngine.evaluate(attempt);

        assertEquals(1, evaluation.correctCount());
        assertEquals(1.0, evaluation.totalScore());
    }

    @Test
    void scoresShortAnswersUsingKeywordMatching() {
        QuizEngine quizEngine = new QuizEngine(new CatalogService(new com.learnx.core.store.JsonCatalogStore()));

        QuizAttempt attempt = new QuizAttempt(
                "learner-1",
                "dbms",
                "dbms-joins",
                List.of(SubmittedAnswer.forShortAnswer("q-dbms-2", "A table and a graph can show the relationship.")),
                LocalDateTime.now().minusMinutes(1),
                LocalDateTime.now()
        );

        QuizEvaluation evaluation = quizEngine.evaluate(attempt);

        assertEquals(1, evaluation.correctCount());
        assertEquals(1.0, evaluation.totalScore());
    }

    @Test
    void scoresMixedQuestionTypesInOneQuiz() {
        CatalogStore store = () -> new CatalogData(
                List.of(new Subject("dbms", "Mathematics", "Numbers and patterns", List.of())),
                List.of(new Topic("dbms-sql", "dbms", "Number Basics", "Number basics topic", List.of(), 0.2, 0.8, List.of())),
                List.of(new ExamContext("exam-1", "dbms", "Mathematics exam", "desc", List.of("dbms-sql"), List.of())),
                List.of(
                        new Question("q1", "dbms", "dbms-sql", QuestionType.MCQ, "Pick the operation that filters rows", List.of("WHERE", "JOIN"), 0, List.of(), null, "WHERE filters rows", 0.2),
                        new Question("q2", "dbms", "dbms-sql", QuestionType.SHORT_ANSWER, "Name one relationship example", List.of(), null, List.of("inner join", "left join"), 1, "Join types", 0.3)
                )
        );
        QuizEngine quizEngine = new QuizEngine(new CatalogService(store));

        QuizAttempt attempt = new QuizAttempt(
                "learner-1",
                "dbms",
                "dbms-sql",
                List.of(
                        SubmittedAnswer.forMcq("q1", 0),
                        SubmittedAnswer.forShortAnswer("q2", "Inner join")
                ),
                LocalDateTime.now().minusMinutes(2),
                LocalDateTime.now()
        );

        QuizEvaluation evaluation = quizEngine.evaluate(attempt);

        assertEquals(2, evaluation.correctCount());
        assertEquals(0.75, evaluation.totalScore());
    }
}
