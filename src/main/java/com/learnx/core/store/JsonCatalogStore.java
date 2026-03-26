package com.learnx.core.store;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnx.core.service.CatalogData;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;

/**
 * Loads the LearnX catalog from a JSON classpath resource.
 */
public class JsonCatalogStore implements CatalogStore {

    private final ObjectMapper objectMapper;
    private final String resourcePath;

    public JsonCatalogStore() {
        this(new ObjectMapper().findAndRegisterModules(), "catalog.json");
    }

    public JsonCatalogStore(ObjectMapper objectMapper, String resourcePath) {
        this.objectMapper = objectMapper;
        this.resourcePath = resourcePath == null || resourcePath.isBlank() ? "catalog.json" : resourcePath;
    }

    @Override
    public CatalogData loadCatalog() {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        try (InputStream inputStream = classLoader.getResourceAsStream(resourcePath)) {
            if (inputStream == null) {
                throw new IllegalStateException("Catalog resource not found: " + resourcePath);
            }
            return objectMapper.readValue(inputStream, CatalogData.class);
        } catch (IOException exception) {
            throw new UncheckedIOException("Unable to load catalog resource: " + resourcePath, exception);
        }
    }
}
