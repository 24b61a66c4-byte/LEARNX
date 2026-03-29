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
        return repository.save(newProfile);
    }

    public void deleteProfile(UUID userId) {
        Optional<LearnerProfile> profile = repository.findByUserId(userId);
        profile.ifPresent(p -> repository.deleteById(p.getId()));
    }
}
