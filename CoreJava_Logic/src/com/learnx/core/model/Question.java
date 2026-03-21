package com.learnx.core.model;

/**
 * Represents a single quiz question with difficulty metadata.
 */
public class Question {

    public enum Difficulty { EASY, MEDIUM, HARD }

    private int id;
    private String topicId;
    private String text;
    private String[] options;       // Multiple-choice options (null for open-ended)
    private String correctAnswer;
    private Difficulty difficulty;
    private String explanation;     // Shown after the learner answers

    public Question() {}

    public Question(int id, String topicId, String text, String[] options,
                    String correctAnswer, Difficulty difficulty) {
        this.id = id;
        this.topicId = topicId;
        this.text = text;
        this.options = options;
        this.correctAnswer = correctAnswer;
        this.difficulty = difficulty;
    }

    // Getters and setters

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String[] getOptions() { return options; }
    public void setOptions(String[] options) { this.options = options; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
