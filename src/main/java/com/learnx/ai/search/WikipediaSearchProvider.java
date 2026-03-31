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
 * Wikipedia search provider using the MediaWiki public API.
 */
public class WikipediaSearchProvider implements SearchProvider {

    static final String ENDPOINT = "https://en.wikipedia.org/w/api.php";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final Duration timeout;
    private final int defaultMaxResults;

    public WikipediaSearchProvider(Duration timeout, int defaultMaxResults) {
        this(HttpClient.newHttpClient(), new ObjectMapper().findAndRegisterModules(), timeout, defaultMaxResults);
    }

    WikipediaSearchProvider(HttpClient httpClient, ObjectMapper objectMapper, Duration timeout, int defaultMaxResults) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.timeout = timeout;
        this.defaultMaxResults = Math.max(1, defaultMaxResults);
    }

    @Override
    public List<SearchResult> search(SearchQuery query) {
        int maxResults = query.maxResults() > 0 ? query.maxResults() : defaultMaxResults;
        List<SearchResult> primary = searchByTerm(query.query(), maxResults);
        if (!primary.isEmpty()) {
            return primary;
        }

        String simplifiedQuery = simplify(query.query());
        if (simplifiedQuery.equals(query.query())) {
            return primary;
        }
        return searchByTerm(simplifiedQuery, maxResults);
    }

    private List<SearchResult> searchByTerm(String term, int maxResults) {
        String encodedQuery = URLEncoder.encode(term, StandardCharsets.UTF_8);
        String url = ENDPOINT + "?action=query&list=search&srsearch=" + encodedQuery
                + "&format=json&utf8=1&srlimit=" + maxResults;

        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .header("Accept", "application/json")
                .header("User-Agent", "LearnX/1.0 (https://learnx.app)")
                .timeout(timeout)
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new SearchException("Wikipedia request failed with status " + response.statusCode());
            }
            return parseResults(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new SearchException("Wikipedia request interrupted", exception);
        } catch (IOException exception) {
            throw new SearchException("Wikipedia request failed", exception);
        }
    }

    private String simplify(String value) {
        String normalized = value.replaceAll("[^A-Za-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        if (normalized.isBlank()) {
            return value;
        }

        String[] tokens = normalized.split(" ");
        int limit = Math.min(tokens.length, 6);
        StringBuilder builder = new StringBuilder();
        for (int index = 0; index < limit; index++) {
            if (index > 0) {
                builder.append(' ');
            }
            builder.append(tokens[index]);
        }
        return builder.toString();
    }

    List<SearchResult> parseResults(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode results = root.path("query").path("search");
            if (!results.isArray()) {
                return List.of();
            }

            List<SearchResult> parsedResults = new ArrayList<>();
            for (JsonNode result : results) {
                String title = result.path("title").asText("").trim();
                if (title.isBlank()) {
                    continue;
                }

                String encodedTitle = URLEncoder.encode(title.replace(' ', '_'), StandardCharsets.UTF_8);
                String snippet = result.path("snippet").asText("").replaceAll("<[^>]+>", "");

                parsedResults.add(new SearchResult(
                        title,
                        "https://en.wikipedia.org/wiki/" + encodedTitle,
                        snippet,
                        "wikipedia",
                        0.67));
            }
            return parsedResults;
        } catch (Exception exception) {
            throw new SearchException("Unable to parse Wikipedia response", exception);
        }
    }
}
