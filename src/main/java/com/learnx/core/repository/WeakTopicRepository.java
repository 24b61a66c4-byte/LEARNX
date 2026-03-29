package com.learnx.core.repository;

import com.learnx.core.entity.WeakTopicEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeakTopicRepository extends JpaRepository<WeakTopicEntity, String> {
    List<WeakTopicEntity> findByUserId(String userId);
    Optional<WeakTopicEntity> findByUserIdAndTopicId(String userId, String topicId);
}
