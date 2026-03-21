package com.learnx.db.dao;

import com.learnx.db.config.DatabaseConfig;

import java.sql.*;

/**
 * Data Access Object for user accounts.
 *
 * <p>All SQL statements use parameterised queries to prevent SQL injection.
 */
public class UserDao {

    // -----------------------------------------------------------------------
    // Schema DDL (run via migration script, shown here for reference)
    // -----------------------------------------------------------------------
    /*
     * CREATE TABLE IF NOT EXISTS users (
     *     id            INT AUTO_INCREMENT PRIMARY KEY,
     *     username      VARCHAR(50)  NOT NULL UNIQUE,
     *     email         VARCHAR(100) NOT NULL UNIQUE,
     *     password_hash VARCHAR(255) NOT NULL,
     *     age           INT          NOT NULL,
     *     grade_level   INT          NOT NULL,
     *     difficulty    INT          NOT NULL DEFAULT 1,
     *     created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
     * );
     */

    /**
     * Inserts a new user record and returns the generated ID.
     *
     * @param username     the learner's username
     * @param email        the learner's email address
     * @param passwordHash the pre-hashed password (see PasswordHasher)
     * @param age          the learner's age
     * @param gradeLevel   the learner's grade level
     * @return the auto-generated primary key, or -1 on failure
     * @throws SQLException on database error
     */
    public int insertUser(String username, String email, String passwordHash,
                          int age, int gradeLevel) throws SQLException {
        String sql = "INSERT INTO users (username, email, password_hash, age, grade_level) "
                   + "VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, username);
            ps.setString(2, email);
            ps.setString(3, passwordHash);
            ps.setInt(4, age);
            ps.setInt(5, gradeLevel);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                return keys.next() ? keys.getInt(1) : -1;
            }
        }
    }

    /**
     * Retrieves the password hash for the given username.
     *
     * @param username the learner's username
     * @return the stored password hash, or {@code null} if not found
     * @throws SQLException on database error
     */
    public String getPasswordHash(String username) throws SQLException {
        String sql = "SELECT password_hash FROM users WHERE username = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getString("password_hash") : null;
            }
        }
    }
}
