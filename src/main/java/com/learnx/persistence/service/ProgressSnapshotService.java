package com.learnx.persistence.service;

import com.learnx.persistence.model.ProgressSnapshot;
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

    public ProgressSnapshot saveSnapshot(ProgressSnapshot snapshot) {
        snapshot.setUpdatedAt(LocalDateTime.now());
        return repository.save(snapshot);
    }

    public Optional<ProgressSnapshot> getProgressBySubject(UUID userId, String subjectId) {
        return repository.findByUserIdAndSubjectId(userId, subjectId);
    }

    public ProgressSnapshot getOrCreateProgress(UUID userId, String subjectId) {
        Optional<ProgressSnapshot> existing = repository.findByUserIdAndSubjectId(userId, subjectId);
        if (existing.isPresent()) {
            return existing.get();
        }

        ProgressSnapshot newProgress = new ProgressSnapshot();
        newProgress.setUserId(userId);
        newProgress.setSubjectId(subjectId);
        newProgress.setCreatedAt(LocalDateTime.now());
        newProgress.setUpdatedAt(LocalDateTime.now());
        return repository.save(newProgress);
    }
}
