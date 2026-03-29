package com.learnx.persistence.repository;

import com.learnx.persistence.model.StudyNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudyNoteRepository extends JpaRepository<StudyNote, Long> {
    List<StudyNote> findByUserId(UUID userId);
    List<StudyNote> findByUserIdAndTopicId(UUID userId, String topicId);
    List<StudyNote> findByUserIdAndSubjectId(UUID userId, String subjectId);
}
