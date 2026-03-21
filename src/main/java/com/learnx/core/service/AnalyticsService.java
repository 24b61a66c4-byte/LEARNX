package com.learnx.core.service;

import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.PerformanceSnapshot;
import com.learnx.core.model.Topic;
import com.learnx.core.model.TopicProgress;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Derives learner performance summaries from tracked progress state.
 */
public class AnalyticsService {

    private final CatalogService catalogService;

    public AnalyticsService(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    public PerformanceSnapshot buildSnapshot(LearnerProfile learnerProfile, String subjectId) {
        List<Topic> subjectTopics = catalogService.getTopicsForSubject(subjectId);
        Map<String, Double> topicAccuracy = new LinkedHashMap<>();
        List<String> weakTopicIds = new java.util.ArrayList<>();
        List<String> strongTopicIds = new java.util.ArrayList<>();

        for (Topic topic : subjectTopics) {
            TopicProgress progress = learnerProfile.getTopicProgress().get(topic.id());
            if (progress == null) {
                continue;
            }
            topicAccuracy.put(topic.id(), progress.getAccuracy());
            if (progress.isWeakTopic()) {
                weakTopicIds.add(topic.id());
            }
            if (progress.isStrongTopic()) {
                strongTopicIds.add(topic.id());
            }
        }

        double recentAverageScore = learnerProfile.getRecentScores().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        double practiceFrequencyPerWeek = calculatePracticeFrequencyPerWeek(learnerProfile);

        return new PerformanceSnapshot(
                learnerProfile.getOverallAccuracy(),
                recentAverageScore,
                practiceFrequencyPerWeek,
                weakTopicIds,
                strongTopicIds,
                topicAccuracy
        );
    }

    private double calculatePracticeFrequencyPerWeek(LearnerProfile learnerProfile) {
        Duration duration = Duration.between(learnerProfile.getCreatedAt(), LocalDateTime.now());
        double weeks = Math.max(1.0, duration.toDays() / 7.0);
        return learnerProfile.getTotalQuizzesTaken() / weeks;
    }
}
