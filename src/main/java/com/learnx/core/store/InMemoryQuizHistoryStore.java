package com.learnx.core.store;

import com.learnx.core.model.QuizEvaluation;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory quiz history store for local runs and tests.
 */
public class InMemoryQuizHistoryStore implements QuizHistoryStore {

    private final Map<String, List<QuizEvaluation>> evaluationsByLearnerId = new ConcurrentHashMap<>();

    @Override
    public void append(String learnerId, QuizEvaluation evaluation) {
        evaluationsByLearnerId.computeIfAbsent(learnerId, key -> new ArrayList<>()).add(evaluation);
    }

    @Override
    public List<QuizEvaluation> findByLearnerId(String learnerId) {
        return List.copyOf(evaluationsByLearnerId.getOrDefault(learnerId, List.of()));
    }
}
