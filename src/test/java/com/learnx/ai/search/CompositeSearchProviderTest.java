package com.learnx.ai.search;

import com.learnx.ai.model.SearchQuery;
import com.learnx.ai.model.SearchResult;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CompositeSearchProviderTest {

    @Test
    void mergesAndDeduplicatesResultsAcrossProviders() {
        SearchProvider providerOne = query -> List.of(
                new SearchResult("A", "https://example.com/a", "alpha", "one", 0.6),
                new SearchResult("B", "https://example.com/shared", "shared-one", "one", 0.5)
        );
        SearchProvider providerTwo = query -> List.of(
                new SearchResult("Shared", "https://example.com/shared", "shared-two", "two", 0.9),
                new SearchResult("C", "https://example.com/c", "charlie", "two", 0.7)
        );

        CompositeSearchProvider composite = new CompositeSearchProvider(List.of(providerOne, providerTwo), Duration.ofSeconds(2));
        List<SearchResult> results = composite.search(new SearchQuery("dbms joins", "dbms", "dbms-joins", 5));

        assertEquals(3, results.size());
        assertEquals("two", results.get(0).provider());
    }

    @Test
    void toleratesProviderFailure() {
        SearchProvider failingProvider = query -> {
            throw new SearchException("boom");
        };
        SearchProvider healthyProvider = query -> List.of(
                new SearchResult("A", "https://example.com/a", "alpha", "healthy", 0.8)
        );

        CompositeSearchProvider composite = new CompositeSearchProvider(List.of(failingProvider, healthyProvider), Duration.ofSeconds(2));
        List<SearchResult> results = composite.search(new SearchQuery("sql", "dbms", "dbms-sql-basics", 5));

        assertEquals(1, results.size());
        assertEquals("healthy", results.get(0).provider());
    }
}
