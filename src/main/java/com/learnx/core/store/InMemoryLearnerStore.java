package com.learnx.core.store;

import com.learnx.core.model.LearnerProfile;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Simple in-memory learner store for local runs and tests.
 */
public class InMemoryLearnerStore implements LearnerStore {

    private final ConcurrentMap<String, LearnerProfile> learnersById = new ConcurrentHashMap<>();

    @Override
    public Optional<LearnerProfile> findById(String learnerId) {
        return Optional.ofNullable(learnersById.get(learnerId));
    }

    @Override
    public void save(LearnerProfile learnerProfile) {
        learnersById.put(learnerProfile.getLearnerId(), learnerProfile);
    }

    @Override
    public List<LearnerProfile> findAll() {
        return List.copyOf(learnersById.values());
    }
}
