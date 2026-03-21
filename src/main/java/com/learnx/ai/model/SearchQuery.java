package com.learnx.ai.model;

/**
 * Normalized search request passed to provider adapters.
 */
public record SearchQuery(
        String query,
        String subjectId,
        String topicId,
        int maxResults
) {

    public SearchQuery {
        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("query must not be blank");
        }
        query = query.trim();
        subjectId = subjectId == null ? "" : subjectId.trim();
        topicId = topicId == null ? "" : topicId.trim();
        maxResults = Math.max(1, maxResults);
    }
}
