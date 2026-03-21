package com.learnx.ai;

import com.learnx.core.LearnerProfile;

/**
 * Facade for AI-powered tutoring interactions.
 *
 * <p>Delegates prompt building to {@link PromptBuilder} and response parsing to
 * {@link AiResponseParser}.  Actual HTTP calls to the Gemini API are performed by
 * {@link GeminiClient} (injected via constructor for testability).
 */
public class AiService {

    private final GeminiClient client;
    private final PromptBuilder promptBuilder;
    private final AiResponseParser responseParser;

    public AiService(GeminiClient client) {
        this.client = client;
        this.promptBuilder = new PromptBuilder();
        this.responseParser = new AiResponseParser();
    }

    /**
     * Asks the AI a topic-specific question on behalf of the given learner.
     *
     * @param profile      the learner (used to adapt vocabulary and difficulty)
     * @param topic        the subject area being studied
     * @param questionText the learner's question
     * @return the AI's response, with any markdown fences stripped
     */
    public String askQuestion(LearnerProfile profile, String topic, String questionText) {
        String systemPrompt = promptBuilder.buildSystemPrompt(profile);
        String userPrompt = promptBuilder.buildQuestionPrompt(profile, topic, questionText);
        String raw = client.generate(systemPrompt, userPrompt);
        return responseParser.extractContent(raw);
    }

    /**
     * Requests the AI to generate a JSON array of quiz questions for the given topic.
     *
     * @param profile the learner (controls difficulty and age-appropriateness)
     * @param topic   the subject area
     * @param count   the number of questions to generate
     * @return raw JSON string containing the question array
     */
    public String generateQuizJson(LearnerProfile profile, String topic, int count) {
        String systemPrompt = promptBuilder.buildSystemPrompt(profile);
        String userPrompt = promptBuilder.buildQuizGenerationPrompt(profile, topic, count);
        String raw = client.generate(systemPrompt, userPrompt);
        return responseParser.extractContent(raw);
    }
}
