package com.learnx.ai.search;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnx.ai.model.SearchQuery;
import com.learnx.ai.model.SearchResult;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Brave Search adapter using the public web search API.
 */
public class BraveSearchProvider implements SearchProvider {

    static final String ENDPOINT = "https://api.search.brave.com/res/v1/web/search";

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final Duration timeout;
    private final int defaultMaxResults;

    public BraveSearchProvider(String apiKey, Duration timeout, int defaultMaxResults) {
        this(apiKey, HttpClient.newHttpClient(), new ObjectMapper().findAndRegisterModules(), timeout, defaultMaxResults);
    }

    BraveSearchProvider(String apiKey, HttpClient httpClient, ObjectMapper objectMapper, Duration timeout, int defaultMaxResults) {
        this.apiKey = apiKey;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.timeout = timeout;
        this.defaultMaxResults = Math.max(1, defaultMaxResults);
    }

    @Override
    public List<SearchResult> search(SearchQuery query) {
        ensureConfigured(apiKey, "Brave Search");

        int maxResults = query.maxResults() > 0 ? query.maxResults() : defaultMaxResults;
        String encodedQuery = URLEncoder.encode(query.query(), StandardCharsets.UTF_8);
        URI uri = URI.create(ENDPOINT + "?q=" + encodedQuery + "&count=" + maxResults);

        HttpRequest request = HttpRequest.newBuilder(uri)
                .header("Accept", "application/json")
                .header("X-Subscription-Token", apiKey)
                .timeout(timeout)
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new SearchException("Brave Search request failed with status " + response.statusCode());
            }
            return parseResults(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new SearchException("Brave Search request interrupted", exception);
        } catch (IOException exception) {
            throw new SearchException("Brave Search request failed", exception);
        }
    }

    List<SearchResult> parseResults(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode results = root.path("web").path("results");
            if (!results.isArray()) {
                return List.of();
            }

            List<SearchResult> parsedResults = new ArrayList<>();
            for (JsonNode result : results) {
                String url = result.path("url").asText("");
                if (url.isBlank()) {
                    continue;
                }
                parsedResults.add(new SearchResult(
                        result.path("title").asText("Untitled"),
                        url,
                        result.path("description").asText(""),
                        "brave",
                        0.75
                ));
            }
            return parsedResults;
        } catch (Exception exception) {
            throw new SearchException("Unable to parse Brave Search response", exception);
        }
    }

    private void ensureConfigured(String value, String providerName) {
        if (value == null || value.isBlank()) {
            throw new SearchException(providerName + " API key is not configured");
        }
    }
}
