package com.learnx.ai.provider;

import com.learnx.ai.model.TutorPrompt;
import com.learnx.ai.model.TutorResponse;

import java.util.ArrayList;
import java.util.List;

/**
 * Local fallback tutor used when external AI is unavailable.
 */
public class FallbackAiProvider implements AiProvider {

    @Override
    public TutorResponse generate(TutorPrompt prompt) {
        List<String> keyPoints = new ArrayList<>();
        keyPoints.add("Start with the core definition of " + prompt.topicTitle() + ".");
        keyPoints.add("Relate the concept to exam-ready keywords and standard terminology.");
        keyPoints.add("Practice one worked example or common use-case after revision.");

        String explanation = prompt.topicSummary().isBlank()
                ? "LearnX fallback mode: review the topic from first principles and focus on the main definition, key idea, and one example."
                : prompt.topicSummary();

        String outline = """
                1. Definition and context
                2. Core working principle
                3. Key formula or rule
                4. Typical example or application
                5. Short exam conclusion
                """.trim();

        return new TutorResponse(
                explanation,
                outline,
                keyPoints,
                prompt.searchResults(),
                true
        );
    }
}
