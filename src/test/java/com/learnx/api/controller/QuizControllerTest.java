package com.learnx.api.controller;

import com.learnx.api.security.AuthContextService;
import com.learnx.api.service.AuditService;
import com.learnx.persistence.entity.QuizResultEntity;
import com.learnx.persistence.model.QuizAnswerDetail;
import com.learnx.persistence.service.QuizResultService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuizControllerTest {

    @Mock
    private QuizResultService quizService;

    @Mock
    private AuthContextService authContextService;

    @Mock
    private AuditService auditService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private QuizController controller;

    @Test
    void submitQuizPersistsDetailedAnswers() {
        UUID userId = UUID.randomUUID();
        QuizAnswerDetail detail = new QuizAnswerDetail();
        detail.setQuestionId("q-1");
        detail.setTopicId("dbms-joins");
        detail.setPrompt("What is a join?");
        detail.setLearnerAnswer("Combine tables");
        detail.setCorrectAnswer("Combine rows from related tables");
        detail.setCorrect(true);
        detail.setScore(100);
        detail.setExplanation("Joins combine related records.");

        QuizResultEntity request = new QuizResultEntity();
        request.setSubjectId("dbms");
        request.setTopicId("dbms-joins");
        request.setTotalQuestions(1);
        request.setCorrectCount(1);
        request.setScorePercent(100.0);
        request.setAnswers(List.of(detail));

        QuizResultEntity saved = new QuizResultEntity();
        saved.setId(22L);
        saved.setUserId(userId);
        saved.setSubjectId("dbms");
        saved.setTopicId("dbms-joins");
        saved.setTotalQuestions(1);
        saved.setCorrectCount(1);
        saved.setScorePercent(100.0);
        saved.setAnswers(List.of(detail));

        when(authContextService.requireAuthenticatedUser(authentication)).thenReturn(userId);
        when(quizService.saveResult(any(QuizResultEntity.class))).thenReturn(saved);

        ResponseEntity<?> response = controller.submitQuiz(request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        QuizResultEntity body = (QuizResultEntity) response.getBody();
        assertNotNull(body);
        assertNotNull(body.getAnswers());
        assertEquals(1, body.getAnswers().size());
        assertEquals("q-1", body.getAnswers().get(0).getQuestionId());

        ArgumentCaptor<QuizResultEntity> captor = ArgumentCaptor.forClass(QuizResultEntity.class);
        verify(quizService).saveResult(captor.capture());
        assertEquals(userId, captor.getValue().getUserId());
        assertEquals(1, captor.getValue().getAnswers().size());
    }

    @Test
    void getUserResultsReturnsAnswerBreakdown() {
        UUID userId = UUID.randomUUID();
        QuizAnswerDetail detail = new QuizAnswerDetail();
        detail.setQuestionId("q-2");
        detail.setPrompt("Define normalization.");
        detail.setCorrect(false);
        detail.setScore(0);

        QuizResultEntity result = new QuizResultEntity();
        result.setId(30L);
        result.setUserId(userId);
        result.setSubjectId("dbms");
        result.setTopicId("dbms-normalization");
        result.setTotalQuestions(1);
        result.setCorrectCount(0);
        result.setScorePercent(0.0);
        result.setAnswers(List.of(detail));

        when(authContextService.requireAuthenticatedUser(authentication)).thenReturn(userId);
        when(authContextService.parseAndRequireMatch(userId, userId.toString())).thenReturn(userId);
        when(quizService.getUserResults(userId)).thenReturn(List.of(result));

        ResponseEntity<?> response = controller.getUserResults(userId.toString(), authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<?> body = (List<?>) response.getBody();
        assertNotNull(body);
        assertEquals(1, body.size());

        QuizResultEntity first = (QuizResultEntity) body.get(0);
        assertEquals(1, first.getAnswers().size());
        assertEquals("q-2", first.getAnswers().get(0).getQuestionId());
    }

    @Test
    void getUserResultsPreservesUnauthorizedStatus() {
        when(authContextService.requireAuthenticatedUser(authentication))
                .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required"));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.getUserResults(UUID.randomUUID().toString(), authentication));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }
}
