package com.learnx.core.entity;

import com.learnx.core.model.AgeCategory;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private int age;

    @Enumerated(EnumType.STRING)
    @Column(name = "age_category", nullable = false)
    private AgeCategory ageCategory;

    public UserEntity() {
    }

    public UserEntity(String username, String email, String passwordHash, int age) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.age = age;
        this.ageCategory = calculateAgeCategory(age);
    }

    private AgeCategory calculateAgeCategory(int age) {
        if (age <= 8) return AgeCategory.KIDS;
        if (age <= 12) return AgeCategory.TWEENS;
        if (age <= 17) return AgeCategory.TEENS;
        return AgeCategory.ADULTS;
    }

    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public int getAge() { return age; }
    public AgeCategory getAgeCategory() { return ageCategory; }
}
