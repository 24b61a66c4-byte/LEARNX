package com.learnx.ai.prompt;

/**
 * Builds age-adaptive prompt strings for the Google Gemini model.
 *
 * <p>Every prompt includes the learner's age and current difficulty level so
 * the model can calibrate vocabulary and explanation depth accordingly.
 */
public class PromptBuilder {

    private PromptBuilder() {}

    /**
     * Builds a system prompt that instructs Gemini to adapt its language
     * to the learner's profile.
     *
     * @param learnerAge      the learner's age in years
     * @param difficultyLevel the current adaptive difficulty level (1–10)
     * @return a formatted system prompt string
     */
    public static String buildSystemPrompt(int learnerAge, int difficultyLevel) {
        return String.format(
                "You are LearnBot Pro, a friendly and encouraging AI tutor. "
                + "Your student is %d years old and is currently working at difficulty level %d out of 10. "
                + "Adapt your vocabulary, sentence complexity, and explanation depth to suit this profile. "
                + "Always be positive and patient. When explaining a concept, use simple analogies first, "
                + "then increase detail if the student asks follow-up questions.",
                learnerAge, difficultyLevel);
    }

    /**
     * Builds a question-answering prompt for a specific topic.
     *
     * @param topic           the topic the student is studying
     * @param studentQuestion the student's question text
     * @param learnerAge      the learner's age in years
     * @param difficultyLevel the current adaptive difficulty level (1–10)
     * @return a formatted user-turn prompt string
     */
    public static String buildQuestionPrompt(String topic, String studentQuestion,
                                              int learnerAge, int difficultyLevel) {
        return String.format(
                "[Topic: %s | Age: %d | Level: %d/10]\n\nStudent question: %s",
                topic, learnerAge, difficultyLevel, studentQuestion);
    }

    /**
     * Builds a prompt asking the AI to generate a quiz question on a topic.
     *
     * @param topic      the topic for the question
     * @param difficulty the desired difficulty ("EASY", "MEDIUM", or "HARD")
     * @return a formatted prompt string
     */
    public static String buildQuizGenerationPrompt(String topic, String difficulty) {
        return String.format(
                "Generate a single %s multiple-choice quiz question about '%s'. "
                + "Provide exactly 4 options labelled A, B, C, D. "
                + "Indicate the correct answer and include a one-sentence explanation. "
                + "Format your response as JSON with keys: "
                + "\"question\", \"options\" (array), \"answer\", \"explanation\".",
                difficulty.toLowerCase(), topic);
    }
}
