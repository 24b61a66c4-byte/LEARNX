package com.learnx.api.controller;

import com.learnx.persistence.model.ProgressSnapshot;
import com.learnx.persistence.service.ProgressSnapshotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/progress")
@CrossOrigin(origins = "*")
public class ProgressController {
    private final ProgressSnapshotService progressService;

    @Autowired
    public ProgressController(ProgressSnapshotService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/user/{userId}/subject/{subjectId}")
    public ResponseEntity<?> getProgress(
            @PathVariable String userId,
            @PathVariable String subjectId) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            return progressService.getProgressBySubject(parsedUserId, subjectId)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching progress");
        }
    }

    @PostMapping
    public ResponseEntity<?> updateProgress(@RequestBody ProgressSnapshot progress) {
        try {
            ProgressSnapshot saved = progressService.saveSnapshot(progress);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving progress: " + e.getMessage());
        }
    }

    @PostMapping("/initialize")
    public ResponseEntity<?> initializeProgress(
            @RequestParam String userId,
            @RequestParam String subjectId) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            ProgressSnapshot progress = progressService.getOrCreateProgress(parsedUserId, subjectId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error initializing progress");
        }
    }
}
