package com.learnx.db;

import com.learnx.core.LearnerProfile;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data-access object for the {@code users} table.
 *
 * <h2>Performance improvements applied here</h2>
 * <ol>
 *   <li><strong>Connection reuse</strong> – every method borrows a connection from
 *       {@link DatabaseConfig}'s pool and returns it via
 *       {@link DatabaseConfig#releaseConnection(Connection)} in a {@code finally} block.
 *       Previously a new physical connection was opened (and discarded) for every call.</li>
 *   <li><strong>Prepared-statement caching</strong> – the JDBC URL is configured with
 *       {@code cachePrepStmts=true}, so the MySQL connector caches the parsed statement plan
 *       on the server side and reuses it on repeated invocations.</li>
 * </ol>
 */
public class UserDao {

    private static final Logger LOGGER = Logger.getLogger(UserDao.class.getName());

    // -----------------------------------------------------------------------
    // SQL constants – declared once so the String is not re-allocated per call
    // -----------------------------------------------------------------------
    private static final String SQL_INSERT_USER =
            "INSERT INTO users (username, email, password_hash, salt, age, difficulty_level)"
            + " VALUES (?, ?, ?, ?, ?, ?)";
    private static final String SQL_FIND_BY_USERNAME =
            "SELECT id, username, email, password_hash, salt, age, difficulty_level"
            + " FROM users WHERE username = ?";
    private static final String SQL_UPDATE_DIFFICULTY =
            "UPDATE users SET difficulty_level = ? WHERE id = ?";

    /**
     * Persists a new user record and returns the generated primary key.
     */
    public int createUser(String username, String email, String passwordHash,
                          String salt, int age, int difficultyLevel) throws SQLException {
        Connection conn = DatabaseConfig.getConnection();
        try (PreparedStatement ps = conn.prepareStatement(
                SQL_INSERT_USER, java.sql.Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, username);
            ps.setString(2, email);
            ps.setString(3, passwordHash);
            ps.setString(4, salt);
            ps.setInt(5, age);
            ps.setInt(6, difficultyLevel);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getInt(1);
                }
            }
            throw new SQLException("No generated key returned after user insert.");
        } finally {
            DatabaseConfig.releaseConnection(conn); // return to pool, not close
        }
    }

    /**
     * Looks up a user by username.  The {@code users.username} column should have a unique index
     * (see {@code schema.sql}) so this is an index seek rather than a full-table scan.
     */
    public Optional<LearnerProfile> findByUsername(String username) throws SQLException {
        Connection conn = DatabaseConfig.getConnection();
        try (PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_USERNAME)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    LearnerProfile profile = new LearnerProfile(
                            rs.getInt("id"),
                            rs.getString("username"),
                            rs.getInt("age"),
                            rs.getInt("difficulty_level"));
                    return Optional.of(profile);
                }
                return Optional.empty();
            }
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    /**
     * Persists a difficulty-level change for the given user.
     */
    public void updateDifficultyLevel(int userId, int newLevel) throws SQLException {
        Connection conn = DatabaseConfig.getConnection();
        try (PreparedStatement ps = conn.prepareStatement(SQL_UPDATE_DIFFICULTY)) {
            ps.setInt(1, newLevel);
            ps.setInt(2, userId);
            ps.executeUpdate();
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }
}
