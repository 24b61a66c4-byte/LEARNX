package com.learnx.core.repository;

import com.learnx.core.entity.QuizScoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizScoreRepository extends JpaRepository<QuizScoreEntity, String> {
    List<QuizScoreEntity> findByUserIdOrderByTakenAtDesc(String userId);
}
