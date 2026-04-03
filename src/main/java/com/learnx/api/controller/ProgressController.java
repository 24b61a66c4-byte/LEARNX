package com.learnx.api.controller;

import com.learnx.api.security.AuthContextService;
import com.learnx.api.service.AuditService;
import com.learnx.persistence.entity.ProgressSnapshotEntity;
import com.learnx.persistence.service.ProgressSnapshotService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/progress")
public class ProgressController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProgressController.class);

    private final ProgressSnapshotService progressService;
    private final AuthContextService authContextService;
    private final AuditService auditService;

    @Autowired
    public ProgressController(
            ProgressSnapshotService progressService,
            AuthContextService authContextService,
            AuditService auditService) {
        this.progressService = progressService;
        this.authContextService = authContextService;
        this.auditService = auditService;
    }

    @GetMapping("/user/{userId}/subject/{subjectId}")
    public ResponseEntity<?> getProgress(
            @PathVariable String userId,
            @PathVariable String subjectId,
            Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            UUID parsedUserId = authContextService.parseAndRequireMatch(authenticatedUserId, userId);
            return progressService.getProgressBySubject(parsedUserId, subjectId)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            LOGGER.error("Error fetching progress for userId={} subjectId={}", userId, subjectId, e);
            return ResponseEntity.badRequest().body("Error fetching progress");
        }
    }

    @PostMapping
    public ResponseEntity<?> updateProgress(@Valid @RequestBody ProgressSnapshotEntity progress,
            Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            progress.setUserId(authenticatedUserId);
            ProgressSnapshotEntity saved = progressService.saveSnapshot(progress);
            auditService.logMutation("PROGRESS_UPSERT", authenticatedUserId, "progress-snapshot",
                    String.valueOf(saved.getId()), "Updated progress snapshot");
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            LOGGER.error("Error saving progress for userId={}", progress.getUserId(), e);
            return ResponseEntity.badRequest().body("Error saving progress");
        }
    }

    @PostMapping("/initialize")
    public ResponseEntity<?> initializeProgress(
            @RequestParam String userId,
            @RequestParam String subjectId,
            Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            UUID parsedUserId = authContextService.parseAndRequireMatch(authenticatedUserId, userId);
            ProgressSnapshotEntity progress = progressService.getOrCreateProgress(parsedUserId, subjectId);
            auditService.logMutation("PROGRESS_INITIALIZE", authenticatedUserId, "progress-snapshot",
                    String.valueOf(progress.getId()), "Initialized progress snapshot");
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            LOGGER.error("Error initializing progress for userId={} subjectId={}", userId, subjectId, e);
            return ResponseEntity.badRequest().body("Error initializing progress");
        }
    }
}
