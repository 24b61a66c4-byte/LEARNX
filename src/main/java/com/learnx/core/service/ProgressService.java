package com.learnx.core.service;

import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.QuestionEvaluation;
import com.learnx.core.model.QuizEvaluation;
import com.learnx.core.model.TopicProgress;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Updates learner progress and topic mastery after quiz submissions.
 */
public class ProgressService {

    public LearnerProfile updateProgress(LearnerProfile learnerProfile, QuizEvaluation evaluation) {
        learnerProfile.recordQuiz(evaluation);

        Map<String, List<QuestionEvaluation>> evaluationsByTopic = evaluation.questionEvaluations().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        QuestionEvaluation::topicId,
                        LinkedHashMap::new,
                        java.util.stream.Collectors.toList()
                ));

        for (Map.Entry<String, List<QuestionEvaluation>> entry : evaluationsByTopic.entrySet()) {
            String topicId = entry.getKey();
            List<QuestionEvaluation> topicEvaluations = entry.getValue();

            int correctCount = (int) topicEvaluations.stream()
                    .filter(QuestionEvaluation::correct)
                    .count();
            double topicScore = topicEvaluations.stream()
                    .mapToDouble(QuestionEvaluation::score)
                    .average()
                    .orElse(0.0);

            TopicProgress topicProgress = learnerProfile.getOrCreateTopicProgress(topicId);
            topicProgress.applyQuizOutcome(topicScore, correctCount, topicEvaluations.size(), evaluation.submittedAt());
        }

        return learnerProfile;
    }
}
