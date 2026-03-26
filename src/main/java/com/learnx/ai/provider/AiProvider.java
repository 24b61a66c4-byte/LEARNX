package com.learnx.ai.provider;

import com.learnx.ai.model.TutorPrompt;
import com.learnx.ai.model.TutorResponse;

/**
 * Common AI provider contract for tutor generation.
 */
public interface AiProvider {

    TutorResponse generate(TutorPrompt prompt);
}
