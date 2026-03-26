package com.learnx.core.model;

import java.time.LocalDateTime;

/**
 * Mutable learner progress snapshot for a specific topic.
 */
public class TopicProgress {

    private final String topicId;
    private int attempts;
    private int correctAnswers;
    private int totalQuestions;
    private double masteryScore;
    private LocalDateTime lastPracticedAt;
    private boolean weakTopic;
    private boolean strongTopic;

    public TopicProgress(String topicId) {
        if (topicId == null || topicId.isBlank()) {
            throw new IllegalArgumentException("topicId must not be blank");
        }
        this.topicId = topicId.trim();
        this.lastPracticedAt = LocalDateTime.now();
    }

    public String getTopicId() {
        return topicId;
    }

    public int getAttempts() {
        return attempts;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public double getMasteryScore() {
        return masteryScore;
    }

    public LocalDateTime getLastPracticedAt() {
        return lastPracticedAt;
    }

    public boolean isWeakTopic() {
        return weakTopic;
    }

    public boolean isStrongTopic() {
        return strongTopic;
    }

    public double getAccuracy() {
        if (totalQuestions == 0) {
            return 0.0;
        }
        return (double) correctAnswers / totalQuestions;
    }

    public void applyQuizOutcome(double score, int correctCount, int questionCount, LocalDateTime practicedAt) {
        this.attempts++;
        this.correctAnswers += Math.max(0, correctCount);
        this.totalQuestions += Math.max(0, questionCount);
        this.lastPracticedAt = practicedAt == null ? LocalDateTime.now() : practicedAt;

        double boundedScore = Math.max(0.0, Math.min(1.0, score));
        this.masteryScore = ((this.masteryScore * (attempts - 1)) + boundedScore) / attempts;
        updateFlags(boundedScore);
    }

    private void updateFlags(double latestScore) {
        this.strongTopic = masteryScore >= 0.8 || latestScore >= 0.9;
        this.weakTopic = attempts >= 2 && (masteryScore < 0.45 || latestScore < 0.4);

        if (strongTopic) {
            weakTopic = false;
        }
    }
}
