package com.learnx.ai.strategy;

import com.learnx.core.model.AgeCategory;

public interface PromptStrategy {
    AgeCategory getTargetCategory();
    String getSystemPrompt();
    String formatResponseInstructions();
}
