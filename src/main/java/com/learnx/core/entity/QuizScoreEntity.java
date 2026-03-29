package com.learnx.core.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_scores")
public class QuizScoreEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private String subjectId;

    @Column(nullable = false)
    private String topicId;

    @Column(nullable = false)
    private double score;

    @Column(nullable = false)
    private int correctAnswers;

    @Column(nullable = false)
    private int totalQuestions;

    @Column(nullable = false)
    private LocalDateTime takenAt;

    public QuizScoreEntity() {}

    public QuizScoreEntity(UserEntity user, String subjectId, String topicId, double score, int correctAnswers, int totalQuestions, LocalDateTime takenAt) {
        this.user = user;
        this.subjectId = subjectId;
        this.topicId = topicId;
        this.score = score;
        this.correctAnswers = correctAnswers;
        this.totalQuestions = totalQuestions;
        this.takenAt = takenAt;
    }

    public String getId() { return id; }
    public UserEntity getUser() { return user; }
    public String getSubjectId() { return subjectId; }
    public String getTopicId() { return topicId; }
    public double getScore() { return score; }
    public int getCorrectAnswers() { return correctAnswers; }
    public int getTotalQuestions() { return totalQuestions; }
    public LocalDateTime getTakenAt() { return takenAt; }
}
