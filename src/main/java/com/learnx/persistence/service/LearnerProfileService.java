package com.learnx.persistence.service;

import com.learnx.persistence.model.LearnerProfile;
import com.learnx.persistence.repository.LearnerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class LearnerProfileService {
    private final LearnerProfileRepository repository;

    @Autowired
    public LearnerProfileService(LearnerProfileRepository repository) {
        this.repository = repository;
    }

    public LearnerProfile saveProfile(LearnerProfile profile) {
        normalizeProfile(profile);
        profile.setUpdatedAt(LocalDateTime.now());
        return repository.save(profile);
    }

    public Optional<LearnerProfile> getProfileByUserId(UUID userId) {
        return repository.findByUserId(userId);
    }

    public LearnerProfile getOrCreateProfile(UUID userId, String displayName) {
        Optional<LearnerProfile> existing = repository.findByUserId(userId);
        if (existing.isPresent()) {
            return existing.get();
        }

        LearnerProfile newProfile = new LearnerProfile();
        newProfile.setUserId(userId);
        newProfile.setDisplayName(displayName);
        newProfile.setCreatedAt(LocalDateTime.now());
        newProfile.setUpdatedAt(LocalDateTime.now());
        normalizeProfile(newProfile);
        return repository.save(newProfile);
    }

    public void deleteProfile(UUID userId) {
        Optional<LearnerProfile> profile = repository.findByUserId(userId);
        profile.ifPresent(p -> repository.deleteById(p.getId()));
    }

    private void normalizeProfile(LearnerProfile profile) {
        if (profile == null) {
            return;
        }

        if (profile.getAge() != null) {
            profile.setCognitiveGroup(resolveCognitiveGroup(profile.getAge()));
        }

        if (profile.getPreferredSubjectId() == null || profile.getPreferredSubjectId().isBlank()) {
            profile.setPreferredSubjectId(resolvePreferredSubjectId(profile.getInterests()));
        } else {
            profile.setPreferredSubjectId(profile.getPreferredSubjectId().trim());
        }
    }

    private String resolvePreferredSubjectId(String[] interests) {
        if (hasInterest(interests, "math", "maths", "mathematics", "number", "code", "coding", "programming")) {
            return "dbms";
        }

        if (hasInterest(interests, "science", "physics", "chemistry", "biology")) {
            return "edc";
        }

        return "dbms";
    }

    private boolean hasInterest(String[] interests, String... keywords) {
        if (interests == null || interests.length == 0) {
            return false;
        }

        for (String interest : interests) {
            if (interest == null) {
                continue;
            }

            String normalized = interest.toLowerCase();
            for (String keyword : keywords) {
                if (normalized.contains(keyword)) {
                    return true;
                }
            }
        }

        return false;
    }

    private String resolveCognitiveGroup(Integer age) {
        if (age == null) {
            return null;
        }

        if (age <= 8) {
            return "kids";
        }

        if (age <= 12) {
            return "tweens";
        }

        if (age <= 17) {
            return "teens";
        }

        return "adults";
    }
}
