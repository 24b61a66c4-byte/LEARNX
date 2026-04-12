package com.learnx.api.controller;

import com.learnx.api.security.AuthContextService;
import com.learnx.api.service.AuditService;
import com.learnx.core.service.CatalogService;
import com.learnx.core.store.JsonCatalogStore;
import com.learnx.persistence.entity.QuizResultEntity;
import com.learnx.persistence.service.QuizResultService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DrillScoringControllerTest {

    @Mock
    private QuizResultService quizResultService;

    @Mock
    private AuthContextService authContextService;

    @Mock
    private AuditService auditService;

    @Mock
    private Authentication authentication;

    private DrillGenerationController controller;

    @BeforeEach
    void setUp() {
        controller = new DrillGenerationController(
                new CatalogService(new JsonCatalogStore()),
                quizResultService,
                authContextService,
                auditService);
    }

    @Test
    void scoreUsesServerQuizEngineAndPersistsAnswerBreakdown() {
        UUID userId = UUID.randomUUID();
        DrillGenerationController.ScoreDrillRequest request = new DrillGenerationController.ScoreDrillRequest();
        request.subjectId = "coding";
        request.topicId = "coding-variables";
        request.answers = List.of(submitted("q-coding-2", "score"));

        QuizResultEntity previous = new QuizResultEntity();
        previous.setScorePercent(80.0);

        when(authContextService.requireAuthenticatedUser(authentication)).thenReturn(userId);
        when(quizResultService.getUserResultsByTopic(userId, "coding-variables")).thenReturn(List.of(previous));
        when(quizResultService.saveResult(any(QuizResultEntity.class))).thenAnswer(invocation -> {
            QuizResultEntity result = invocation.getArgument(0);
            result.setId(42L);
            return result;
        });

        ResponseEntity<?> response = controller.score(request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        DrillGenerationController.ScoreDrillResponse body =
                (DrillGenerationController.ScoreDrillResponse) response.getBody();
        assertNotNull(body);
        assertEquals(0, body.scorePercent());
        assertEquals(40, body.recoveryScore());
        assertFalse(body.weakConcepts().isEmpty());
        assertEquals(1, body.answers().size());
        assertEquals("q-coding-2", body.answers().get(0).questionId());

        ArgumentCaptor<QuizResultEntity> captor = ArgumentCaptor.forClass(QuizResultEntity.class);
        verify(quizResultService).saveResult(captor.capture());
        assertEquals(userId, captor.getValue().getUserId());
        assertEquals(1, captor.getValue().getAnswers().size());
        assertEquals(0, captor.getValue().getAnswers().get(0).getScore());
        verify(auditService).logMutation(any(), any(), any(), any(), any());
    }

    @Test
    void scoreRejectsMissingSubjectBeforePersistence() {
        DrillGenerationController.ScoreDrillRequest request = new DrillGenerationController.ScoreDrillRequest();
        request.answers = List.of(submitted("q-coding-2", "number text"));

        assertThrows(IllegalArgumentException.class, () -> controller.scoreDrill(UUID.randomUUID(), request));
    }

    private DrillGenerationController.SubmittedDrillAnswer submitted(String questionId, String answer) {
        DrillGenerationController.SubmittedDrillAnswer submitted = new DrillGenerationController.SubmittedDrillAnswer();
        submitted.questionId = questionId;
        submitted.answer = answer;
        return submitted;
    }
}
