package com.learnx.api.controller;

import com.learnx.api.security.AuthContextService;
import com.learnx.api.service.AuditService;
import com.learnx.core.model.Question;
import com.learnx.core.model.QuestionEvaluation;
import com.learnx.core.model.QuestionType;
import com.learnx.core.model.QuizAttempt;
import com.learnx.core.model.SubmittedAnswer;
import com.learnx.core.model.Topic;
import com.learnx.core.service.CatalogService;
import com.learnx.core.service.QuizEngine;
import com.learnx.core.store.JsonCatalogStore;
import com.learnx.persistence.entity.QuizResultEntity;
import com.learnx.persistence.model.QuizAnswerDetail;
import com.learnx.persistence.service.QuizResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/drills")
public class DrillGenerationController {

    private final CatalogService catalogService;
    private final QuizEngine quizEngine;
    private final QuizResultService quizResultService;
    private final AuthContextService authContextService;
    private final AuditService auditService;

    public DrillGenerationController() {
        this(new CatalogService(new JsonCatalogStore()), null, null, null);
    }

    @Autowired
    public DrillGenerationController(
            QuizResultService quizResultService,
            AuthContextService authContextService,
            AuditService auditService) {
        this(new CatalogService(new JsonCatalogStore()), quizResultService, authContextService, auditService);
    }

    DrillGenerationController(
            CatalogService catalogService,
            QuizResultService quizResultService,
            AuthContextService authContextService,
            AuditService auditService) {
        this.catalogService = catalogService;
        this.quizEngine = new QuizEngine(catalogService);
        this.quizResultService = quizResultService;
        this.authContextService = authContextService;
        this.auditService = auditService;
    }

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

    @PostMapping("/score")
    public ResponseEntity<?> score(@RequestBody ScoreDrillRequest request, Authentication authentication) {
        if (quizResultService == null || authContextService == null || auditService == null) {
            throw new IllegalStateException("Drill scoring dependencies are not configured");
        }

        UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
        ScoreDrillResponse response = scoreDrill(authenticatedUserId, request);
        auditService.logMutation(
                "DRILL_SCORE",
                authenticatedUserId,
                "quiz-result",
                response.subjectId() + ":" + response.topicId(),
                "Scored targeted drill and updated recovery loop");
        return ResponseEntity.ok(response);
    }

