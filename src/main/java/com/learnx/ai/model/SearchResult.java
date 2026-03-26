package com.learnx.ai.model;

/**
 * Normalized search result independent of the underlying provider.
 */
public record SearchResult(
        String title,
        String url,
        String snippet,
        String provider,
        double score
) {

    public SearchResult {
        title = title == null ? "" : title.trim();
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("url must not be blank");
        }
        url = url.trim();
        snippet = snippet == null ? "" : snippet.trim();
        provider = provider == null ? "unknown" : provider.trim();
        score = Math.max(0.0, Math.min(1.0, score));
    }
}
