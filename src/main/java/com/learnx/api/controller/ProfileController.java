package com.learnx.api.controller;

import com.learnx.persistence.model.LearnerProfile;
import com.learnx.persistence.service.LearnerProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
@CrossOrigin(origins = "*")
public class ProfileController {
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
    public ResponseEntity<?> saveProfile(@RequestBody LearnerProfile profile) {
        try {
            LearnerProfile saved = profileService.saveProfile(profile);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving profile: " + e.getMessage());
        }
    }

    @PostMapping("/onboarding")
    public ResponseEntity<?> completeOnboarding(
            @RequestParam String userId,
            @RequestBody LearnerProfile profile) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            profile.setUserId(parsedUserId);
            LearnerProfile saved = profileService.saveProfile(profile);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error completing onboarding: " + e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteProfile(@PathVariable String userId) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            profileService.deleteProfile(parsedUserId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting profile");
        }
    }
}
