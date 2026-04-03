package com.learnx.persistence.repository;

import com.learnx.persistence.entity.StudyNoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudyNoteRepository extends JpaRepository<StudyNoteEntity, Long> {
    List<StudyNoteEntity> findByUserId(UUID userId);
    List<StudyNoteEntity> findByUserIdAndTopicId(UUID userId, String topicId);
    List<StudyNoteEntity> findByUserIdAndSubjectId(UUID userId, String subjectId);
}
