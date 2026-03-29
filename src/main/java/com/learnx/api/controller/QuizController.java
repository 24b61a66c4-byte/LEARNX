package com.learnx.api.controller;

import com.learnx.persistence.model.QuizResult;
import com.learnx.persistence.service.QuizResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quiz-results")
@CrossOrigin(origins = "*")
public class QuizController {
    private final QuizResultService quizService;

    @Autowired
    public QuizController(QuizResultService quizService) {
        this.quizService = quizService;
    }

    @PostMapping
    public ResponseEntity<?> submitQuiz(@RequestBody QuizResult result) {
        try {
            QuizResult saved = quizService.saveResult(result);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving quiz result: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserResults(@PathVariable String userId) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            List<QuizResult> results = quizService.getUserResults(parsedUserId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
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
        } catch (Exception e) {
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
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error calculating average");
        }
    }
}
