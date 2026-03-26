package com.learnx.ai.model;

import java.util.List;

/**
 * Structured tutor response returned by LearnX.
 */
public record TutorResponse(
        String explanation,
        String examAnswerOutline,
        List<String> keyPoints,
        List<SearchResult> citations,
        boolean fallback
) {

    public TutorResponse {
        explanation = explanation == null ? "" : explanation.trim();
        examAnswerOutline = examAnswerOutline == null ? "" : examAnswerOutline.trim();
        keyPoints = keyPoints == null ? List.of() : List.copyOf(keyPoints);
        citations = citations == null ? List.of() : List.copyOf(citations);
    }
}
