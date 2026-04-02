package com.learnx.persistence.service;

import com.learnx.persistence.model.LearnerProfile;
import com.learnx.persistence.repository.LearnerProfileRepository;
import com.learnx.core.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Service
public class LearnerProfileService {
    private final LearnerProfileRepository repository;
    private final SubjectService subjectService;

    @Autowired
    public LearnerProfileService(LearnerProfileRepository repository, SubjectService subjectService) {
        this.repository = repository;
        this.subjectService = subjectService;
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
        profile.ifPresent(p -> {
            Long profileId = p.getId();
            if (profileId != null) {
                repository.deleteById(profileId);
            }
        });
    }

    private void normalizeProfile(LearnerProfile profile) {
        if (profile == null) {
            return;
        }

        String[] normalizedPreferredTopicIds = normalizeTopicIds(profile.getPreferredTopicIds());
        profile.setPreferredTopicIds(normalizedPreferredTopicIds);

        if (profile.getAge() != null) {
            profile.setCognitiveGroup(resolveCognitiveGroup(profile.getAge()));
        }

        if (profile.getPreferredSubjectId() == null || profile.getPreferredSubjectId().isBlank()) {
            String preferredFromTopic = inferSubjectIdFromTopicIds(normalizedPreferredTopicIds);
            if (preferredFromTopic != null) {
                profile.setPreferredSubjectId(preferredFromTopic);
            } else {
                profile.setPreferredSubjectId(subjectService.resolvePreferredSubjectId(profile.getInterests()));
            }
        } else {
            profile.setPreferredSubjectId(subjectService.normalizeSubjectId(profile.getPreferredSubjectId().trim()));
        }
    }

    private String[] normalizeTopicIds(String[] preferredTopicIds) {
        if (preferredTopicIds == null || preferredTopicIds.length == 0) {
            return null;
        }

        String[] normalized = Arrays.stream(preferredTopicIds)
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .distinct()
                .limit(10)
                .toArray(String[]::new);

        return normalized.length == 0 ? null : normalized;
    }

    private String inferSubjectIdFromTopicIds(String[] preferredTopicIds) {
        if (preferredTopicIds == null || preferredTopicIds.length == 0) {
            return null;
        }

        for (String topicId : preferredTopicIds) {
            int separatorIndex = topicId.indexOf('-');
            String candidate = separatorIndex > 0 ? topicId.substring(0, separatorIndex) : topicId;
            if (subjectService.getSubjectById(candidate).isPresent()) {
                return subjectService.normalizeSubjectId(candidate);
            }
        }

        return null;
    }

    // Hardcoded subject resolution removed - now delegated to SubjectService
    // This allows subjects to be added/modified without changing code

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
