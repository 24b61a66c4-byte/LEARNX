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
 * Pexels video search provider for free stock explainer videos.
 */
public class PexelsVideoSearchProvider implements SearchProvider {

    static final String ENDPOINT = "https://api.pexels.com/videos/search";

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final Duration timeout;
    private final int defaultMaxResults;

    public PexelsVideoSearchProvider(String apiKey, Duration timeout, int defaultMaxResults) {
        this(apiKey, HttpClient.newHttpClient(), new ObjectMapper().findAndRegisterModules(), timeout,
                defaultMaxResults);
    }

    PexelsVideoSearchProvider(String apiKey, HttpClient httpClient, ObjectMapper objectMapper, Duration timeout,
            int defaultMaxResults) {
        this.apiKey = apiKey;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.timeout = timeout;
        this.defaultMaxResults = Math.max(1, defaultMaxResults);
    }

    @Override
    public List<SearchResult> search(SearchQuery query) {
        ensureConfigured(apiKey, "Pexels");

        int maxResults = query.maxResults() > 0 ? query.maxResults() : defaultMaxResults;
        String encodedQuery = URLEncoder.encode(query.query(), StandardCharsets.UTF_8);
        String url = ENDPOINT + "?query=" + encodedQuery + "&per_page=" + maxResults;

        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .header("Authorization", apiKey)
                .header("Accept", "application/json")
                .timeout(timeout)
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new SearchException("Pexels request failed with status " + response.statusCode());
            }
            return parseResults(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new SearchException("Pexels request interrupted", exception);
        } catch (IOException exception) {
            throw new SearchException("Pexels request failed", exception);
        }
    }

    List<SearchResult> parseResults(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode results = root.path("videos");
            if (!results.isArray()) {
                return List.of();
            }

            List<SearchResult> parsedResults = new ArrayList<>();
            for (JsonNode result : results) {
                String url = result.path("url").asText("").trim();
                if (url.isBlank()) {
                    continue;
                }

                String photographer = result.path("user").path("name").asText("Pexels");
                int duration = result.path("duration").asInt(0);

                parsedResults.add(new SearchResult(
                        "Pexels video by " + photographer,
                        url,
                        "Free stock video" + (duration > 0 ? (" (" + duration + "s)") : ""),
                        "pexels",
                        0.73));
            }
            return parsedResults;
        } catch (Exception exception) {
            throw new SearchException("Unable to parse Pexels response", exception);
        }
    }

    private void ensureConfigured(String value, String providerName) {
        if (value == null || value.isBlank()) {
            throw new SearchException(providerName + " API key is not configured");
        }
    }
}
