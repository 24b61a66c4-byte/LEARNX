package com.learnx.api.controller;

import com.learnx.persistence.model.QuizResult;
import com.learnx.persistence.service.QuizResultService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quiz-results")
public class QuizController {

    private static final Logger LOGGER = LoggerFactory.getLogger(QuizController.class);

    private final QuizResultService quizService;

    @Autowired
    public QuizController(QuizResultService quizService) {
        this.quizService = quizService;
    }

    @PostMapping
    public ResponseEntity<?> submitQuiz(@Valid @RequestBody QuizResult result) {
        try {
            QuizResult saved = quizService.saveResult(result);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            LOGGER.error("Error saving quiz result for userId={}", result.getUserId(), e);
            return ResponseEntity.badRequest().body("Error saving quiz result");
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserResults(@PathVariable String userId) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            List<QuizResult> results = quizService.getUserResults(parsedUserId);
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            LOGGER.error("Error fetching quiz results for userId={}", userId, e);
            return ResponseEntity.badRequest().body("Error fetching results");
        }
    }

    @GetMapping("/user/{userId}/subject/{subjectId}")
    public ResponseEntity<?> getUserResultsBySubject(
            @PathVariable String userId,
            @PathVariable String subjectId) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            List<QuizResult> results = quizService.getUserResultsBySubject(parsedUserId, subjectId);
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            LOGGER.error("Error fetching quiz results for userId={} subjectId={}", userId, subjectId, e);
            return ResponseEntity.badRequest().body("Error fetching results");
        }
    }

    @GetMapping("/user/{userId}/subject/{subjectId}/average")
    public ResponseEntity<?> getAverageScore(
            @PathVariable String userId,
            @PathVariable String subjectId) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            Double average = quizService.getAverageScore(parsedUserId, subjectId);
            return ResponseEntity.ok(average);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            LOGGER.error("Error calculating average score for userId={} subjectId={}", userId, subjectId, e);
            return ResponseEntity.badRequest().body("Error calculating average");
        }
    }
}
