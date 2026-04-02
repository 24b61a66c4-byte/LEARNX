package com.learnx.api.controller;

import com.learnx.core.model.Question;
import com.learnx.core.model.Topic;
import com.learnx.core.service.CatalogService;
import com.learnx.core.store.JsonCatalogStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/drills")
public class DrillGenerationController {

    private final CatalogService catalogService = new CatalogService(new JsonCatalogStore());

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody GenerateDrillRequest request) {
        if (request == null || request.subjectId == null || request.subjectId.isBlank()) {
            return ResponseEntity.badRequest().body("subjectId is required");
        }

        String subjectId = request.subjectId.trim();
        List<Topic> subjectTopics = catalogService.getTopicsForSubject(subjectId);
        if (subjectTopics.isEmpty()) {
            return ResponseEntity.badRequest().body("Unknown or unsupported subjectId: " + subjectId);
        }

        List<Topic> selectedTopics = pickTopics(subjectTopics, request);
        int questionCount = Math.max(1, Math.min(request.questionCount == null ? 8 : request.questionCount, 20));

        List<Question> candidates = new ArrayList<>();
        for (Topic topic : selectedTopics) {
            candidates.addAll(catalogService.getQuestionsForTopic(topic.id()));
        }

        if (candidates.isEmpty()) {
            candidates = catalogService.getQuestionsForSubject(subjectId);
        }

        List<DrillQuestionDto> questions = candidates.stream()
                .filter(Objects::nonNull)
                .limit(questionCount)
                .map(question -> new DrillQuestionDto(
                        question.id(),
                        question.topicId(),
                        question.type().name(),
                        question.prompt(),
                        question.options(),
                        question.correctOptionIndex(),
                        question.acceptedKeywords(),
                        question.requiredKeywordMatches(),
                        question.explanation(),
                        question.difficulty()))
                .toList();

        if (questions.isEmpty()) {
            return ResponseEntity.badRequest().body("No drill questions available for subject: " + subjectId);
        }

        String resolvedTopicId = selectedTopics.isEmpty() ? null : selectedTopics.get(0).id();
        return ResponseEntity.ok(new GenerateDrillResponse(subjectId, resolvedTopicId, questions.size(), questions));
    }

    private List<Topic> pickTopics(List<Topic> subjectTopics, GenerateDrillRequest request) {
        if (request.topicId != null && !request.topicId.isBlank()) {
            return subjectTopics.stream()
                    .filter(topic -> topic.id().equals(request.topicId.trim()))
                    .findFirst()
                    .map(List::of)
                    .orElse(List.of());
        }

        if (request.preferredTopicIds != null && !request.preferredTopicIds.isEmpty()) {
            List<Topic> preferred = subjectTopics.stream()
                    .filter(topic -> request.preferredTopicIds.contains(topic.id()))
                    .toList();
            if (!preferred.isEmpty()) {
                return preferred;
            }
        }

        List<Topic> sorted = new ArrayList<>(subjectTopics);
        if (request.age != null && request.age <= 10) {
            sorted.sort(Comparator.comparingDouble(Topic::difficulty));
        } else {
            sorted.sort(Comparator.comparingDouble(Topic::examImportance).reversed());
        }

        if (request.level != null) {
            String level = request.level.toLowerCase(Locale.ROOT);
            if ("beginner".equals(level)) {
                sorted.sort(Comparator.comparingDouble(Topic::difficulty));
            }
            if ("advanced".equals(level)) {
                sorted.sort(Comparator.comparingDouble(Topic::difficulty).reversed());
            }
        }

        return sorted.stream().limit(2).toList();
    }

    public static class GenerateDrillRequest {
        public String subjectId;
        public String topicId;
        public Integer age;
        public String level;
        public Integer questionCount;
        public List<String> preferredTopicIds;
    }

    public record DrillQuestionDto(
            String questionId,
            String topicId,
            String type,
            String prompt,
            List<String> options,
            Integer correctOptionIndex,
            List<String> acceptedKeywords,
            Integer minKeywordMatches,
            String explanation,
            double difficulty) {
    }

    public record GenerateDrillResponse(
            String subjectId,
            String topicId,
            Integer totalQuestions,
            List<DrillQuestionDto> questions) {
    }
}
