package com.learnx.db.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Provides JDBC {@link Connection} instances using credentials loaded
 * from environment variables.
 *
 * <p>Required environment variables:
 * <ul>
 *   <li>{@code DB_URL}      – JDBC URL, e.g. {@code jdbc:mysql://localhost:3306/learnx}</li>
 *   <li>{@code DB_USER}     – database username</li>
 *   <li>{@code DB_PASSWORD} – database password</li>
 * </ul>
 */
public class DatabaseConfig {

    private static final String URL  = System.getenv("DB_URL");
    private static final String USER = System.getenv("DB_USER");
    private static final String PASS = System.getenv("DB_PASSWORD");

    private DatabaseConfig() {}

    /**
     * Opens and returns a new JDBC connection.
     * The caller is responsible for closing the connection.
     *
     * @return a live {@link Connection}
     * @throws SQLException if the connection cannot be established
     */
    public static Connection getConnection() throws SQLException {
        if (URL == null || USER == null || PASS == null) {
            throw new IllegalStateException(
                    "Database environment variables (DB_URL, DB_USER, DB_PASSWORD) are not set.");
        }
        return DriverManager.getConnection(URL, USER, PASS);
    }
}
