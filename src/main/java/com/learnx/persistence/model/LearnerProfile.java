package com.learnx.persistence.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "learner_profiles")
public class LearnerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 255)
    private String displayName;

    @Column
    private Integer age;

    @Column(length = 50)
    private String cognitiveGroup; // kids, tweens, teens, adults

    @Column(length = 50)
    private String preferredSubjectId;

    @Column(length = 100)
    private String studyGoal;

    @Column(length = 100)
    private String examTarget;

    @Column(length = 50)
    private String launchMode;

    @Column(columnDefinition = "TEXT[]")
    private String[] interests;

    @Column
    private Boolean enableVisualDiagrams = true;

    @Column
    private Boolean enableVoiceInput = true;

    @Column
    private Boolean enableQuizMode = true;

    @Column(columnDefinition = "TEXT[]")
    private String[] accessibilityFeatures;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getCognitiveGroup() { return cognitiveGroup; }
    public void setCognitiveGroup(String cognitiveGroup) { this.cognitiveGroup = cognitiveGroup; }

    public String getPreferredSubjectId() { return preferredSubjectId; }
    public void setPreferredSubjectId(String preferredSubjectId) { this.preferredSubjectId = preferredSubjectId; }

    public String getStudyGoal() { return studyGoal; }
    public void setStudyGoal(String studyGoal) { this.studyGoal = studyGoal; }

    public String getExamTarget() { return examTarget; }
    public void setExamTarget(String examTarget) { this.examTarget = examTarget; }

    public String getLaunchMode() { return launchMode; }
    public void setLaunchMode(String launchMode) { this.launchMode = launchMode; }

    public String[] getInterests() { return interests; }
    public void setInterests(String[] interests) { this.interests = interests; }

    public Boolean getEnableVisualDiagrams() { return enableVisualDiagrams; }
    public void setEnableVisualDiagrams(Boolean enableVisualDiagrams) { this.enableVisualDiagrams = enableVisualDiagrams; }

    public Boolean getEnableVoiceInput() { return enableVoiceInput; }
    public void setEnableVoiceInput(Boolean enableVoiceInput) { this.enableVoiceInput = enableVoiceInput; }

    public Boolean getEnableQuizMode() { return enableQuizMode; }
    public void setEnableQuizMode(Boolean enableQuizMode) { this.enableQuizMode = enableQuizMode; }

    public String[] getAccessibilityFeatures() { return accessibilityFeatures; }
    public void setAccessibilityFeatures(String[] accessibilityFeatures) { this.accessibilityFeatures = accessibilityFeatures; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
