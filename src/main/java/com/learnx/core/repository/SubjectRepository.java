package com.learnx.core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learnx.core.service.SubjectEntity;

@Repository
public interface SubjectRepository extends JpaRepository<SubjectEntity, String> {
    List<SubjectEntity> findByIsActiveTrueOrderByDisplayOrderAsc();
}
