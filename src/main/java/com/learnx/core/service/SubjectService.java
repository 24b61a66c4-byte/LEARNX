package com.learnx.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * SubjectService manages the catalog of available subjects.
 * Replaces hardcoded DBMS/EDC logic with configurable subject system.
 */
@Service
public class SubjectService {
    private final SubjectRepository repository;
    private final Map<String, SubjectDTO> cache = new ConcurrentHashMap<>();
    private volatile boolean cacheInitialized = false;

    @Autowired
    public SubjectService(SubjectRepository repository) {
        this.repository = repository;
    }

    /**
     * Get all active subjects
     */
    public List<SubjectDTO> getAllSubjects() {
        ensureCacheInitialized();
        return new ArrayList<>(cache.values());
    }

    /**
     * Get subject by ID (supports both new IDs and legacy mappings)
     */
    public Optional<SubjectDTO> getSubjectById(String id) {
        ensureCacheInitialized();
        String mappedId = mapLegacyId(id);
        return Optional.ofNullable(cache.get(mappedId));
    }

    /**
     * Resolve preferred subject from interests.
     * Replaces hardcoded logic in LearnerProfileService.
     */
    public String resolvePreferredSubjectId(String[] interests) {
        if (interests == null || interests.length == 0) {
            // Default to first subject, not hardcoded "dbms"
            return getDefaultSubjectId();
        }

        ensureCacheInitialized();

        // Check for math/coding interests
        if (hasInterest(interests, "math", "maths", "mathematics", "number", "code", "coding", "programming")) {
            // Find subject with "math" tag
            for (SubjectDTO subject : cache.values()) {
                if (subject.tags.contains("math")) {
                    return subject.id;
                }
            }
        }

        // Check for science interests
        if (hasInterest(interests, "science", "physics", "chemistry", "biology")) {
            // Find subject with "science" tag
            for (SubjectDTO subject : cache.values()) {
                if (subject.tags.contains("science")) {
                    return subject.id;
                }
            }
        }

        // Return default
        return getDefaultSubjectId();
    }

    /**
     * Get the default subject (first active one, or custom default)
     */
    public String getDefaultSubjectId() {
        ensureCacheInitialized();
        return cache.values().stream()
                .min(Comparator.comparingInt(s -> s.displayOrder))
                .map(s -> s.id)
                .orElse("mathematics"); // Ultimate fallback
    }

    /**
     * Refresh cache from database
     */
    public void refreshCache() {
        cacheInitialized = false;
        ensureCacheInitialized();
    }

    private void ensureCacheInitialized() {
        if (!cacheInitialized) {
            synchronized (this) {
                if (!cacheInitialized) {
                    List<SubjectDTO> subjects = repository.findAllActive();
                    cache.clear();
                    for (SubjectDTO subject : subjects) {
                        cache.put(subject.id, subject);
                    }
                    cacheInitialized = true;
                }
            }
        }
    }

    private String mapLegacyId(String id) {
        // Support old DBMS/EDC identifiers for backward compatibility
        return switch (id) {
            case "dbms" -> "mathematics";
            case "edc" -> "science";
            default -> id;
        };
    }

    private boolean hasInterest(String[] interests, String... keywords) {
        if (interests == null || interests.length == 0) {
            return false;
        }

        for (String interest : interests) {
            if (interest == null)
                continue;

            String normalized = interest.toLowerCase();
            for (String keyword : keywords) {
                if (normalized.contains(keyword)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Data Transfer Object for Subject
     */
    public static class SubjectDTO {
        public String id;
        public String name;
        public String description;
        public List<String> tags;
        public String accent;
        public String backdrop;
        public int displayOrder;

        public SubjectDTO() {
        }

        public SubjectDTO(String id, String name, String description, List<String> tags,
                String accent, String backdrop, int displayOrder) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.tags = tags;
            this.accent = accent;
            this.backdrop = backdrop;
            this.displayOrder = displayOrder;
        }
    }
}
