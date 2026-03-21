package com.learnx.core.model;

import java.util.List;

/**
 * Evaluation result for an individual question.
 */
public record QuestionEvaluation(
        String questionId,
        String topicId,
        boolean correct,
        double score,
        String feedback,
        List<String> matchedKeywords
) {

    public QuestionEvaluation {
        if (questionId == null || questionId.isBlank()) {
            throw new IllegalArgumentException("questionId must not be blank");
        }
        if (topicId == null || topicId.isBlank()) {
            throw new IllegalArgumentException("topicId must not be blank");
        }
        score = Math.max(0.0, Math.min(1.0, score));
        feedback = feedback == null ? "" : feedback.trim();
        matchedKeywords = matchedKeywords == null ? List.of() : List.copyOf(matchedKeywords);
    }
}
