package com.learnx.core.model;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Quiz submission from a learner for a subject/topic.
 */
public record QuizAttempt(
        String learnerId,
        String subjectId,
        String topicId,
        List<SubmittedAnswer> submittedAnswers,
        LocalDateTime startedAt,
        LocalDateTime submittedAt
) {

    public QuizAttempt {
        learnerId = requireText(learnerId, "learnerId");
        subjectId = requireText(subjectId, "subjectId");
        topicId = requireText(topicId, "topicId");
        submittedAnswers = submittedAnswers == null ? List.of() : List.copyOf(submittedAnswers);
        startedAt = startedAt == null ? LocalDateTime.now() : startedAt;
        submittedAt = submittedAt == null ? LocalDateTime.now() : submittedAt;
    }

    public long getDurationSeconds() {
        return Math.max(0L, Duration.between(startedAt, submittedAt).getSeconds());
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value.trim();
    }
}
