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
        boolean fallback,
        AiResponseMeta aiResponse,
        TutorDiagnosis diagnosis) {

    public TutorResponse(
            String explanation,
            String examAnswerOutline,
            List<String> keyPoints,
            List<SearchResult> citations,
            boolean fallback) {
        this(explanation, examAnswerOutline, keyPoints, citations, fallback,
                new AiResponseMeta(explanation, "unknown", "explain", 0),
                null);
    }

    public TutorResponse(
            String explanation,
            String examAnswerOutline,
            List<String> keyPoints,
            List<SearchResult> citations,
            boolean fallback,
            AiResponseMeta aiResponse) {
        this(explanation, examAnswerOutline, keyPoints, citations, fallback, aiResponse, null);
    }

    public TutorResponse {
        explanation = explanation == null ? "" : explanation.trim();
        examAnswerOutline = examAnswerOutline == null ? "" : examAnswerOutline.trim();
        keyPoints = keyPoints == null ? List.of() : List.copyOf(keyPoints);
        citations = citations == null ? List.of() : List.copyOf(citations);
        aiResponse = aiResponse == null ? new AiResponseMeta(explanation, "unknown", "explain", 0) : aiResponse;
    }
}
