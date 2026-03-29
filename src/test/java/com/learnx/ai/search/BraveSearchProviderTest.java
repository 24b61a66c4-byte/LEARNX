package com.learnx.ai.search;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnx.ai.model.SearchResult;
import org.junit.jupiter.api.Test;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BraveSearchProviderTest {

    @Test
    void parsesBraveSearchResults() {
        BraveSearchProvider provider = new BraveSearchProvider(
                "test-key",
                HttpClient.newHttpClient(),
                new ObjectMapper(),
                Duration.ofSeconds(5),
                5
        );

        List<SearchResult> results = provider.parseResults("""
                {
                  "web": {
                    "results": [
                      {
                        "title": "SQL WHERE Clause",
                        "url": "https://example.com/sql-where",
                        "description": "Filtering rows in SQL."
                      }
                    ]
                  }
                }
                """);

        assertEquals(1, results.size());
        assertEquals("https://example.com/sql-where", results.get(0).url());
    }
}
