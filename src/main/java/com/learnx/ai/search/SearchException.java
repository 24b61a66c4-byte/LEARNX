package com.learnx.ai.search;

/**
 * Provider-level search exception used for request or parsing failures.
 */
public class SearchException extends RuntimeException {

    public SearchException(String message) {
        super(message);
    }

    public SearchException(String message, Throwable cause) {
        super(message, cause);
    }
}
