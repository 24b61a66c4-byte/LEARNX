package com.learnx.core.model;

import java.util.List;

/**
 * Exam-focused context that highlights important topics for a subject.
 */
public record ExamContext(
        String id,
        String subjectId,
        String title,
        String description,
        List<String> focusTopicIds,
        List<String> tags
) {

    public ExamContext {
        id = requireText(id, "id");
        subjectId = requireText(subjectId, "subjectId");
        title = requireText(title, "title");
        description = description == null ? "" : description.trim();
        focusTopicIds = focusTopicIds == null ? List.of() : List.copyOf(focusTopicIds);
        tags = tags == null ? List.of() : List.copyOf(tags);
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value.trim();
    }
}
