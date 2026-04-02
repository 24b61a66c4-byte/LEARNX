package com.learnx.persistence.service;

import com.learnx.persistence.model.StudyNote;
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

    public StudyNote saveNote(StudyNote note) {
        note.setUpdatedAt(LocalDateTime.now());
        return repository.save(note);
    }

    public Optional<StudyNote> getNoteById(@NonNull Long id) {
        return repository.findById(id);
    }

    public List<StudyNote> getUserNotes(UUID userId) {
        return repository.findByUserId(userId);
    }

    public List<StudyNote> getUserNotesByTopic(UUID userId, String topicId) {
        return repository.findByUserIdAndTopicId(userId, topicId);
    }

    public List<StudyNote> getUserNotesBySubject(UUID userId, String subjectId) {
        return repository.findByUserIdAndSubjectId(userId, subjectId);
    }

    public void deleteNote(@NonNull Long id) {
        repository.deleteById(id);
    }
}
