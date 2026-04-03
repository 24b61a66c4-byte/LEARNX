package com.learnx.persistence.service;

import com.learnx.persistence.entity.ProgressSnapshotEntity;
import com.learnx.persistence.repository.ProgressSnapshotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProgressSnapshotService {
    private final ProgressSnapshotRepository repository;

    @Autowired
    public ProgressSnapshotService(ProgressSnapshotRepository repository) {
        this.repository = repository;
    }

    public ProgressSnapshotEntity saveSnapshot(ProgressSnapshotEntity snapshot) {
        snapshot.setUpdatedAt(LocalDateTime.now());
        return repository.save(snapshot);
    }

    public Optional<ProgressSnapshotEntity> getProgressBySubject(UUID userId, String subjectId) {
        return repository.findByUserIdAndSubjectId(userId, subjectId);
    }

    public ProgressSnapshotEntity getOrCreateProgress(UUID userId, String subjectId) {
        Optional<ProgressSnapshotEntity> existing = repository.findByUserIdAndSubjectId(userId, subjectId);
        if (existing.isPresent()) {
            return existing.get();
        }

        ProgressSnapshotEntity newProgress = new ProgressSnapshotEntity();
        newProgress.setUserId(userId);
        newProgress.setSubjectId(subjectId);
        newProgress.setCreatedAt(LocalDateTime.now());
        newProgress.setUpdatedAt(LocalDateTime.now());
        return repository.save(newProgress);
    }
}
