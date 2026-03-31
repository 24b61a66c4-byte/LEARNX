package com.learnx.ai.search;

import com.learnx.ai.model.SearchQuery;
import com.learnx.ai.model.SearchResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Aggregates multiple search providers with parallel execution and
 * deduplication.
 */
public class CompositeSearchProvider implements SearchProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(CompositeSearchProvider.class);

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
                        .exceptionally(exception -> {
                            LOGGER.warn("Search provider failed: {}", provider.getClass().getSimpleName(), exception);
                            return List.<SearchResult>of();
                        }))
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

        List<SearchResult> ranked = deduplicated.values().stream()
                .sorted(Comparator.comparingDouble(SearchResult::score).reversed())
                .toList();

        Map<String, List<SearchResult>> byProvider = new LinkedHashMap<>();
        for (SearchResult result : ranked) {
            byProvider.computeIfAbsent(result.provider(), ignored -> new java.util.ArrayList<>()).add(result);
        }

        Set<String> selectedUrls = new LinkedHashSet<>();
        List<SearchResult> selected = new java.util.ArrayList<>();

        // First pass: keep provider diversity for small result windows.
        for (List<SearchResult> providerResults : byProvider.values()) {
            if (selected.size() >= query.maxResults()) {
                break;
            }
            SearchResult top = providerResults.get(0);
            String key = normalizeUrl(top.url());
            if (selectedUrls.add(key)) {
                selected.add(top);
            }
        }

        // Second pass: fill remaining slots by global relevance.
        for (SearchResult result : ranked) {
            if (selected.size() >= query.maxResults()) {
                break;
            }
            String key = normalizeUrl(result.url());
            if (selectedUrls.add(key)) {
                selected.add(result);
            }
        }

        return selected;
    }

    private String normalizeUrl(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
