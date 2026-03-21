package com.learnx.ai.search;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnx.ai.model.SearchResult;
import org.junit.jupiter.api.Test;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TavilySearchProviderTest {

    @Test
    void parsesTavilyResults() {
        TavilySearchProvider provider = new TavilySearchProvider(
                "test-key",
                HttpClient.newHttpClient(),
                new ObjectMapper(),
                Duration.ofSeconds(5),
                5
        );

        List<SearchResult> results = provider.parseResults("""
                {
                  "results": [
                    {
                      "title": "Normalization Basics",
                      "url": "https://example.com/normalization",
                      "content": "Normalization reduces redundancy.",
                      "score": 0.91
                    }
                  ]
                }
                """);

        assertEquals(1, results.size());
        assertEquals("tavily", results.get(0).provider());
    }
}
