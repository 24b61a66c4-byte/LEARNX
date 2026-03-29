package com.learnx.core.service;

import com.learnx.core.model.Question;
import com.learnx.core.model.QuestionEvaluation;
import com.learnx.core.model.QuestionType;
import com.learnx.core.model.QuizAttempt;
import com.learnx.core.model.QuizEvaluation;
import com.learnx.core.model.SubmittedAnswer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Scores learner quiz attempts against the immutable catalog question bank.
 */
public class QuizEngine {

    private final CatalogService catalogService;

    public QuizEngine(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    public QuizEvaluation evaluate(QuizAttempt attempt) {
        List<QuestionEvaluation> evaluations = new ArrayList<>();
        int correctCount = 0;
        double cumulativeScore = 0.0;

        for (SubmittedAnswer submittedAnswer : attempt.submittedAnswers()) {
            Question question = catalogService.getQuestion(submittedAnswer.questionId());
            validateQuestionContext(question, attempt);

            QuestionEvaluation evaluation = evaluateQuestion(question, submittedAnswer);
            evaluations.add(evaluation);
            cumulativeScore += evaluation.score();
            if (evaluation.correct()) {
                correctCount++;
            }
        }

        int totalQuestions = evaluations.size();
        double totalScore = totalQuestions == 0 ? 0.0 : cumulativeScore / totalQuestions;

        return new QuizEvaluation(
                attempt.learnerId(),
                attempt.subjectId(),
                attempt.topicId(),
                attempt.submittedAt(),
                evaluations,
                totalScore,
                correctCount,
                Math.max(0, totalQuestions - correctCount),
                attempt.getDurationSeconds());
    }

    private QuestionEvaluation evaluateQuestion(Question question, SubmittedAnswer submittedAnswer) {
        return switch (question.type()) {
            case MCQ -> evaluateMcq(question, submittedAnswer);
            case SHORT_ANSWER -> evaluateShortAnswer(question, submittedAnswer);
        };
    }

    private QuestionEvaluation evaluateMcq(Question question, SubmittedAnswer submittedAnswer) {
        boolean correct = submittedAnswer.selectedOptionIndex() != null
                && submittedAnswer.selectedOptionIndex().equals(question.correctOptionIndex());
        return new QuestionEvaluation(
                question.id(),
                question.topicId(),
                correct,
                correct ? 1.0 : 0.0,
                question.explanation(),
                List.of());
    }

    private QuestionEvaluation evaluateShortAnswer(Question question, SubmittedAnswer submittedAnswer) {
        String normalizedAnswer = normalize(submittedAnswer.textAnswer());
        List<String> matchedKeywords = question.acceptedKeywords().stream()
                .filter(keyword -> normalizedAnswer.contains(normalize(keyword)))
                .toList();

        int requiredMatches = question.requiredKeywordMatches();
        double score = question.acceptedKeywords().isEmpty()
                ? 0.0
                : (double) matchedKeywords.size() / question.acceptedKeywords().size();
        boolean correct = matchedKeywords.size() >= requiredMatches;

        return new QuestionEvaluation(
                question.id(),
                question.topicId(),
                correct,
                score,
                question.explanation(),
                matchedKeywords);
    }

    private void validateQuestionContext(Question question, QuizAttempt attempt) {
        if (!question.subjectId().equals(attempt.subjectId())) {
            throw new CatalogValidationException("Question subject mismatch for attempt: " + question.id());
        }
        if (!question.topicId().equals(attempt.topicId())) {
            throw new CatalogValidationException("Question topic mismatch for attempt: " + question.id());
        }
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
