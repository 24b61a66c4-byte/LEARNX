package com.learnx.ai.model;

import java.util.List;

public record TutorDiagnosis(
        String subjectId,
        String topicId,
        List<String> weakConcepts,
        double confidence,
        SuggestedDrill suggestedDrill,
        String nextAction) {

    public TutorDiagnosis {
        subjectId = subjectId == null ? "" : subjectId.trim();
        topicId = topicId == null ? "" : topicId.trim();
        weakConcepts = weakConcepts == null ? List.of() : List.copyOf(weakConcepts);
        confidence = Math.max(0.0, Math.min(1.0, confidence));
        nextAction = nextAction == null ? "" : nextAction.trim();
    }
}
