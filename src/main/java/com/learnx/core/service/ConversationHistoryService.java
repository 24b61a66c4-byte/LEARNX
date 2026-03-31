package com.learnx.core.service;

import com.learnx.core.entity.ChatHistoryEntity;
import com.learnx.core.repository.ChatHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class ConversationHistoryService {

    private final ChatHistoryRepository chatHistoryRepository;

    public ConversationHistoryService(ChatHistoryRepository chatHistoryRepository) {
        this.chatHistoryRepository = chatHistoryRepository;
    }

    public void saveUserMessage(UUID userId, String message) {
        saveMessage(userId, message, "USER");
    }

    public void saveAssistantMessage(UUID userId, String message) {
        saveMessage(userId, message, "AI");
    }

    public List<String> getRecentUserMessages(UUID userId, int limit) {
        return chatHistoryRepository.findByUserIdOrderByTimestampAsc(userId).stream()
                .filter(history -> "USER".equals(history.getSender()))
                .sorted(Comparator.comparing(ChatHistoryEntity::getTimestamp).reversed())
                .limit(Math.max(1, limit))
                .sorted(Comparator.comparing(ChatHistoryEntity::getTimestamp))
                .map(ChatHistoryEntity::getMessage)
                .toList();
    }

    private void saveMessage(UUID userId, String message, String sender) {
        if (message == null || message.isBlank()) {
            return;
        }
        chatHistoryRepository.save(new ChatHistoryEntity(userId, message.trim(), sender));
    }
}
