package com.learnx.core;

/**
 * Represents a single quiz question with its correct answer.
 *
 * <p>Performance note: {@code normalizedAnswer} is pre-computed once at construction time so
 * that {@link com.learnx.ui.QuizRunner} never has to call {@code equalsIgnoreCase()} or
 * {@code toLowerCase()} inside the per-question loop.
 */
public class Question {

    private final String text;
    private final String correctAnswer;
    /** Lower-cased version of {@code correctAnswer}; used for fast equality checks. */
    private final String normalizedAnswer;
    private final String explanation;
    private final int difficultyLevel;

    public Question(String text, String correctAnswer, String explanation, int difficultyLevel) {
        this.text = text;
        this.correctAnswer = correctAnswer;
        // Pre-normalize once so repeated comparisons in QuizRunner are O(1) lower-casing.
        this.normalizedAnswer = correctAnswer.toLowerCase();
        this.explanation = explanation;
        this.difficultyLevel = difficultyLevel;
    }

    public String getText() {
        return text;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    /**
     * Returns a pre-normalized (lower-case) copy of the correct answer.
     *
     * <p>Use this in comparison loops instead of calling {@code equalsIgnoreCase()} each time.
     */
    public String getNormalizedAnswer() {
        return normalizedAnswer;
    }

    public String getExplanation() {
        return explanation;
    }

    public int getDifficultyLevel() {
        return difficultyLevel;
    }
}
