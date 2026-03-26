package com.learnx.core.model;

/**
 * Learner-submitted answer payload for a single question.
 */
public record SubmittedAnswer(
        String questionId,
        Integer selectedOptionIndex,
        String textAnswer
) {

    public SubmittedAnswer {
        if (questionId == null || questionId.isBlank()) {
            throw new IllegalArgumentException("questionId must not be blank");
        }
        questionId = questionId.trim();
        textAnswer = textAnswer == null ? "" : textAnswer.trim();
    }

    public static SubmittedAnswer forMcq(String questionId, int selectedOptionIndex) {
        return new SubmittedAnswer(questionId, selectedOptionIndex, "");
    }

    public static SubmittedAnswer forShortAnswer(String questionId, String textAnswer) {
        return new SubmittedAnswer(questionId, null, textAnswer);
    }
}
