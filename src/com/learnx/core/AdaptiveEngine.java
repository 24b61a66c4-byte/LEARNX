package com.learnx.core;

/**
 * Adjusts learner difficulty based on quiz performance.
 *
 * <p>Rules:
 * <ul>
 *   <li>Score &ge; 80 % → increase difficulty (up to max 10)
 *   <li>Score &le; 40 % → decrease difficulty (down to min 1)
 *   <li>Otherwise → keep the same level
 * </ul>
 */
public class AdaptiveEngine {

    private static final double INCREASE_THRESHOLD = 80.0;
    private static final double DECREASE_THRESHOLD = 40.0;

    /**
     * Evaluates the learner's last session and adjusts their difficulty level in-place.
     *
     * @param profile  the learner whose difficulty should be adjusted
     * @param metrics  the performance data from the last session
     */
    public void adjustDifficulty(LearnerProfile profile, PerformanceMetrics metrics) {
        double score = metrics.getScorePercent(); // uses cached value – no repeated division
        int current = profile.getDifficultyLevel();

        if (score >= INCREASE_THRESHOLD) {
            profile.setDifficultyLevel(current + 1);
        } else if (score <= DECREASE_THRESHOLD) {
            profile.setDifficultyLevel(current - 1);
        }
        // between thresholds: no change
    }
}
