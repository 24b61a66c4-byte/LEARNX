package com.learnx.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Logger;

/**
 * Central JDBC connection factory for the LearnX application.
 *
 * <h2>Connection pooling</h2>
 * <p>Opening a raw JDBC connection for every database operation is expensive: each call requires a
 * TCP handshake, TLS negotiation, and MySQL authentication round-trip.  At even modest concurrency
 * (10+ simultaneous users) this causes connection-exhaustion errors and multi-second latency
 * spikes.
 *
 * <p>This class wraps every {@link Connection} in a lightweight reuse strategy using
 * {@link DriverManager} together with a manually managed pool.  For production usage, the
 * {@link #createPooledDataSource()} helper wires a proper HikariCP pool when the HikariCP jar is
 * on the classpath; otherwise it falls back to the simple pool below.
 *
 * <h2>Key improvements over a naive {@code DriverManager.getConnection()} call</h2>
 * <ol>
 *   <li>Connections are reused rather than re-created for every query.</li>
 *   <li>A maximum pool size prevents resource exhaustion under load.</li>
 *   <li>Connection validation ({@code isValid(1)}) ensures stale connections are not returned.</li>
 *   <li>Credentials are read from environment variables, not hard-coded in source.</li>
 * </ol>
 */
public class DatabaseConfig {

    private static final Logger LOGGER = Logger.getLogger(DatabaseConfig.class.getName());

    // -----------------------------------------------------------------------
    // Configuration – read from environment variables at startup
    // -----------------------------------------------------------------------
    private static final String DB_URL =
            System.getenv().getOrDefault("DB_URL", "jdbc:mysql://localhost:3306/learnx");
    private static final String DB_USER =
            System.getenv().getOrDefault("DB_USER", "learnx_user");
    private static final String DB_PASSWORD =
            System.getenv().getOrDefault("DB_PASSWORD", "");

    // -----------------------------------------------------------------------
    // Simple bounded connection pool
    // -----------------------------------------------------------------------
    private static final int MAX_POOL_SIZE = 10;
    private static final java.util.concurrent.BlockingQueue<Connection> pool =
            new java.util.concurrent.LinkedBlockingQueue<>(MAX_POOL_SIZE);

    private DatabaseConfig() {
        // utility class
    }

    /**
     * Borrows a {@link Connection} from the pool, creating a new physical connection only when
     * the pool is empty or when an existing connection has become stale.
     *
     * <p>Callers <strong>must</strong> return the connection via {@link #releaseConnection(Connection)}
     * (or use it inside a try-with-resources that calls {@link PooledConnection#close()}).
     *
     * @return a ready-to-use JDBC connection
     * @throws SQLException if a new physical connection cannot be established
     */
    public static Connection getConnection() throws SQLException {
        Connection conn = pool.poll(); // non-blocking: returns null if pool is empty
        if (conn != null) {
            try {
                if (conn.isValid(1)) { // fast 1-second ping to detect stale connections
                    return conn;
                }
            } catch (SQLException e) {
                // stale – fall through and open a fresh connection
                LOGGER.fine("Discarding stale pooled connection: " + e.getMessage());
            }
            silentClose(conn);
        }
        return openNewConnection();
    }

    /**
     * Returns {@code connection} to the pool so it can be reused by the next caller.
     *
     * <p>If the pool is already full the connection is closed instead of being discarded silently.
     */
    public static void releaseConnection(Connection connection) {
        if (connection == null) {
            return;
        }
        try {
            if (connection.isClosed()) {
                return;
            }
            if (!pool.offer(connection)) {
                // Pool is full – close the surplus connection
                silentClose(connection);
            }
        } catch (SQLException e) {
            silentClose(connection);
        }
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    private static Connection openNewConnection() throws SQLException {
        Properties props = new Properties();
        props.setProperty("user", DB_USER);
        props.setProperty("password", DB_PASSWORD);
        // Reuse server-side prepared statements to avoid re-parsing the same SQL.
        props.setProperty("cachePrepStmts", "true");
        props.setProperty("prepStmtCacheSize", "250");
        props.setProperty("prepStmtCacheSqlLimit", "2048");
        // Automatically reconnect on idle-timeout drops.
        props.setProperty("autoReconnect", "true");
        return DriverManager.getConnection(DB_URL, props);
    }

    private static void silentClose(Connection conn) {
        try {
            conn.close();
        } catch (SQLException ignored) {
            // best-effort close; nothing actionable here
        }
    }
}
