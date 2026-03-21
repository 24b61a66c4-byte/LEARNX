package com.learnx.core.model;

/**
 * Recommendation describing the next best study action for a learner.
 */
public record StudyRecommendation(
        String subjectId,
        String topicId,
        String topicTitle,
        String reason,
        double confidence,
        String suggestedAction
) {

    public StudyRecommendation {
        subjectId = requireText(subjectId, "subjectId");
        topicId = requireText(topicId, "topicId");
        topicTitle = requireText(topicTitle, "topicTitle");
        reason = reason == null ? "" : reason.trim();
        confidence = Math.max(0.0, Math.min(1.0, confidence));
        suggestedAction = suggestedAction == null ? "" : suggestedAction.trim();
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value.trim();
    }
}
