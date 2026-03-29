package com.learnx.persistence.repository;

import com.learnx.persistence.model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByUserId(UUID userId);

    List<QuizResult> findByUserIdAndSubjectId(UUID userId, String subjectId);

    List<QuizResult> findByUserIdAndTopicId(UUID userId, String topicId);

    @Query("SELECT AVG(q.scorePercent) FROM QuizResult q WHERE q.userId = :userId AND q.subjectId = :subjectId")
    Double getAverageScoreForSubject(@Param("userId") UUID userId, @Param("subjectId") String subjectId);
}
