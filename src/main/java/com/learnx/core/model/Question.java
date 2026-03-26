package com.learnx.core.model;

import java.util.List;

/**
 * Immutable quiz question definition loaded from the catalog.
 */
public record Question(
        String id,
        String subjectId,
        String topicId,
        QuestionType type,
        String prompt,
        List<String> options,
        Integer correctOptionIndex,
        List<String> acceptedKeywords,
        Integer minKeywordMatches,
        String explanation,
        double difficulty
) {

    public Question {
        id = requireText(id, "id");
        subjectId = requireText(subjectId, "subjectId");
        topicId = requireText(topicId, "topicId");
        type = type == null ? QuestionType.MCQ : type;
        prompt = requireText(prompt, "prompt");
        options = options == null ? List.of() : List.copyOf(options);
        acceptedKeywords = acceptedKeywords == null ? List.of() : List.copyOf(acceptedKeywords);
        minKeywordMatches = normalizeMinKeywordMatches(minKeywordMatches, acceptedKeywords);
        explanation = explanation == null ? "" : explanation.trim();
        difficulty = Math.max(0.0, Math.min(1.0, difficulty));

        validate(type, options, correctOptionIndex, acceptedKeywords, minKeywordMatches);
    }

    private static void validate(
            QuestionType type,
            List<String> options,
            Integer correctOptionIndex,
            List<String> acceptedKeywords,
            Integer minKeywordMatches
    ) {
        if (type == QuestionType.MCQ) {
            if (options.isEmpty()) {
                throw new IllegalArgumentException("MCQ questions must define options");
            }
            if (correctOptionIndex == null || correctOptionIndex < 0 || correctOptionIndex >= options.size()) {
                throw new IllegalArgumentException("MCQ questions must define a valid correctOptionIndex");
            }
        }

        if (type == QuestionType.SHORT_ANSWER && acceptedKeywords.isEmpty()) {
            throw new IllegalArgumentException("SHORT_ANSWER questions must define acceptedKeywords");
        }

        if (type == QuestionType.SHORT_ANSWER && (minKeywordMatches == null || minKeywordMatches < 1 || minKeywordMatches > acceptedKeywords.size())) {
            throw new IllegalArgumentException("SHORT_ANSWER questions must define a valid minKeywordMatches");
        }
    }

    public int requiredKeywordMatches() {
        return minKeywordMatches == null ? 1 : minKeywordMatches;
    }

    private static Integer normalizeMinKeywordMatches(Integer minKeywordMatches, List<String> acceptedKeywords) {
        if (acceptedKeywords == null || acceptedKeywords.isEmpty()) {
            return null;
        }
        if (minKeywordMatches == null) {
            return 1;
        }
        return minKeywordMatches;
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return value.trim();
    }
}
