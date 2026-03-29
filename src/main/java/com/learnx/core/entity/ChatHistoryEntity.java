package com.learnx.core.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_history")
public class ChatHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String sender; // USER or AI

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public ChatHistoryEntity() {}

    public ChatHistoryEntity(UserEntity user, String message, String sender) {
        this.user = user;
        this.message = message;
        this.sender = sender;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() { return id; }
    public UserEntity getUser() { return user; }
    public String getMessage() { return message; }
    public String getSender() { return sender; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
