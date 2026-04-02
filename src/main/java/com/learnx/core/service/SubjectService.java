package com.learnx.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

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
        return cache.values().stream()
                .sorted(Comparator.comparingInt(subject -> subject.displayOrder))
                .toList();
    }

    /**
     * Get subject by ID (supports both new IDs and legacy mappings)
     */
    public Optional<SubjectDTO> getSubjectById(String id) {
        ensureCacheInitialized();
        String mappedId = normalizeSubjectId(id);
        return Optional.ofNullable(cache.get(mappedId));
    }

    /**
     * Normalize aliases and route-style subject names to the catalog IDs used across
     * the rest of the application.
     */
    public String normalizeSubjectId(String id) {
        return mapLegacyId(id);
    }

    /**
     * Resolve preferred subject from interests.
     * Replaces hardcoded logic in LearnerProfileService.
     */
    public String resolvePreferredSubjectId(String[] interests) {
        if (interests == null || interests.length == 0) {
            return getDefaultSubjectId();
        }

        ensureCacheInitialized();

        if (hasInterest(interests, "code", "coding", "program", "programming", "app", "apps", "game", "games")) {
            return findSubjectIdByAnyTag("coding", "programming", "logic")
                    .orElse("coding");
        }

        if (hasInterest(interests, "math", "maths", "mathematics", "number")) {
            return findSubjectIdByAnyTag("math", "mathematics", "numbers")
                    .orElse("dbms");
        }

        if (hasInterest(interests, "science", "physics", "chemistry", "biology")) {
            return findSubjectIdByAnyTag("science", "experiments", "observation")
                    .orElse("edc");
        }

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
                .orElse("dbms");
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
        if (id == null) {
            return "";
        }

        return switch (id) {
            case "mathematics", "math" -> "dbms";
            case "science" -> "edc";
            case "computer-science", "programming" -> "coding";
            default -> id.trim().toLowerCase();
        };
    }

    private Optional<String> findSubjectIdByAnyTag(String... tags) {
        Set<String> normalizedTags = Arrays.stream(tags)
                .map(tag -> tag == null ? "" : tag.trim().toLowerCase())
                .filter(tag -> !tag.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return cache.values().stream()
                .filter(subject -> subject.tags != null && subject.tags.stream()
                        .map(tag -> tag == null ? "" : tag.trim().toLowerCase())
                        .anyMatch(normalizedTags::contains))
                .sorted(Comparator.comparingInt(subject -> subject.displayOrder))
                .map(subject -> subject.id)
                .findFirst();
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
