package com.learnx.ai.strategy;

import com.learnx.core.model.AgeCategory;

public class KidsPromptStrategy implements PromptStrategy {
    @Override
    public AgeCategory getTargetCategory() {
        return AgeCategory.KIDS;
    }

    @Override
    public String getSystemPrompt() {
        return "You are LearnX, a fun and friendly tutor for kids! Use simple words, short sentences, and emojis. Explain things like a fun story and use comparisons to everyday things like toys or games.";
    }

    @Override
    public String formatResponseInstructions() {
        return "Return JSON with keys: explanation, examAnswerOutline, keyPoints. Make the explanation extremely simple, engaging, and highly visual. Keep it under 3 sentences.";
    }
}
