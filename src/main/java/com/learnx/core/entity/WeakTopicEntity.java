package com.learnx.core.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "weak_topics")
public class WeakTopicEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private String topicId;

    @Column(nullable = false)
    private int failureCount;

    @Column(nullable = false)
    private LocalDateTime lastFailedAt;

    public WeakTopicEntity() {}

    public WeakTopicEntity(UserEntity user, String topicId) {
        this.user = user;
        this.topicId = topicId;
        this.failureCount = 1;
        this.lastFailedAt = LocalDateTime.now();
    }

    public void incrementFailure() {
        this.failureCount++;
        this.lastFailedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public UserEntity getUser() { return user; }
    public String getTopicId() { return topicId; }
    public int getFailureCount() { return failureCount; }
    public LocalDateTime getLastFailedAt() { return lastFailedAt; }
}
