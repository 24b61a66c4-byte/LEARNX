package com.learnx.core;

/**
 * Tracks learner performance for a quiz session.
 *
 * <p>Performance note: {@code getScorePercent()} result is lazily cached so repeated calls
 * (from AdaptiveEngine, logging, and UI display) do not re-execute the division each time.
 * The cache is invalidated whenever {@code correctAnswers} or {@code totalQuestions} changes.
 */
public class PerformanceMetrics {

    private final int userId;
    private final String topicId;
    private int totalQuestions;
    private int correctAnswers;

    // Cached result of (correctAnswers * 100.0) / totalQuestions.
    // null means the cache is stale and must be recomputed on next access.
    private Double cachedScorePercent = null;

    public PerformanceMetrics(int userId, String topicId) {
        this.userId = userId;
        this.topicId = topicId;
    }

    public int getUserId() {
        return userId;
    }

    public String getTopicId() {
        return topicId;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
        cachedScorePercent = null; // invalidate cache
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(int correctAnswers) {
        this.correctAnswers = correctAnswers;
        cachedScorePercent = null; // invalidate cache
    }

    public void incrementCorrect() {
        correctAnswers++;
        cachedScorePercent = null; // invalidate cache
    }

    /**
     * Returns the percentage of correct answers, caching the result to avoid repeated division.
     *
     * <p>The cached value is automatically invalidated whenever {@code correctAnswers} or
     * {@code totalQuestions} is mutated.
     */
    public double getScorePercent() {
        if (totalQuestions == 0) {
            return 0.0;
        }
        if (cachedScorePercent == null) {
            cachedScorePercent = (correctAnswers * 100.0) / totalQuestions;
        }
        return cachedScorePercent;
    }

    @Override
    public String toString() {
        return "PerformanceMetrics{userId=" + userId
                + ", topicId='" + topicId + '\''
                + ", correct=" + correctAnswers + "/" + totalQuestions
                + ", score=" + String.format("%.1f", getScorePercent()) + "%"
                + '}';
    }
}
