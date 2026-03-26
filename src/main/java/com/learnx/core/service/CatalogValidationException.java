package com.learnx.core.service;

/**
 * Raised when seeded catalog data is inconsistent or invalid.
 */
public class CatalogValidationException extends RuntimeException {

    public CatalogValidationException(String message) {
        super(message);
    }
}
