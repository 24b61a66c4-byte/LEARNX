package com.learnx.ai.model;

/**
 * Incoming tutor request from a consumer of the LearnX engine.
 * Subject and topic are optional to support open-ended questions.
 * If not provided, the tutor answers with learner profile personalization only.
 */
public record TutorRequest(
        String learnerId,
        String subjectId,
        String topicId,
        String examContextId,
        String userQuestion,
        int maxResources) {

    public TutorRequest {
        learnerId = requireText(learnerId, "learnerId");
        subjectId = subjectId == null ? "" : subjectId.trim();
        topicId = topicId == null ? "" : topicId.trim();
        examContextId = examContextId == null ? "" : examContextId.trim();
        userQuestion = userQuestion == null ? "" : userQuestion.trim();
        maxResources = Math.max(1, maxResources);

        if (userQuestion.isBlank()) {
            throw new IllegalArgumentException("userQuestion must not be blank");
        }
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value.trim();
    }

    public boolean hasSubjectContext() {
        return !subjectId.isBlank();
    }

    public boolean hasTopicContext() {
        return !topicId.isBlank();
    }
}
