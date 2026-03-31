package com.learnx.core.repository;

import com.learnx.core.entity.ChatHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistoryEntity, String> {
    List<ChatHistoryEntity> findByUserIdOrderByTimestampAsc(UUID userId);
}
