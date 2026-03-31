package com.learnx.api.controller;

import com.learnx.api.security.AuthContextService;
import com.learnx.api.service.AuditService;
import com.learnx.persistence.model.QuizResult;
import com.learnx.persistence.service.QuizResultService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quiz-results")
public class QuizController {

    private static final Logger LOGGER = LoggerFactory.getLogger(QuizController.class);

    private final QuizResultService quizService;
    private final AuthContextService authContextService;
    private final AuditService auditService;

    @Autowired
    public QuizController(
            QuizResultService quizService,
            AuthContextService authContextService,
            AuditService auditService) {
        this.quizService = quizService;
        this.authContextService = authContextService;
        this.auditService = auditService;
    }

    @PostMapping
    public ResponseEntity<?> submitQuiz(@Valid @RequestBody QuizResult result, Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            result.setUserId(authenticatedUserId);
            QuizResult saved = quizService.saveResult(result);
            auditService.logMutation("QUIZ_SUBMIT", authenticatedUserId, "quiz-result", String.valueOf(saved.getId()),
                    "Submitted quiz result");
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            LOGGER.error("Error saving quiz result for userId={}", result.getUserId(), e);
            return ResponseEntity.badRequest().body("Error saving quiz result");
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserResults(@PathVariable String userId, Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            UUID parsedUserId = authContextService.parseAndRequireMatch(authenticatedUserId, userId);
            List<QuizResult> results = quizService.getUserResults(parsedUserId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            LOGGER.error("Error fetching quiz results for userId={}", userId, e);
            return ResponseEntity.badRequest().body("Error fetching results");
        }
    }

    @GetMapping("/user/{userId}/subject/{subjectId}")
    public ResponseEntity<?> getUserResultsBySubject(
            @PathVariable String userId,
            @PathVariable String subjectId,
            Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            UUID parsedUserId = authContextService.parseAndRequireMatch(authenticatedUserId, userId);
            List<QuizResult> results = quizService.getUserResultsBySubject(parsedUserId, subjectId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            LOGGER.error("Error fetching quiz results for userId={} subjectId={}", userId, subjectId, e);
            return ResponseEntity.badRequest().body("Error fetching results");
        }
    }

    @GetMapping("/user/{userId}/subject/{subjectId}/average")
    public ResponseEntity<?> getAverageScore(
            @PathVariable String userId,
            @PathVariable String subjectId,
            Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            UUID parsedUserId = authContextService.parseAndRequireMatch(authenticatedUserId, userId);
            Double average = quizService.getAverageScore(parsedUserId, subjectId);
            return ResponseEntity.ok(average);
        } catch (Exception e) {
            LOGGER.error("Error calculating average score for userId={} subjectId={}", userId, subjectId, e);
            return ResponseEntity.badRequest().body("Error calculating average");
        }
    }
}
