package com.learnx.persistence.repository;

import com.learnx.persistence.model.ProgressSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgressSnapshotRepository extends JpaRepository<ProgressSnapshot, Long> {
    Optional<ProgressSnapshot> findByUserIdAndSubjectId(UUID userId, String subjectId);
}
