package com.learnx.ai.search;

import com.learnx.ai.model.SearchQuery;
import com.learnx.ai.model.SearchResult;

import java.time.Duration;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Aggregates multiple search providers with parallel execution and deduplication.
 */
public class CompositeSearchProvider implements SearchProvider {

    private final List<SearchProvider> providers;
    private final Duration timeout;

    public CompositeSearchProvider(List<SearchProvider> providers, Duration timeout) {
        this.providers = providers == null ? List.of() : List.copyOf(providers);
        this.timeout = timeout == null ? Duration.ofSeconds(20) : timeout;
    }

    @Override
    public List<SearchResult> search(SearchQuery query) {
        if (providers.isEmpty()) {
            return List.of();
        }

        List<CompletableFuture<List<SearchResult>>> futures = providers.stream()
                .map(provider -> CompletableFuture
                        .supplyAsync(() -> provider.search(query))
                        .completeOnTimeout(List.<SearchResult>of(), timeout.toMillis(), TimeUnit.MILLISECONDS)
                        .exceptionally(exception -> List.<SearchResult>of()))
                .toList();

        Map<String, SearchResult> deduplicated = new LinkedHashMap<>();
        for (CompletableFuture<List<SearchResult>> future : futures) {
            for (SearchResult searchResult : future.join()) {
                String key = normalizeUrl(searchResult.url());
                SearchResult existing = deduplicated.get(key);
                if (existing == null || searchResult.score() > existing.score()) {
                    deduplicated.put(key, searchResult);
                }
            }
        }

        return deduplicated.values().stream()
                .sorted(Comparator.comparingDouble(SearchResult::score).reversed())
                .limit(query.maxResults())
                .toList();
    }

    private String normalizeUrl(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
