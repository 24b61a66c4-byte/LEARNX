package com.learnx.api.controller;

import com.learnx.api.security.AuthContextService;
import com.learnx.api.service.AuditService;
import com.learnx.persistence.entity.LearnerProfileEntity;
import com.learnx.persistence.service.LearnerProfileService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProfileController.class);

    private final LearnerProfileService profileService;
    private final AuthContextService authContextService;
    private final AuditService auditService;

    @Autowired
    public ProfileController(
            LearnerProfileService profileService,
            AuthContextService authContextService,
            AuditService auditService) {
        this.profileService = profileService;
        this.authContextService = authContextService;
        this.auditService = auditService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable String userId, Authentication authentication) {
        UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
        UUID parsedUserId = authContextService.parseAndRequireMatch(authenticatedUserId, userId);
        return profileService.getProfileByUserId(parsedUserId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> saveProfile(@Valid @RequestBody LearnerProfileEntity profile, Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            profile.setUserId(authenticatedUserId);
            LearnerProfileEntity saved = profileService.saveProfile(profile);
            auditService.logMutation("PROFILE_UPSERT", authenticatedUserId, "profile", String.valueOf(saved.getId()),
                    "Saved profile details");
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            LOGGER.error("Error saving profile for userId={}", profile.getUserId(), e);
            return ResponseEntity.badRequest().body("Error saving profile");
        }
    }

    @PostMapping("/onboarding")
    public ResponseEntity<?> completeOnboarding(
            @RequestParam String userId,
            @Valid @RequestBody LearnerProfileEntity profile,
            Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            UUID parsedUserId = authContextService.parseAndRequireMatch(authenticatedUserId, userId);
            profile.setUserId(parsedUserId);
            LearnerProfileEntity saved = profileService.saveProfile(profile);
            auditService.logMutation("PROFILE_ONBOARDING", authenticatedUserId, "profile",
                    String.valueOf(saved.getId()), "Completed onboarding");
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            LOGGER.error("Error completing onboarding for userId={}", userId, e);
            return ResponseEntity.badRequest().body("Error completing onboarding");
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteProfile(@PathVariable String userId, Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            UUID parsedUserId = authContextService.parseAndRequireMatch(authenticatedUserId, userId);
            profileService.deleteProfile(parsedUserId);
            auditService.logMutation("PROFILE_DELETE", authenticatedUserId, "profile", parsedUserId.toString(),
                    "Deleted profile");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            LOGGER.error("Error deleting profile for userId={}", userId, e);
            return ResponseEntity.badRequest().body("Error deleting profile");
        }
    }
}
