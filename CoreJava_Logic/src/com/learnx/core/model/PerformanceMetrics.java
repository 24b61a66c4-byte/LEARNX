package com.learnx.core.model;

import java.time.LocalDateTime;

/**
 * Captures the results of a single learning session for a {@link Learner}.
 */
public class PerformanceMetrics {

    private int id;
    private int learnerId;
    private String topicId;
    private int totalQuestions;
    private int correctAnswers;
    private LocalDateTime sessionDate;
    /** Difficulty level that was active during this session. */
    private int difficultyLevel;

    public PerformanceMetrics() {}

    public PerformanceMetrics(int learnerId, String topicId, int totalQuestions,
                              int correctAnswers, int difficultyLevel) {
        this.learnerId = learnerId;
        this.topicId = topicId;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.difficultyLevel = difficultyLevel;
        this.sessionDate = LocalDateTime.now();
    }

    /** Returns the learner's score as a percentage (0–100). */
    public double getScorePercent() {
        if (totalQuestions == 0) return 0.0;
        return (correctAnswers * 100.0) / totalQuestions;
    }

    // Getters and setters

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getLearnerId() { return learnerId; }
    public void setLearnerId(int learnerId) { this.learnerId = learnerId; }

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public int getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }

    public LocalDateTime getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDateTime sessionDate) { this.sessionDate = sessionDate; }

    public int getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(int difficultyLevel) { this.difficultyLevel = difficultyLevel; }
}
