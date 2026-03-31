package com.learnx.core.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_history")
public class ChatHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String sender; // USER or AI

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public ChatHistoryEntity() {
    }

    public ChatHistoryEntity(UUID userId, String message, String sender) {
        this.userId = userId;
        this.message = message;
        this.sender = sender;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getMessage() {
        return message;
    }

    public String getSender() {
        return sender;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
