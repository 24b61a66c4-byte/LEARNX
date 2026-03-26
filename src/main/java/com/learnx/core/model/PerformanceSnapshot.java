package com.learnx.core.model;

import java.util.List;
import java.util.Map;

/**
 * Analytics summary derived from a learner profile.
 */
public record PerformanceSnapshot(
        double overallAccuracy,
        double recentAverageScore,
        double practiceFrequencyPerWeek,
        List<String> weakTopicIds,
        List<String> strongTopicIds,
        Map<String, Double> topicAccuracy
) {

    public PerformanceSnapshot {
        overallAccuracy = clamp(overallAccuracy);
        recentAverageScore = clamp(recentAverageScore);
        practiceFrequencyPerWeek = Math.max(0.0, practiceFrequencyPerWeek);
        weakTopicIds = weakTopicIds == null ? List.of() : List.copyOf(weakTopicIds);
        strongTopicIds = strongTopicIds == null ? List.of() : List.copyOf(strongTopicIds);
        topicAccuracy = topicAccuracy == null ? Map.of() : Map.copyOf(topicAccuracy);
    }

    private static double clamp(double value) {
        return Math.max(0.0, Math.min(1.0, value));
    }
}
