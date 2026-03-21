package com.learnx.core.model;

import java.util.List;

/**
 * Immutable topic definition with prerequisite links and exam metadata.
 */
public record Topic(
        String id,
        String subjectId,
        String title,
        String summary,
        List<String> prerequisiteIds,
        double difficulty,
        double examImportance,
        List<String> tags
) {

    public Topic {
        id = requireText(id, "id");
        subjectId = requireText(subjectId, "subjectId");
        title = requireText(title, "title");
        summary = summary == null ? "" : summary.trim();
        prerequisiteIds = prerequisiteIds == null ? List.of() : List.copyOf(prerequisiteIds);
        difficulty = clamp(difficulty);
        examImportance = clamp(examImportance);
        tags = tags == null ? List.of() : List.copyOf(tags);
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value.trim();
    }

    private static double clamp(double value) {
        return Math.max(0.0, Math.min(1.0, value));
    }
}
