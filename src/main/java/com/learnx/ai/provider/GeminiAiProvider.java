package com.learnx.ai.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnx.ai.model.TutorPrompt;
import com.learnx.ai.model.TutorResponse;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.request.ResponseFormat;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;

import java.time.Duration;
import java.util.List;

/**
 * Gemini-backed tutor provider implemented through LangChain4j.
 */
public class GeminiAiProvider implements AiProvider {

    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    public GeminiAiProvider(String apiKey, String modelName, Duration timeout) {
        this(
                GoogleAiGeminiChatModel.builder()
                        .apiKey(apiKey)
                        .modelName(modelName)
                        .temperature(0.2)
                        .timeout(timeout)
                        .responseFormat(ResponseFormat.JSON)
                        .build(),
                new ObjectMapper().findAndRegisterModules()
        );
    }

    GeminiAiProvider(ChatModel chatModel, ObjectMapper objectMapper) {
        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
    }

    @Override
    public TutorResponse generate(TutorPrompt prompt) {
        try {
            String json = chatModel.chat(prompt.toPromptText());
            return parseJsonResponse(json, prompt);
        } catch (Exception exception) {
            throw new IllegalStateException("Gemini generation failed", exception);
        }
    }

    TutorResponse parseJsonResponse(String json, TutorPrompt prompt) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        String explanation = text(root, "explanation", prompt.topicSummary());
        String outline = text(root, "examAnswerOutline", "1. Definition\n2. Core explanation\n3. Example\n4. Conclusion");
        List<String> keyPoints = root.has("keyPoints") && root.get("keyPoints").isArray()
                ? objectMapper.convertValue(root.get("keyPoints"), objectMapper.getTypeFactory().constructCollectionType(List.class, String.class))
                : List.of("Revise the definition", "Focus on key points", "Practice a short answer");

        return new TutorResponse(
                explanation,
                outline,
                keyPoints,
                prompt.searchResults(),
                false
        );
    }

    private String text(JsonNode root, String fieldName, String fallback) {
        JsonNode node = root.get(fieldName);
        if (node == null || node.isNull() || node.asText().isBlank()) {
            return fallback;
        }
        return node.asText().trim();
    }
}
