package com.learnx.core.engine;

import com.learnx.core.model.ExamContext;
import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.StudyRecommendation;
import com.learnx.core.model.Topic;
import com.learnx.core.model.TopicProgress;
import com.learnx.core.service.CatalogService;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Chooses the next best study action using prerequisites, weakness, recency, and exam weight.
 */
public class RecommendationEngine {

    private static final double PREREQUISITE_READY_THRESHOLD = 0.6;
    private static final double MASTERED_THRESHOLD = 0.8;

    private final CatalogService catalogService;

    public RecommendationEngine(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    public StudyRecommendation recommendNextStep(LearnerProfile learnerProfile, String subjectId, String examContextId) {
        List<Topic> candidateTopics = collectCandidateTopics(subjectId, examContextId);
        if (candidateTopics.isEmpty()) {
            throw new IllegalArgumentException("No topics available for subject: " + subjectId);
        }

        Topic blockedPrerequisite = findWeakBlockingPrerequisite(candidateTopics, learnerProfile);
        if (blockedPrerequisite != null) {
            return new StudyRecommendation(
                    blockedPrerequisite.subjectId(),
                    blockedPrerequisite.id(),
                    blockedPrerequisite.title(),
                    "Strengthen this prerequisite before moving to harder topics.",
                    0.93,
                    "Revise the fundamentals and retake a short quiz."
            );
        }

        Topic weakTopic = findWeakTopic(candidateTopics, learnerProfile);
        if (weakTopic != null) {
            return new StudyRecommendation(
                    weakTopic.subjectId(),
                    weakTopic.id(),
                    weakTopic.title(),
                    "This topic needs reinforcement based on recent performance.",
                    0.88,
                    "Review the concept and practice another focused quiz."
            );
        }

        List<RecommendationScore> scores = scoreAccessibleTopics(candidateTopics, learnerProfile);
        if (!scores.isEmpty()) {
            RecommendationScore bestScore = scores.stream()
                    .max(Comparator.comparingDouble(RecommendationScore::totalScore))
                    .orElseThrow();
            Topic topic = catalogService.getTopic(bestScore.topicId());
            return new StudyRecommendation(
                    topic.subjectId(),
                    topic.id(),
                    topic.title(),
                    bestScore.reason(),
                    Math.min(0.95, bestScore.totalScore()),
                    "Study this topic next and complete a short assessment."
            );
        }

        Topic revisionTopic = selectRevisionTopic(candidateTopics, learnerProfile);
        return new StudyRecommendation(
                revisionTopic.subjectId(),
                revisionTopic.id(),
                revisionTopic.title(),
                "All accessible topics are stable, so a high-value revision topic is recommended.",
                0.7,
                "Do a revision pass and attempt a mixed practice set."
        );
    }

    private List<Topic> collectCandidateTopics(String subjectId, String examContextId) {
        List<Topic> subjectTopics = catalogService.getTopicsForSubject(subjectId);
        if (examContextId == null || examContextId.isBlank()) {
            return subjectTopics;
        }

        Optional<ExamContext> examContext = catalogService.findExamContext(examContextId);
        if (examContext.isEmpty()) {
            return subjectTopics;
        }

        Set<Topic> candidates = new LinkedHashSet<>();
        for (String focusTopicId : examContext.get().focusTopicIds()) {
            Topic focusTopic = catalogService.getTopic(focusTopicId);
            candidates.add(focusTopic);
            addPrerequisiteClosure(focusTopic, candidates);
        }
        return new ArrayList<>(candidates);
    }

    private void addPrerequisiteClosure(Topic topic, Set<Topic> candidates) {
        for (Topic prerequisite : catalogService.getPrerequisites(topic.id())) {
            if (candidates.add(prerequisite)) {
                addPrerequisiteClosure(prerequisite, candidates);
            }
        }
    }

    private Topic findWeakBlockingPrerequisite(List<Topic> candidateTopics, LearnerProfile learnerProfile) {
        Map<String, Topic> unresolvedPrerequisites = new LinkedHashMap<>();
        for (Topic topic : candidateTopics) {
            for (Topic prerequisite : catalogService.getPrerequisites(topic.id())) {
                if (!isPrerequisiteReady(prerequisite.id(), learnerProfile)) {
                    unresolvedPrerequisites.put(prerequisite.id(), prerequisite);
                }
            }
        }

        return unresolvedPrerequisites.values().stream()
                .max(Comparator.comparingDouble(topic -> scoreWeakness(topic, learnerProfile) + topic.examImportance()))
                .orElse(null);
    }

    private Topic findWeakTopic(List<Topic> candidateTopics, LearnerProfile learnerProfile) {
        return candidateTopics.stream()
                .filter(topic -> hasProgress(topic.id(), learnerProfile))
                .filter(topic -> !isMastered(topic.id(), learnerProfile))
                .filter(topic -> isAccessible(topic, learnerProfile))
                .max(Comparator.comparingDouble(topic -> scoreWeakness(topic, learnerProfile) + recencyScore(topic, learnerProfile)))
                .orElse(null);
    }

    private List<RecommendationScore> scoreAccessibleTopics(List<Topic> candidateTopics, LearnerProfile learnerProfile) {
        double targetDifficulty = Math.max(0.2, Math.min(0.8, learnerProfile.getOverallAccuracy() + 0.15));
        List<RecommendationScore> scores = new ArrayList<>();

        for (Topic topic : candidateTopics) {
            if (!isAccessible(topic, learnerProfile) || isMastered(topic.id(), learnerProfile)) {
                continue;
            }

            double weakness = scoreWeakness(topic, learnerProfile);
            double examWeight = topic.examImportance();
            double recency = recencyScore(topic, learnerProfile);
            double difficultyAlignment = 1.0 - Math.abs(topic.difficulty() - targetDifficulty);
            double novelty = hasProgress(topic.id(), learnerProfile) ? 0.1 : 0.25;

            double total = (0.28 * weakness) + (0.28 * examWeight) + (0.22 * recency) + (0.15 * difficultyAlignment) + novelty;

            scores.add(new RecommendationScore(
                    topic.id(),
                    Math.max(0.0, Math.min(1.0, total)),
                    weakness,
                    examWeight,
                    recency,
                    difficultyAlignment,
                    "This topic is accessible, high-value, and well matched to the learner's current level."
            ));
        }

        return scores;
    }

    private Topic selectRevisionTopic(List<Topic> candidateTopics, LearnerProfile learnerProfile) {
        return candidateTopics.stream()
                .max(Comparator.comparingDouble(topic -> topic.examImportance() + recencyScore(topic, learnerProfile)))
                .orElse(candidateTopics.get(0));
    }

    private boolean isAccessible(Topic topic, LearnerProfile learnerProfile) {
        return topic.prerequisiteIds().stream()
                .allMatch(prerequisiteId -> isPrerequisiteReady(prerequisiteId, learnerProfile));
    }

    private boolean isPrerequisiteReady(String topicId, LearnerProfile learnerProfile) {
        TopicProgress progress = learnerProfile.getTopicProgress().get(topicId);
        if (progress == null) {
            return false;
        }
        return progress.getMasteryScore() >= PREREQUISITE_READY_THRESHOLD || progress.isStrongTopic();
    }

    private boolean isMastered(String topicId, LearnerProfile learnerProfile) {
        TopicProgress progress = learnerProfile.getTopicProgress().get(topicId);
        return progress != null && (progress.isStrongTopic() || progress.getMasteryScore() >= MASTERED_THRESHOLD);
    }

    private boolean hasProgress(String topicId, LearnerProfile learnerProfile) {
        return learnerProfile.getTopicProgress().containsKey(topicId);
    }

    private double scoreWeakness(Topic topic, LearnerProfile learnerProfile) {
        TopicProgress progress = learnerProfile.getTopicProgress().get(topic.id());
        if (progress == null) {
            return 0.45;
        }
        return 1.0 - progress.getMasteryScore();
    }

    private double recencyScore(Topic topic, LearnerProfile learnerProfile) {
        TopicProgress progress = learnerProfile.getTopicProgress().get(topic.id());
        if (progress == null) {
            return 0.65;
        }
        long daysSincePractice = Math.max(0L, Duration.between(progress.getLastPracticedAt(), LocalDateTime.now()).toDays());
        return Math.max(0.0, Math.min(1.0, daysSincePractice / 14.0));
    }
}
