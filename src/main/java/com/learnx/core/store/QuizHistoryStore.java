package com.learnx.core.store;

import com.learnx.core.model.QuizEvaluation;

import java.util.List;

/**
 * Persistence-neutral quiz evaluation history store.
 */
public interface QuizHistoryStore {

    void append(String learnerId, QuizEvaluation evaluation);

    List<QuizEvaluation> findByLearnerId(String learnerId);
}
