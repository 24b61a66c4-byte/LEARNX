package com.learnx.ai.search;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnx.ai.model.SearchQuery;
import com.learnx.ai.model.SearchResult;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Tavily adapter using the search API for grounding results.
 */
public class TavilySearchProvider implements SearchProvider {

    static final String ENDPOINT = "https://api.tavily.com/search";

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final Duration timeout;
    private final int defaultMaxResults;

    public TavilySearchProvider(String apiKey, Duration timeout, int defaultMaxResults) {
        this(apiKey, HttpClient.newHttpClient(), new ObjectMapper().findAndRegisterModules(), timeout, defaultMaxResults);
    }

    TavilySearchProvider(String apiKey, HttpClient httpClient, ObjectMapper objectMapper, Duration timeout, int defaultMaxResults) {
        this.apiKey = apiKey;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.timeout = timeout;
        this.defaultMaxResults = Math.max(1, defaultMaxResults);
    }

    @Override
    public List<SearchResult> search(SearchQuery query) {
        ensureConfigured(apiKey, "Tavily");

        int maxResults = query.maxResults() > 0 ? query.maxResults() : defaultMaxResults;
        String body;
        try {
            body = objectMapper.writeValueAsString(Map.of(
                    "api_key", apiKey,
                    "query", query.query(),
                    "search_depth", "basic",
                    "include_answer", false,
                    "max_results", maxResults
            ));
        } catch (Exception exception) {
            throw new SearchException("Unable to create Tavily request", exception);
        }

        HttpRequest request = HttpRequest.newBuilder(URI.create(ENDPOINT))
                .header("Content-Type", "application/json")
                .timeout(timeout)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new SearchException("Tavily request failed with status " + response.statusCode());
            }
            return parseResults(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new SearchException("Tavily request interrupted", exception);
        } catch (IOException exception) {
            throw new SearchException("Tavily request failed", exception);
        }
    }

    List<SearchResult> parseResults(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode results = root.path("results");
            if (!results.isArray()) {
                return List.of();
            }

            List<SearchResult> parsedResults = new ArrayList<>();
            for (JsonNode result : results) {
                String url = result.path("url").asText("");
                if (url.isBlank()) {
                    continue;
                }
                double score = result.has("score") ? Math.max(0.0, Math.min(1.0, result.path("score").asDouble(0.7))) : 0.7;
                parsedResults.add(new SearchResult(
                        result.path("title").asText("Untitled"),
                        url,
                        result.path("content").asText(""),
                        "tavily",
                        score
                ));
            }
            return parsedResults;
        } catch (Exception exception) {
            throw new SearchException("Unable to parse Tavily response", exception);
        }
    }

    private void ensureConfigured(String value, String providerName) {
        if (value == null || value.isBlank()) {
            throw new SearchException(providerName + " API key is not configured");
        }
    }
}
