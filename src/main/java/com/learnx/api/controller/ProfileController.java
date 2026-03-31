package com.learnx.api.controller;

import com.learnx.persistence.model.LearnerProfile;
import com.learnx.persistence.service.LearnerProfileService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProfileController.class);

    private final LearnerProfileService profileService;

    @Autowired
    public ProfileController(LearnerProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable String userId) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            return profileService.getProfileByUserId(parsedUserId)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        }
    }

    @PostMapping
    public ResponseEntity<?> saveProfile(@Valid @RequestBody LearnerProfile profile) {
        try {
            LearnerProfile saved = profileService.saveProfile(profile);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            LOGGER.error("Error saving profile for userId={}", profile.getUserId(), e);
            return ResponseEntity.badRequest().body("Error saving profile");
        }
    }

    @PostMapping("/onboarding")
    public ResponseEntity<?> completeOnboarding(
            @RequestParam String userId,
            @Valid @RequestBody LearnerProfile profile) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            profile.setUserId(parsedUserId);
            LearnerProfile saved = profileService.saveProfile(profile);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            LOGGER.error("Error completing onboarding for userId={}", userId, e);
            return ResponseEntity.badRequest().body("Error completing onboarding");
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteProfile(@PathVariable String userId) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            profileService.deleteProfile(parsedUserId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            LOGGER.error("Error deleting profile for userId={}", userId, e);
            return ResponseEntity.badRequest().body("Error deleting profile");
        }
    }
}
