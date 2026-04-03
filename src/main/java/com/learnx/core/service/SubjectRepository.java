package com.learnx.core.service;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepository extends JpaRepository<SubjectEntity, String> {
    List<SubjectEntity> findByIsActiveTrueOrderByDisplayOrderAsc();
}