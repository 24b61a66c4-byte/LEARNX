package com.learnx.db;

import com.learnx.core.PerformanceMetrics;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Data-access object for the {@code performance} table.
 *
 * <h2>Performance improvements applied here</h2>
 * <ol>
 *   <li><strong>Connection reuse</strong> – connections are borrowed from the pool in
 *       {@link DatabaseConfig} and returned in {@code finally} blocks.</li>
 *   <li><strong>Composite index</strong> – the schema declares
 *       {@code idx_performance_user_topic (user_id, topic_id)} which makes the
 *       {@link #findByUserAndTopic} query an index seek instead of a full-table scan.</li>
 *   <li><strong>Covering index for latest-session queries</strong> –
 *       {@code idx_performance_user_date (user_id, session_date DESC)} enables the
 *       {@link #findLatestByUser} query to read only the index without touching the data pages.</li>
 * </ol>
 */
public class PerformanceDao {

    private static final String SQL_INSERT =
            "INSERT INTO performance (user_id, topic_id, total_questions, correct_answers, session_date)"
            + " VALUES (?, ?, ?, ?, NOW())";
    private static final String SQL_FIND_BY_USER_TOPIC =
            "SELECT id, user_id, topic_id, total_questions, correct_answers"
            + " FROM performance WHERE user_id = ? AND topic_id = ?"
            + " ORDER BY session_date DESC";
    private static final String SQL_FIND_LATEST_BY_USER =
            "SELECT id, user_id, topic_id, total_questions, correct_answers"
            + " FROM performance WHERE user_id = ?"
            + " ORDER BY session_date DESC LIMIT 10";

    /**
     * Persists a completed session's performance record.
     */
    public void saveMetrics(PerformanceMetrics metrics) throws SQLException {
        Connection conn = DatabaseConfig.getConnection();
        try (PreparedStatement ps = conn.prepareStatement(SQL_INSERT)) {
            ps.setInt(1, metrics.getUserId());
            ps.setString(2, metrics.getTopicId());
            ps.setInt(3, metrics.getTotalQuestions());
            ps.setInt(4, metrics.getCorrectAnswers());
            ps.executeUpdate();
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    /**
     * Returns all performance records for a user on a specific topic.
     *
     * <p>The {@code (user_id, topic_id)} composite index makes this an O(log n) seek + short scan
     * instead of a full-table scan.
     */
    public List<PerformanceMetrics> findByUserAndTopic(int userId, String topicId)
            throws SQLException {
        Connection conn = DatabaseConfig.getConnection();
        try (PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_USER_TOPIC)) {
            ps.setInt(1, userId);
            ps.setString(2, topicId);
            List<PerformanceMetrics> results = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PerformanceMetrics m = new PerformanceMetrics(
                            rs.getInt("user_id"), rs.getString("topic_id"));
                    m.setTotalQuestions(rs.getInt("total_questions"));
                    m.setCorrectAnswers(rs.getInt("correct_answers"));
                    results.add(m);
                }
            }
            return results;
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }

    /**
     * Returns the 10 most recent performance records for a user across all topics.
     *
     * <p>The {@code (user_id, session_date DESC)} index makes this a fast index scan.
     */
    public List<PerformanceMetrics> findLatestByUser(int userId) throws SQLException {
        Connection conn = DatabaseConfig.getConnection();
        try (PreparedStatement ps = conn.prepareStatement(SQL_FIND_LATEST_BY_USER)) {
            ps.setInt(1, userId);
            List<PerformanceMetrics> results = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PerformanceMetrics m = new PerformanceMetrics(
                            rs.getInt("user_id"), rs.getString("topic_id"));
                    m.setTotalQuestions(rs.getInt("total_questions"));
                    m.setCorrectAnswers(rs.getInt("correct_answers"));
                    results.add(m);
                }
            }
            return results;
        } finally {
            DatabaseConfig.releaseConnection(conn);
        }
    }
}
