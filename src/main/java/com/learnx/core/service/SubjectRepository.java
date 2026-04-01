package com.learnx.core.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<SubjectEntity, String> {
    
    @Query("SELECT new com.learnx.core.service.SubjectService$SubjectDTO(" +
           "s.id, s.name, s.description, s.tags, s.accent, s.backdrop, s.displayOrder) " +
           "FROM SubjectEntity s WHERE s.isActive = TRUE ORDER BY s.displayOrder")
    List<SubjectService.SubjectDTO> findAllActive();
}
