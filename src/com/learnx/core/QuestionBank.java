package com.learnx.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * In-memory repository of quiz questions, indexed by topic and difficulty.
 *
 * <p>Performance note: questions are pre-grouped into a {@code Map<topic, Map<difficulty, List>>}
 * at load time. This makes {@link #getQuestions(String, int)} an O(1) map lookup instead of
 * scanning the entire question list on every quiz start.
 */
public class QuestionBank {

    // topic → difficulty → questions
    private final Map<String, Map<Integer, List<Question>>> index = new HashMap<>();

    /**
     * Adds a question to the bank under the given topic and updates the index immediately.
     *
     * @param topic    the subject area this question belongs to (e.g. "math", "science")
     * @param question the question to add
     */
    public void addQuestion(String topic, Question question) {
        index
            .computeIfAbsent(topic, k -> new HashMap<>())
            .computeIfAbsent(question.getDifficultyLevel(), k -> new ArrayList<>())
            .add(question);
    }

    /**
     * Returns all questions for the given topic at the specified difficulty level.
     *
     * <p>This is an O(1) map lookup; no linear scan is performed.
     *
     * @return an unmodifiable view of the matching questions, or an empty list
     */
    public List<Question> getQuestions(String topic, int difficultyLevel) {
        Map<Integer, List<Question>> byDifficulty = index.get(topic);
        if (byDifficulty == null) {
            return Collections.emptyList();
        }
        List<Question> questions = byDifficulty.get(difficultyLevel);
        return questions != null ? Collections.unmodifiableList(questions) : Collections.emptyList();
    }

    /**
     * Returns all topics currently in the bank.
     */
    public List<String> getTopics() {
        return new ArrayList<>(index.keySet());
    }
}
