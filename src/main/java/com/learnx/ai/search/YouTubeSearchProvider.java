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
 * YouTube Data API provider for learning videos.
 */
public class YouTubeSearchProvider implements SearchProvider {

    static final String ENDPOINT = "https://www.googleapis.com/youtube/v3/search";

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final Duration timeout;
    private final int defaultMaxResults;

    public YouTubeSearchProvider(String apiKey, Duration timeout, int defaultMaxResults) {
        this(apiKey, HttpClient.newHttpClient(), new ObjectMapper().findAndRegisterModules(), timeout,
                defaultMaxResults);
    }

    YouTubeSearchProvider(String apiKey, HttpClient httpClient, ObjectMapper objectMapper, Duration timeout,
            int defaultMaxResults) {
        this.apiKey = apiKey;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.timeout = timeout;
        this.defaultMaxResults = Math.max(1, defaultMaxResults);
    }

    @Override
    public List<SearchResult> search(SearchQuery query) {
        ensureConfigured(apiKey, "YouTube");

        int maxResults = query.maxResults() > 0 ? query.maxResults() : defaultMaxResults;
        String encodedQuery = URLEncoder.encode(query.query(), StandardCharsets.UTF_8);
        String url = ENDPOINT + "?part=snippet&type=video&q=" + encodedQuery + "&maxResults=" + maxResults
                + "&key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8);

        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .header("Accept", "application/json")
                .timeout(timeout)
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new SearchException("YouTube request failed with status " + response.statusCode());
            }
            return parseResults(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new SearchException("YouTube request interrupted", exception);
        } catch (IOException exception) {
            throw new SearchException("YouTube request failed", exception);
        }
    }

    List<SearchResult> parseResults(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode results = root.path("items");
            if (!results.isArray()) {
                return List.of();
            }

            List<SearchResult> parsedResults = new ArrayList<>();
            for (JsonNode result : results) {
                String videoId = result.path("id").path("videoId").asText("").trim();
                if (videoId.isBlank()) {
                    continue;
                }

                JsonNode snippet = result.path("snippet");
                parsedResults.add(new SearchResult(
                        snippet.path("title").asText("YouTube video"),
                        "https://www.youtube.com/watch?v=" + videoId,
                        snippet.path("description").asText(""),
                        "youtube",
                        0.79));
            }
            return parsedResults;
        } catch (Exception exception) {
            throw new SearchException("Unable to parse YouTube response", exception);
        }
    }

    private void ensureConfigured(String value, String providerName) {
        if (value == null || value.isBlank()) {
            throw new SearchException(providerName + " API key is not configured");
        }
    }
}
