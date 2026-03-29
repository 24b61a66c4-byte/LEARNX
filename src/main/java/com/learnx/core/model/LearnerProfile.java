package com.learnx.core.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Mutable learner state tracked independently from the immutable catalog.
 */
public class LearnerProfile {

    private final String learnerId;
    private final String displayName;
    private int age;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private final Map<String, TopicProgress> topicProgress;
    private final List<Double> recentScores;
    private int totalQuizzesTaken;
    private int totalQuestionsAnswered;
    private int totalCorrectAnswers;

    public LearnerProfile(String learnerId, String displayName, int age) {
        if (learnerId == null || learnerId.isBlank()) {
            throw new IllegalArgumentException("learnerId must not be blank");
        }
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("displayName must not be blank");
        }
        this.learnerId = learnerId.trim();
        this.displayName = displayName.trim();
        this.age = age;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = createdAt;
        this.topicProgress = new LinkedHashMap<>();
        this.recentScores = new ArrayList<>();
    }

    public String getLearnerId() {
        return learnerId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getAge() {
        return age;
    }

    public AgeCategory getAgeCategory() {
        if (age <= 8) return AgeCategory.KIDS;
        if (age <= 12) return AgeCategory.TWEENS;
        if (age <= 17) return AgeCategory.TEENS;
        return AgeCategory.ADULTS;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public Map<String, TopicProgress> getTopicProgress() {
        return topicProgress;
    }

    public List<Double> getRecentScores() {
        return List.copyOf(recentScores);
    }

    public int getTotalQuizzesTaken() {
        return totalQuizzesTaken;
    }

    public int getTotalQuestionsAnswered() {
        return totalQuestionsAnswered;
    }

    public int getTotalCorrectAnswers() {
        return totalCorrectAnswers;
    }

    public double getOverallAccuracy() {
        if (totalQuestionsAnswered == 0) {
            return 0.0;
        }
        return (double) totalCorrectAnswers / totalQuestionsAnswered;
    }

    public TopicProgress getOrCreateTopicProgress(String topicId) {
        return topicProgress.computeIfAbsent(topicId, TopicProgress::new);
    }

    public void recordQuiz(QuizEvaluation evaluation) {
        this.totalQuizzesTaken++;
        this.totalQuestionsAnswered += evaluation.getQuestionCount();
        this.totalCorrectAnswers += evaluation.correctCount();
        this.updatedAt = evaluation.submittedAt();
        this.recentScores.add(evaluation.totalScore());

        if (recentScores.size() > 10) {
            recentScores.remove(0);
        }
    }
}
