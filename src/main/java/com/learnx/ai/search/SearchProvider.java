package com.learnx.ai.search;

import com.learnx.ai.model.SearchQuery;
import com.learnx.ai.model.SearchResult;

import java.util.List;

/**
 * Common interface for search provider adapters.
 */
public interface SearchProvider {

    List<SearchResult> search(SearchQuery query);
}
