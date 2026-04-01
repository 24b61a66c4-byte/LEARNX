package com.learnx.core.service;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Subject entity representing a configurable subject/domain.
 * Replaces hardcoded DBMS/EDC system.
 */
@Entity
@Table(name = "subjects")
public class SubjectEntity {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "subject_tags", joinColumns = @JoinColumn(name = "subject_id"))
    @Column(name = "tag")
    private List<String> tags;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT '#3B82F6'")
    private String accent;

    @Column(columnDefinition = "TEXT DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'")
    private String backdrop;

    @Column(name = "display_order", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int displayOrder;

    @Column(name = "is_active", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public SubjectEntity() {
    }

    public SubjectEntity(String id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = true;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getAccent() {
        return accent;
    }

    public void setAccent(String accent) {
        this.accent = accent;
    }

    public String getBackdrop() {
        return backdrop;
    }

    public void setBackdrop(String backdrop) {
        this.backdrop = backdrop;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
