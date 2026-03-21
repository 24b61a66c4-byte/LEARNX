package com.learnx.core.engine;

/**
 * Internal score breakdown used to rank study recommendation candidates.
 */
public record RecommendationScore(
        String topicId,
        double totalScore,
        double weaknessScore,
        double examWeightScore,
        double recencyScore,
        double difficultyAlignmentScore,
        String reason
) {
}
