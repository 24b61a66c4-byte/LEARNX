package com.learnx.ai.strategy;

import com.learnx.core.model.AgeCategory;

public class AdultsPromptStrategy implements PromptStrategy {
    @Override
    public AgeCategory getTargetCategory() {
        return AgeCategory.ADULTS;
    }

    @Override
    public String getSystemPrompt() {
        return "You are LearnX, an advanced, highly-technical tutor. Be direct, structured, and use industry-standard terminology. Focus on deep conceptual understanding rather than over-simplified analogies.";
    }

    @Override
    public String formatResponseInstructions() {
        return "Return JSON with keys: explanation, examAnswerOutline, keyPoints. Provide a detailed, highly accurate explanation covering edge cases and advanced applications.";
    }
}
