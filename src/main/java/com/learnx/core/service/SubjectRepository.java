package com.learnx.core.service;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepository extends JpaRepository<SubjectEntity, String> {
    List<SubjectEntity> findByIsActiveTrueOrderByDisplayOrderAsc();

    default List<SubjectService.SubjectDTO> findAllActive() {
        return findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(entity -> new SubjectService.SubjectDTO(
                        entity.getId(),
                        entity.getName(),
                        entity.getDescription(),
                        entity.getTags(),
                        entity.getAccent(),
                        entity.getBackdrop(),
                        entity.getDisplayOrder()))
                .toList();
    }
}