package com.learnx.ai.model;

/**
 * Incoming tutor request from a consumer of the LearnX engine.
 */
public record TutorRequest(
        String learnerId,
        String subjectId,
        String topicId,
        String examContextId,
        String userQuestion,
        int maxResources
) {

    public TutorRequest {
        learnerId = requireText(learnerId, "learnerId");
        subjectId = requireText(subjectId, "subjectId");
        topicId = requireText(topicId, "topicId");
        examContextId = examContextId == null ? "" : examContextId.trim();
        userQuestion = userQuestion == null ? "" : userQuestion.trim();
        maxResources = Math.max(1, maxResources);
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value.trim();
    }
}
