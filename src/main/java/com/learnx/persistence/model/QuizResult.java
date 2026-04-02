package com.learnx.persistence.model;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quiz_results")
public class QuizResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User ID is required")
    @Column(nullable = false)
    private UUID userId;

    @NotBlank(message = "Subject ID is required")
    @Size(max = 50, message = "Subject ID must not exceed 50 characters")
    @Column(nullable = false, length = 50)
    private String subjectId;

    @Size(max = 255, message = "Topic ID must not exceed 255 characters")
    @Column(length = 255)
    private String topicId;

    @NotNull(message = "Total questions count is required")
    @Min(value = 1, message = "Total questions must be at least 1")
    @Column(nullable = false)
    private Integer totalQuestions;

    @NotNull(message = "Correct count is required")
    @Min(value = 0, message = "Correct count must not be negative")
    @Column(nullable = false)
    private Integer correctCount;

    @NotNull(message = "Score percent is required")
    @Min(value = 0, message = "Score percent must not be negative")
    @Max(value = 100, message = "Score percent must not exceed 100")
    @Column(nullable = false)
    private Double scorePercent;

    @Column
    private Integer xpEarned = 0;

    @Column
    private LocalDateTime completedAt = LocalDateTime.now();

    @Valid
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "quiz_result_answers", joinColumns = @JoinColumn(name = "quiz_result_id"))
    private List<QuizAnswerDetail> answers = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public String getTopicId() {
        return topicId;
    }

    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(Integer correctCount) {
        this.correctCount = correctCount;
    }

    public Double getScorePercent() {
        return scorePercent;
    }

    public void setScorePercent(Double scorePercent) {
        this.scorePercent = scorePercent;
    }

    public Integer getXpEarned() {
        return xpEarned;
    }

    public void setXpEarned(Integer xpEarned) {
        this.xpEarned = xpEarned;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public List<QuizAnswerDetail> getAnswers() {
        return answers;
    }

    public void setAnswers(List<QuizAnswerDetail> answers) {
        this.answers = answers;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
