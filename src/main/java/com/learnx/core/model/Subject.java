package com.learnx.core.model;

import java.util.List;

/**
 * Immutable subject descriptor loaded from catalog seed data.
 */
public record Subject(
        String id,
        String name,
        String description,
        List<String> tags
) {

    public Subject {
        id = requireText(id, "id");
        name = requireText(name, "name");
        description = description == null ? "" : description.trim();
        tags = tags == null ? List.of() : List.copyOf(tags);
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value.trim();
    }
}
