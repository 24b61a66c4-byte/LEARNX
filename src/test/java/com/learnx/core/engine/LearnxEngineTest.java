package com.learnx.core.engine;

import com.learnx.ai.model.TutorRequest;
import com.learnx.ai.model.TutorResponse;
import com.learnx.core.model.ExamContext;
import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.PerformanceSnapshot;
import com.learnx.core.model.Question;
import com.learnx.core.model.QuizAttempt;
import com.learnx.core.model.QuizEvaluation;
import com.learnx.core.model.StudyRecommendation;
import com.learnx.core.model.Subject;
import com.learnx.core.model.SubmittedAnswer;
import com.learnx.core.model.Topic;
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

    @Test
    void canReadAllSubjects() {
        LearnxEngine engine = LearnxEngine.createDefault();

        List<Subject> subjects = engine.getSubjects();

        assertFalse(subjects.isEmpty());
    }

    @Test
    void canReadSubjectById() {
        LearnxEngine engine = LearnxEngine.createDefault();

        Subject subject = engine.getSubject("dbms");

        assertNotNull(subject);
        assertNotNull(subject.name());
    }

    @Test
    void canReadTopicsForSubject() {
        LearnxEngine engine = LearnxEngine.createDefault();

        List<Topic> topics = engine.getTopicsForSubject("dbms");

        assertFalse(topics.isEmpty());
    }

    @Test
    void canReadTopicById() {
        LearnxEngine engine = LearnxEngine.createDefault();

        Topic topic = engine.getTopic("dbms-sql-basics");

        assertNotNull(topic);
        assertNotNull(topic.title());
    }

    @Test
    void canReadPrerequisitesForTopic() {
        LearnxEngine engine = LearnxEngine.createDefault();

        List<Topic> prerequisites = engine.getPrerequisites("dbms-sql-basics");

        assertNotNull(prerequisites);
    }

    @Test
    void canReadQuestionsForTopic() {
        LearnxEngine engine = LearnxEngine.createDefault();

        List<Question> questions = engine.getQuestionsForTopic("dbms-sql-basics");

        assertFalse(questions.isEmpty());
    }

    @Test
    void canReadQuestionsForSubject() {
        LearnxEngine engine = LearnxEngine.createDefault();

        List<Question> questions = engine.getQuestionsForSubject("dbms");

        assertFalse(questions.isEmpty());
    }

    @Test
    void canReadQuestionById() {
        LearnxEngine engine = LearnxEngine.createDefault();

        Question question = engine.getQuestion("q-dbms-1");

        assertNotNull(question);
        assertNotNull(question.prompt());
    }

    @Test
    void canReadAllExamContexts() {
        LearnxEngine engine = LearnxEngine.createDefault();

        List<ExamContext> examContexts = engine.getExamContexts();

        assertFalse(examContexts.isEmpty());
    }

    @Test
    void canReadExamContextById() {
        LearnxEngine engine = LearnxEngine.createDefault();

        ExamContext examContext = engine.getExamContext("dbms-jntu-r22");

        assertNotNull(examContext);
        assertNotNull(examContext.title());
    }

    @Test
    void canReadFocusedTopicsForExamContext() {
        LearnxEngine engine = LearnxEngine.createDefault();

        List<Topic> focusedTopics = engine.getFocusedTopics("dbms-jntu-r22");

        assertFalse(focusedTopics.isEmpty());
    }

    @Test
    void canReadAllLearners() {
        LearnxEngine engine = LearnxEngine.createDefault();
        engine.initializeLearnerProfile("learner-read-all", "TestUser");

        List<LearnerProfile> learners = engine.findAllLearners();

        assertFalse(learners.isEmpty());
        assertTrue(learners.stream().anyMatch(l -> l.getLearnerId().equals("learner-read-all")));
    }
}
