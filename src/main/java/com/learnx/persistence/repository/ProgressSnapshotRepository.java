package com.learnx.persistence.repository;

import com.learnx.persistence.entity.ProgressSnapshotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgressSnapshotRepository extends JpaRepository<ProgressSnapshotEntity, Long> {
    Optional<ProgressSnapshotEntity> findByUserIdAndSubjectId(UUID userId, String subjectId);
}
