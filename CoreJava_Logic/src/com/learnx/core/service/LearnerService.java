package com.learnx.core.service;

import com.learnx.core.model.Learner;
import com.learnx.core.model.PerformanceMetrics;

/**
 * Service interface for managing learner profiles and retrieving
 * historical performance data.
 */
public interface LearnerService {

    /**
     * Registers a new learner in the system.
     *
     * @param learner the learner to register
     * @return the registered learner with an assigned ID
     */
    Learner register(Learner learner);

    /**
     * Retrieves a learner by their unique ID.
     *
     * @param id the learner's ID
     * @return the matching {@link Learner}, or {@code null} if not found
     */
    Learner findById(int id);

    /**
     * Retrieves the most recent performance metrics for a learner on a given topic.
     *
     * @param learnerId the learner's ID
     * @param topicId   the topic identifier
     * @return the latest {@link PerformanceMetrics}, or {@code null} if none exist
     */
    PerformanceMetrics getLatestPerformance(int learnerId, String topicId);

    /**
     * Persists performance metrics after a learning session.
     *
     * @param metrics the metrics to save
     */
    void savePerformance(PerformanceMetrics metrics);
}
