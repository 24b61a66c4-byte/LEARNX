package com.learnx.persistence.repository;

import com.learnx.persistence.entity.LearnerProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearnerProfileRepository extends JpaRepository<LearnerProfileEntity, Long> {
    Optional<LearnerProfileEntity> findByUserId(UUID userId);
}
