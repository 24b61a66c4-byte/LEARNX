package com.learnx.ai;

/**
 * Parses raw text responses from the Gemini AI model.
 *
 * <h2>Performance improvements over a naive implementation</h2>
 * <ol>
 *   <li><strong>Single {@code strip()}</strong> – the raw response is stripped exactly once at
 *       the top of the method.  A naive implementation called {@code strip()} both before the
 *       condition check and again on the return value, allocating a second trimmed string that
 *       was identical to the first.</li>
 *   <li><strong>Early index check</strong> – {@code lastIndexOf("```")} is only called when we
 *       know the response starts with a code fence.  In the common case (no fence) it is never
 *       invoked.</li>
 * </ol>
 */
public class AiResponseParser {

    /**
     * Extracts the content from an AI response, stripping markdown code fences if present.
     *
     * <p>Example input:
     * <pre>
     * ```json
     * [{"text": "What is 2+2?", "answer": "4"}]
     * ```
     * </pre>
     * Returns: {@code [{"text": "What is 2+2?", "answer": "4"}]}
     */
    public String extractContent(String rawResponse) {
        // Strip once – avoid allocating a second trimmed copy later.
        String trimmed = rawResponse.strip();

        if (trimmed.startsWith("```")) {
            int lineEnd = trimmed.indexOf('\n');
            int fenceEnd = trimmed.lastIndexOf("```");
            // lastIndexOf returns the position of the opening ``` if there is no closing fence;
            // guard against that by requiring fenceEnd > lineEnd.
            if (lineEnd > 0 && fenceEnd > lineEnd) {
                // Return content between the first newline and the closing fence.
                // No second strip() needed – the content between fences is well-formed.
                return trimmed.substring(lineEnd + 1, fenceEnd).strip();
            }
        }
        return trimmed;
    }

    /**
     * Returns {@code true} when the response is a non-empty, non-error reply.
     */
    public boolean isValidResponse(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return false;
        }
        String lower = rawResponse.toLowerCase();
        return !lower.contains("error") && !lower.contains("i cannot") && !lower.contains("i'm unable");
    }
}
