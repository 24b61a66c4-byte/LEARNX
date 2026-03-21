package com.learnx.core.model;

/**
 * Represents a learner (student) in the LearnBot Pro platform.
 * Holds profile information used by the adaptive learning engine.
 */
public class Learner {

    private int id;
    private String username;
    private String email;
    private int age;
    /** Grade level: 1–12 for school grades, 13+ for higher education. */
    private int gradeLevel;
    /** Overall difficulty preference computed by the adaptive engine (1–10). */
    private int adaptiveDifficultyLevel;

    public Learner() {}

    public Learner(int id, String username, String email, int age, int gradeLevel) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.age = age;
        this.gradeLevel = gradeLevel;
        this.adaptiveDifficultyLevel = 1;
    }

    // Getters and setters

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public int getGradeLevel() { return gradeLevel; }
    public void setGradeLevel(int gradeLevel) { this.gradeLevel = gradeLevel; }

    public int getAdaptiveDifficultyLevel() { return adaptiveDifficultyLevel; }
    public void setAdaptiveDifficultyLevel(int level) { this.adaptiveDifficultyLevel = level; }

    @Override
    public String toString() {
        return "Learner{id=" + id + ", username='" + username + "', age=" + age
                + ", gradeLevel=" + gradeLevel + ", difficulty=" + adaptiveDifficultyLevel + "}";
    }
}
