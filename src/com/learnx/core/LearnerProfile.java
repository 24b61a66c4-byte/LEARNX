package com.learnx.core;

/**
 * Represents a learner's profile including age, grade, and current difficulty level.
 *
 * <p>Performance note: All fields are stored as primitives where possible to avoid
 * boxing/unboxing overhead in hot paths.
 */
public class LearnerProfile {

    private final int userId;
    private final String username;
    private int age;
    private int difficultyLevel; // 1-10 scale
    private String currentTopic;

    public LearnerProfile(int userId, String username, int age, int difficultyLevel) {
        this.userId = userId;
        this.username = username;
        this.age = age;
        this.difficultyLevel = Math.max(1, Math.min(10, difficultyLevel));
    }

    public int getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public int getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(int difficultyLevel) {
        this.difficultyLevel = Math.max(1, Math.min(10, difficultyLevel));
    }

    public String getCurrentTopic() {
        return currentTopic;
    }

    public void setCurrentTopic(String currentTopic) {
        this.currentTopic = currentTopic;
    }

    @Override
    public String toString() {
        return "LearnerProfile{userId=" + userId
                + ", username='" + username + '\''
                + ", age=" + age
                + ", difficultyLevel=" + difficultyLevel
                + ", currentTopic='" + currentTopic + '\''
                + '}';
    }
}
