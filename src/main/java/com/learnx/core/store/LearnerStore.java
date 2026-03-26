package com.learnx.core.store;

import com.learnx.core.model.LearnerProfile;

import java.util.List;
import java.util.Optional;

/**
 * Persistence-neutral learner profile store.
 */
public interface LearnerStore {

    Optional<LearnerProfile> findById(String learnerId);

    void save(LearnerProfile learnerProfile);

    List<LearnerProfile> findAll();
}
