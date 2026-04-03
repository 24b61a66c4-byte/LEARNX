package com.learnx.persistence.service;

import com.learnx.persistence.entity.StudyNoteEntity;
import com.learnx.persistence.repository.StudyNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StudyNoteService {
    private final StudyNoteRepository repository;

    @Autowired
    public StudyNoteService(StudyNoteRepository repository) {
        this.repository = repository;
    }

    public StudyNoteEntity saveNote(StudyNoteEntity note) {
        note.setUpdatedAt(LocalDateTime.now());
        return repository.save(note);
    }

    public Optional<StudyNoteEntity> getNoteById(@NonNull Long id) {
        return repository.findById(id);
    }

    public List<StudyNoteEntity> getUserNotes(UUID userId) {
        return repository.findByUserId(userId);
    }

    public List<StudyNoteEntity> getUserNotesByTopic(UUID userId, String topicId) {
        return repository.findByUserIdAndTopicId(userId, topicId);
    }

    public List<StudyNoteEntity> getUserNotesBySubject(UUID userId, String subjectId) {
        return repository.findByUserIdAndSubjectId(userId, subjectId);
    }

    public void deleteNote(@NonNull Long id) {
        repository.deleteById(id);
    }
}
