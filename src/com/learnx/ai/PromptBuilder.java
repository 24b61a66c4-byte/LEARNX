package com.learnx.ai;

import com.learnx.core.LearnerProfile;

/**
 * Builds prompts for the Gemini AI model.
 *
 * <h2>Performance note: StringBuilder instead of String.format()</h2>
 * <p>{@code String.format()} internally compiles a format string with a regex-based parser on
 * every invocation.  For simple variable substitutions this is significantly slower than plain
 * {@link StringBuilder} concatenation because it allocates a {@code Formatter} object, parses
 * the format pattern, and then builds the result – all on the calling thread.
 *
 * <p>These methods are called for every user interaction (system prompt, question prompt, quiz
 * generation prompt), so using {@link StringBuilder} avoids unnecessary object allocation and
 * regex overhead in the hot path.
 */
public class PromptBuilder {

    /**
     * Builds the system-role prompt that configures the AI's persona for the given learner.
     */
    public String buildSystemPrompt(LearnerProfile profile) {
        // StringBuilder avoids the regex-parsing overhead of String.format() on every call.
        return new StringBuilder(256)
                .append("You are LearnBot Pro, a friendly educational assistant.")
                .append(" The learner is ").append(profile.getAge()).append(" years old")
                .append(" and is currently at difficulty level ").append(profile.getDifficultyLevel())
                .append(" out of 10.")
                .append(" Adapt your vocabulary and explanations to their age and skill level.")
                .append(" Be encouraging, clear, and concise.")
                .toString();
    }

    /**
     * Builds a question-answering prompt for a specific topic and question text.
     */
    public String buildQuestionPrompt(LearnerProfile profile, String topic, String questionText) {
        return new StringBuilder(512)
                .append("Topic: ").append(topic).append('\n')
                .append("Difficulty level: ").append(profile.getDifficultyLevel()).append("/10\n")
                .append("Learner age: ").append(profile.getAge()).append('\n')
                .append("Question: ").append(questionText).append('\n')
                .append("Provide a clear, age-appropriate answer with a brief explanation.")
                .toString();
    }

    /**
     * Builds a prompt that asks the AI to generate quiz questions as a JSON array.
     */
    public String buildQuizGenerationPrompt(LearnerProfile profile, String topic, int count) {
        return new StringBuilder(512)
                .append("Generate ").append(count).append(" quiz questions about '").append(topic)
                .append("' for a learner aged ").append(profile.getAge())
                .append(" at difficulty level ").append(profile.getDifficultyLevel())
                .append("/10.\n")
                .append("Return a JSON array where each element has fields:\n")
                .append("  \"text\"        – the question text\n")
                .append("  \"answer\"      – the correct answer (single word or short phrase)\n")
                .append("  \"explanation\" – a brief explanation of the answer\n")
                .append("Respond with the JSON array only, no markdown fences.")
                .toString();
    }
}
