package com.learnx.persistence.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "progress_snapshots")
public class ProgressSnapshotEntity {
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

    @Column
    private Integer totalXp = 0;

    @Column
    private Integer currentLevel = 1;

    @Column
    private Integer completedTopics = 0;

    @Column(columnDefinition = "TEXT[]")
    private String[] strongTopics;

    @Column(columnDefinition = "TEXT[]")
    private String[] weakTopics;

    @Column
    private Integer practiceStreakDays = 0;

    @Column
    private LocalDate lastPracticeDate;

    @Column
    private Integer totalPracticeMinutes = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public Integer getTotalXp() { return totalXp; }
    public void setTotalXp(Integer totalXp) { this.totalXp = totalXp; }

    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }

    public Integer getCompletedTopics() { return completedTopics; }
    public void setCompletedTopics(Integer completedTopics) { this.completedTopics = completedTopics; }

    public String[] getStrongTopics() { return strongTopics; }
    public void setStrongTopics(String[] strongTopics) { this.strongTopics = strongTopics; }

    public String[] getWeakTopics() { return weakTopics; }
    public void setWeakTopics(String[] weakTopics) { this.weakTopics = weakTopics; }

    public Integer getPracticeStreakDays() { return practiceStreakDays; }
    public void setPracticeStreakDays(Integer practiceStreakDays) { this.practiceStreakDays = practiceStreakDays; }

    public LocalDate getLastPracticeDate() { return lastPracticeDate; }
    public void setLastPracticeDate(LocalDate lastPracticeDate) { this.lastPracticeDate = lastPracticeDate; }

    public Integer getTotalPracticeMinutes() { return totalPracticeMinutes; }
    public void setTotalPracticeMinutes(Integer totalPracticeMinutes) { this.totalPracticeMinutes = totalPracticeMinutes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
