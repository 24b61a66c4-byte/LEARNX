package com.learnx.core.store;

import com.learnx.core.service.CatalogData;

/**
 * Source of catalog data for subjects, topics, exams, and questions.
 */
public interface CatalogStore {

    CatalogData loadCatalog();
}
