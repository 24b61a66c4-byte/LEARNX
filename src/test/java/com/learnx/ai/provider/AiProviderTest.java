package com.learnx.ai.provider;

import com.learnx.ai.model.TutorPrompt;
import com.learnx.ai.model.TutorResponse;
import com.learnx.core.model.AgeCategory;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AiProviderTest {

    @Test
    void fallbackProviderProducesSafeTutorResponse() {
        AiProvider provider = new FallbackAiProvider();

        TutorResponse response = provider.generate(new TutorPrompt(
                "DBMS",
                "Normalization",
                "Normalization reduces redundancy and anomalies.",
                "JNTU R22 DBMS",
                "Overall accuracy=0.40",
                "",
                "Explain normalization in exam style",
                List.of(),
                AgeCategory.TEENS));

        assertTrue(response.fallback());
        assertFalse(response.explanation().isBlank());
    }
}
