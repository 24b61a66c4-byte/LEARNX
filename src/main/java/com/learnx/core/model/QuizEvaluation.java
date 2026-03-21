package com.learnx.core.model;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Aggregate scored result for a learner quiz attempt.
 */
public record QuizEvaluation(
        String learnerId,
        String subjectId,
        String topicId,
        LocalDateTime submittedAt,
        List<QuestionEvaluation> questionEvaluations,
        double totalScore,
        int correctCount,
        int incorrectCount,
        long durationSeconds
) {

    public QuizEvaluation {
        learnerId = requireText(learnerId, "learnerId");
        subjectId = requireText(subjectId, "subjectId");
        topicId = requireText(topicId, "topicId");
        submittedAt = submittedAt == null ? LocalDateTime.now() : submittedAt;
        questionEvaluations = questionEvaluations == null ? List.of() : List.copyOf(questionEvaluations);
        totalScore = Math.max(0.0, Math.min(1.0, totalScore));
        correctCount = Math.max(0, correctCount);
        incorrectCount = Math.max(0, incorrectCount);
        durationSeconds = Math.max(0L, durationSeconds);
    }

    public int getQuestionCount() {
        return questionEvaluations.size();
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value.trim();
    }
}
