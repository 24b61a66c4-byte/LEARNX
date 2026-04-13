package com.learnx.ai.model;

public record SuggestedDrill(
        String subjectId,
        String topicId,
        int questionCount,
        String href,
        String reason) {

    public SuggestedDrill {
        subjectId = subjectId == null ? "" : subjectId.trim();
        topicId = topicId == null ? "" : topicId.trim();
        questionCount = Math.max(1, questionCount);
        href = href == null ? "" : href.trim();
        reason = reason == null ? "" : reason.trim();
    }
}
