package com.learnx.ai.strategy;

import com.learnx.core.model.AgeCategory;
import java.util.Map;
import java.util.EnumMap;

public class PromptStrategyFactory {
    
    private static final Map<AgeCategory, PromptStrategy> STRATEGIES = new EnumMap<>(AgeCategory.class);

    static {
        STRATEGIES.put(AgeCategory.KIDS, new KidsPromptStrategy());
        STRATEGIES.put(AgeCategory.ADULTS, new AdultsPromptStrategy());
        // For brevity, using adults/kids for tweens/teens right now. We can expand later.
        STRATEGIES.put(AgeCategory.TWEENS, new KidsPromptStrategy());
        STRATEGIES.put(AgeCategory.TEENS, new AdultsPromptStrategy());
    }

    public static PromptStrategy getStrategy(AgeCategory category) {
        if (category == null) return STRATEGIES.get(AgeCategory.TEENS);
        return STRATEGIES.get(category);
    }
}
