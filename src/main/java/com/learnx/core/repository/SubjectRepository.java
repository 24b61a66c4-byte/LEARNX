package com.learnx.core.repository;

import com.learnx.core.entity.SubjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<SubjectEntity, String> {
    List<SubjectEntity> findByIsActiveTrueOrderByDisplayOrderAsc();
}
