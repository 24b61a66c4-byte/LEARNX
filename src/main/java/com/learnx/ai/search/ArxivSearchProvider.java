package com.learnx.ai.search;

import com.learnx.ai.model.SearchQuery;
import com.learnx.ai.model.SearchResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.IOException;
import java.io.StringReader;
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
 * arXiv search provider using the public Atom feed endpoint.
 */
public class ArxivSearchProvider implements SearchProvider {

    static final String ENDPOINT = "https://export.arxiv.org/api/query";

    private final HttpClient httpClient;
    private final Duration timeout;
    private final int defaultMaxResults;

    public ArxivSearchProvider(Duration timeout, int defaultMaxResults) {
        this(HttpClient.newHttpClient(), timeout, defaultMaxResults);
    }

    ArxivSearchProvider(HttpClient httpClient, Duration timeout, int defaultMaxResults) {
        this.httpClient = httpClient;
        this.timeout = timeout;
        this.defaultMaxResults = Math.max(1, defaultMaxResults);
    }

    @Override
    public List<SearchResult> search(SearchQuery query) {
        int maxResults = query.maxResults() > 0 ? query.maxResults() : defaultMaxResults;
        String encodedQuery = URLEncoder.encode("all:" + query.query(), StandardCharsets.UTF_8);
        String url = ENDPOINT + "?search_query=" + encodedQuery + "&start=0&max_results=" + maxResults;

        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .header("Accept", "application/atom+xml")
                .timeout(timeout)
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new SearchException("arXiv request failed with status " + response.statusCode());
            }
            return parseResults(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new SearchException("arXiv request interrupted", exception);
        } catch (IOException exception) {
            throw new SearchException("arXiv request failed", exception);
        }
    }

    List<SearchResult> parseResults(String body) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(false);
            Document document = factory.newDocumentBuilder().parse(new InputSource(new StringReader(body)));
            NodeList entries = document.getElementsByTagName("entry");

            List<SearchResult> parsedResults = new ArrayList<>();
            for (int index = 0; index < entries.getLength(); index++) {
                Element entry = (Element) entries.item(index);
                String title = textOf(entry, "title");
                String id = textOf(entry, "id");
                String summary = textOf(entry, "summary");

                if (id.isBlank()) {
                    continue;
                }

                parsedResults.add(new SearchResult(
                        title.isBlank() ? "arXiv paper" : title,
                        id,
                        summary,
                        "arxiv",
                        0.69));
            }
            return parsedResults;
        } catch (Exception exception) {
            throw new SearchException("Unable to parse arXiv response", exception);
        }
    }

    private String textOf(Element element, String tagName) {
        NodeList nodes = element.getElementsByTagName(tagName);
        if (nodes.getLength() == 0 || nodes.item(0) == null || nodes.item(0).getTextContent() == null) {
            return "";
        }
        return nodes.item(0).getTextContent().trim().replaceAll("\\s+", " ");
    }
}
