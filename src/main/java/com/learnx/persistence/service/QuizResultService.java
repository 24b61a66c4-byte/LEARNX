package com.learnx.persistence.service;

import com.learnx.persistence.model.QuizResult;
import com.learnx.persistence.repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class QuizResultService {
    private final QuizResultRepository repository;

    @Autowired
    public QuizResultService(QuizResultRepository repository) {
        this.repository = repository;
    }

    public QuizResult saveResult(QuizResult result) {
        normalizeResult(result);
        if (result.getCompletedAt() == null) {
            result.setCompletedAt(LocalDateTime.now());
        }
        return repository.save(result);
    }

    private void normalizeResult(QuizResult result) {
        if (result == null) {
            return;
        }

        if (result.getAnswers() == null) {
            result.setAnswers(List.of());
            return;
        }

        result.setAnswers(result.getAnswers().stream()
                .filter(answer -> answer != null)
                .toList());
    }

    public List<QuizResult> getUserResults(UUID userId) {
        return repository.findByUserId(userId);
    }

    public List<QuizResult> getUserResultsBySubject(UUID userId, String subjectId) {
        return repository.findByUserIdAndSubjectId(userId, subjectId);
    }

    public List<QuizResult> getUserResultsByTopic(UUID userId, String topicId) {
        return repository.findByUserIdAndTopicId(userId, topicId);
    }

    public Double getAverageScore(UUID userId, String subjectId) {
        Double avg = repository.getAverageScoreForSubject(userId, subjectId);
        return avg != null ? avg : 0.0;
    }
}