    ScoreDrillResponse scoreDrill(UUID userId, ScoreDrillRequest request) {
        if (request == null || request.subjectId == null || request.subjectId.isBlank()) {
            throw new IllegalArgumentException("subjectId is required");
        }
        if (request.answers == null || request.answers.isEmpty()) {
            throw new IllegalArgumentException("At least one answer is required");
        }

        String subjectId = request.subjectId.trim();
        catalogService.getSubject(subjectId);

        List<AnswerEnvelope> answerEnvelopes = request.answers.stream()
                .filter(Objects::nonNull)
                .map(answer -> toAnswerEnvelope(subjectId, answer))
                .toList();
        if (answerEnvelopes.isEmpty()) {
            throw new IllegalArgumentException("At least one valid answer is required");
        }

        Map<String, List<SubmittedAnswer>> answersByTopic = new LinkedHashMap<>();
        answerEnvelopes.forEach(envelope ->
                answersByTopic.computeIfAbsent(envelope.question().topicId(), ignored -> new ArrayList<>())
                        .add(envelope.submittedAnswer()));

        LocalDateTime submittedAt = LocalDateTime.now();
        LocalDateTime startedAt = submittedAt.minusSeconds(Math.max(0,
                request.durationSeconds == null ? 0 : request.durationSeconds));
        Map<String, QuestionEvaluation> evaluationsByQuestion = new LinkedHashMap<>();
        answersByTopic.forEach((topicId, submittedAnswers) -> {
            QuizAttempt attempt = new QuizAttempt(
                    userId.toString(),
                    subjectId,
                    topicId,
                    submittedAnswers,
                    startedAt,
                    submittedAt);
            quizEngine.evaluate(attempt).questionEvaluations()
                    .forEach(evaluation -> evaluationsByQuestion.put(evaluation.questionId(), evaluation));
        });

        List<ScoredDrillAnswerDto> scoredAnswers = answerEnvelopes.stream()
                .map(envelope -> toScoredAnswer(envelope, evaluationsByQuestion.get(envelope.question().id())))
                .toList();
        int correctCount = (int) scoredAnswers.stream().filter(ScoredDrillAnswerDto::correct).count();
        int totalQuestions = scoredAnswers.size();
        int scorePercent = totalQuestions == 0
                ? 0
                : (int) Math.round(scoredAnswers.stream().mapToInt(ScoredDrillAnswerDto::score).average().orElse(0));
        String resolvedTopicId = resolveResultTopicId(request.topicId, scoredAnswers);
        List<String> weakConcepts = buildWeakConcepts(scoredAnswers);
        int xpEarned = calculateXp(scorePercent, correctCount, resolvedTopicId);
        List<QuizResultEntity> previousTopicResults = resolvedTopicId == null
                ? List.of()
                : quizResultService.getUserResultsByTopic(userId, resolvedTopicId);

        QuizResultEntity saved = quizResultService.saveResult(toQuizResultEntity(
                userId,
                subjectId,
                resolvedTopicId,
                totalQuestions,
                correctCount,
                scorePercent,
                xpEarned,
                submittedAt,
                scoredAnswers));
        int recoveryScore = calculateRecoveryScore(scorePercent, previousTopicResults);
        String nextAction = buildNextAction(scorePercent, weakConcepts);

        return new ScoreDrillResponse(
                subjectId,
                resolvedTopicId,
                totalQuestions,
                correctCount,
                scorePercent,
                xpEarned,
                recoveryScore,
                weakConcepts,
                nextAction,
                saved.getId(),
                submittedAt.toString(),
                scoredAnswers);
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

    public static class ScoreDrillRequest {
        public String subjectId;
        public String topicId;
        public Integer durationSeconds;
        public List<SubmittedDrillAnswer> answers;
    }

    public static class SubmittedDrillAnswer {
        public String questionId;
        public String answer;
        public Integer selectedOptionIndex;
    }

    public record ScoredDrillAnswerDto(
            String questionId,
            String topicId,
            String prompt,
            String learnerAnswer,
            String correctAnswer,
            boolean correct,
            int score,
            String explanation,
            List<String> weakConcepts) {
    }

    public record ScoreDrillResponse(
            String subjectId,
            String topicId,
            int totalQuestions,
            int correctCount,
            int scorePercent,
            int xpEarned,
            int recoveryScore,
            List<String> weakConcepts,
            String nextAction,
            Long resultId,
            String completedAt,
            List<ScoredDrillAnswerDto> answers) {
    }

    private AnswerEnvelope toAnswerEnvelope(String subjectId, SubmittedDrillAnswer answer) {
        if (answer.questionId == null || answer.questionId.isBlank()) {
            throw new IllegalArgumentException("questionId is required for each submitted answer");
        }

        Question question = catalogService.getQuestion(answer.questionId.trim());
        if (!question.subjectId().equals(subjectId)) {
            throw new IllegalArgumentException("Question subject mismatch: " + question.id());
        }

        String learnerAnswer = answer.answer == null ? "" : answer.answer.trim();
        SubmittedAnswer submittedAnswer = question.type() == QuestionType.MCQ
                ? SubmittedAnswer.forMcq(question.id(),
                        resolveSelectedOptionIndex(question, learnerAnswer, answer.selectedOptionIndex))
                : SubmittedAnswer.forShortAnswer(question.id(), learnerAnswer);

        return new AnswerEnvelope(question, learnerAnswer, submittedAnswer);
    }

    private int resolveSelectedOptionIndex(Question question, String learnerAnswer, Integer selectedOptionIndex) {
        if (selectedOptionIndex != null) {
            return selectedOptionIndex;
        }

        for (int index = 0; index < question.options().size(); index += 1) {
            if (question.options().get(index).equals(learnerAnswer)) {
                return index;
            }
        }

        return -1;
    }

    private ScoredDrillAnswerDto toScoredAnswer(AnswerEnvelope envelope, QuestionEvaluation evaluation) {
        Question question = envelope.question();
        if (evaluation == null) {
            throw new IllegalArgumentException("Missing evaluation for question: " + question.id());
        }

        List<String> weakConcepts = evaluation.correct() && evaluation.score() >= 0.8
                ? List.of()
                : conceptsForQuestion(question, evaluation);

        return new ScoredDrillAnswerDto(
                question.id(),
                question.topicId(),
                question.prompt(),
                envelope.learnerAnswer(),
                correctAnswerFor(question),
                evaluation.correct(),
                (int) Math.round(evaluation.score() * 100),
                evaluation.feedback(),
                weakConcepts);
    }

    private String correctAnswerFor(Question question) {
        if (question.type() == QuestionType.MCQ && question.correctOptionIndex() != null) {
            return question.options().get(question.correctOptionIndex());
        }

        return String.join(", ", question.acceptedKeywords());
    }

    private String resolveResultTopicId(String requestedTopicId, List<ScoredDrillAnswerDto> scoredAnswers) {
        if (requestedTopicId != null && !requestedTopicId.isBlank()) {
            return requestedTopicId.trim();
        }

        return scoredAnswers.stream()
                .map(ScoredDrillAnswerDto::topicId)
                .filter(topicId -> topicId != null && !topicId.isBlank())
                .findFirst()
                .orElse(null);
    }

    private List<String> buildWeakConcepts(List<ScoredDrillAnswerDto> answers) {
        LinkedHashSet<String> concepts = new LinkedHashSet<>();
        answers.stream()
                .filter(answer -> !answer.correct() || answer.score() < 80)
                .flatMap(answer -> answer.weakConcepts().stream())
                .forEach(concepts::add);

        if (concepts.isEmpty()) {
            concepts.add("retention stretch");
        }

        return concepts.stream().limit(4).toList();
    }

    private List<String> conceptsForQuestion(Question question, QuestionEvaluation evaluation) {
        LinkedHashSet<String> concepts = new LinkedHashSet<>();
        question.acceptedKeywords().stream()
                .filter(keyword -> !evaluation.matchedKeywords().contains(keyword))
                .map(this::humanize)
                .forEach(concepts::add);

        Topic topic = catalogService.getTopic(question.topicId());
        topic.tags().stream().map(this::humanize).forEach(concepts::add);

        if (concepts.isEmpty()) {
            concepts.add(topic.title());
        }

        return concepts.stream().limit(3).toList();
    }

    private QuizResultEntity toQuizResultEntity(
            UUID userId,
            String subjectId,
            String topicId,
            int totalQuestions,
            int correctCount,
            int scorePercent,
            int xpEarned,
            LocalDateTime submittedAt,
            List<ScoredDrillAnswerDto> answers) {
        QuizResultEntity result = new QuizResultEntity();
        result.setUserId(userId);
        result.setSubjectId(subjectId);
        result.setTopicId(topicId);
        result.setTotalQuestions(totalQuestions);
        result.setCorrectCount(correctCount);
        result.setScorePercent((double) scorePercent);
        result.setXpEarned(xpEarned);
        result.setCompletedAt(submittedAt);
        result.setAnswers(answers.stream().map(this::toAnswerDetail).toList());
        return result;
    }

    private QuizAnswerDetail toAnswerDetail(ScoredDrillAnswerDto answer) {
        QuizAnswerDetail detail = new QuizAnswerDetail();
        detail.setQuestionId(answer.questionId());
        detail.setTopicId(answer.topicId());
        detail.setPrompt(answer.prompt());
        detail.setLearnerAnswer(answer.learnerAnswer());
        detail.setCorrectAnswer(answer.correctAnswer());
        detail.setCorrect(answer.correct());
        detail.setScore(answer.score());
        detail.setExplanation(answer.explanation());
        return detail;
    }

    private int calculateXp(int scorePercent, int correctCount, String topicId) {
        int masteryBonus = scorePercent >= 85 ? 20 : scorePercent >= 70 ? 10 : 0;
        int topicBonus = topicId == null || topicId.isBlank() ? 0 : 5;
        return 20 + scorePercent + correctCount * 5 + masteryBonus + topicBonus;
    }

    private int calculateRecoveryScore(int currentScore, List<QuizResultEntity> previousResults) {
        List<Integer> scores = new ArrayList<>();
        scores.add(currentScore);
        previousResults.stream()
                .sorted(Comparator.comparing(QuizResultEntity::getCompletedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(2)
                .map(QuizResultEntity::getScorePercent)
                .filter(Objects::nonNull)
                .map(Double::intValue)
                .forEach(scores::add);

        return (int) Math.round(scores.stream().mapToInt(Integer::intValue).average().orElse(currentScore));
    }

    private String buildNextAction(int scorePercent, List<String> weakConcepts) {
        if (scorePercent >= 85) {
            return "Recovery looks strong. Save one clean note, then move to the next topic.";
        }

        String focus = weakConcepts.isEmpty() ? "the missed idea" : weakConcepts.get(0);
        return "Review " + focus + ", ask the tutor for a repair pass, then retry this drill.";
    }

    private String humanize(String value) {
        if (value == null || value.isBlank()) {
            return "core recall";
        }
        return value.trim().replace('-', ' ').toLowerCase(Locale.ROOT);
    }

    private record AnswerEnvelope(Question question, String learnerAnswer, SubmittedAnswer submittedAnswer) {
    }
}
