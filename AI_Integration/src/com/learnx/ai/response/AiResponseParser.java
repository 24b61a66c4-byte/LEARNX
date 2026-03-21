package com.learnx.ai.response;

/**
 * Parses and validates a raw text response from the Gemini model.
 */
public class AiResponseParser {

    private AiResponseParser() {}

    /**
     * Extracts a JSON block from a raw model response.
     * Gemini sometimes wraps JSON in markdown code fences; this method strips them.
     *
     * @param rawResponse the raw text returned by the model
     * @return the extracted JSON string, or the original string if no fences found
     */
    public static String extractJson(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) return "";
        String trimmed = rawResponse.strip();
        // Strip ```json ... ``` or ``` ... ``` fences
        if (trimmed.startsWith("```")) {
            int start = trimmed.indexOf('\n') + 1;
            int end   = trimmed.lastIndexOf("```");
            if (start > 0 && end > start) {
                return trimmed.substring(start, end).strip();
            }
        }
        return trimmed;
    }

    /**
     * Returns {@code true} if the response appears to contain valid JSON.
     *
     * @param text the text to check
     * @return {@code true} if the text starts with {@code {} or {@code [}
     */
    public static boolean looksLikeJson(String text) {
        if (text == null || text.isBlank()) return false;
        String t = text.strip();
        return t.startsWith("{") || t.startsWith("[");
    }
}
