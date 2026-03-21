package com.learnx.core.engine;

import com.learnx.core.model.Learner;
import com.learnx.core.model.PerformanceMetrics;

/**
 * Adaptive learning engine that adjusts a learner's difficulty level
 * based on their recent performance.
 *
 * <p>Algorithm overview:
 * <ul>
 *   <li>Score &ge; 80 % → increase difficulty by 1 (up to max 10)</li>
 *   <li>Score &le; 40 % → decrease difficulty by 1 (down to min 1)</li>
 *   <li>Otherwise    → keep current difficulty</li>
 * </ul>
 */
public class AdaptiveEngine {

    private static final double THRESHOLD_UP   = 80.0;
    private static final double THRESHOLD_DOWN = 40.0;
    private static final int    MIN_DIFFICULTY = 1;
    private static final int    MAX_DIFFICULTY = 10;

    /**
     * Adjusts the learner's adaptive difficulty level based on their latest
     * performance metrics.
     *
     * @param learner the learner whose difficulty should be updated
     * @param metrics the performance metrics from the most recent session
     */
    public void adjustDifficulty(Learner learner, PerformanceMetrics metrics) {
        double score = metrics.getScorePercent();
        int current = learner.getAdaptiveDifficultyLevel();

        if (score >= THRESHOLD_UP) {
            learner.setAdaptiveDifficultyLevel(Math.min(current + 1, MAX_DIFFICULTY));
        } else if (score <= THRESHOLD_DOWN) {
            learner.setAdaptiveDifficultyLevel(Math.max(current - 1, MIN_DIFFICULTY));
        }
        // else: no change
    }

    /**
     * Returns a human-readable label for a numeric difficulty level.
     *
     * @param level difficulty level (1–10)
     * @return label string
     */
    public String getDifficultyLabel(int level) {
        if (level <= 3)  return "Beginner";
        if (level <= 6)  return "Intermediate";
        if (level <= 8)  return "Advanced";
        return "Expert";
    }
}
