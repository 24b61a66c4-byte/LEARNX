package com.aichatboard.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DBConnection class - Manages JDBC database connection
 * 
 * This class provides a centralized method to establish and manage
 * connections to the MySQL database for the AI Chat Board application.
 * 
 * Database Configuration:
 * - Driver: MySQL JDBC Driver
 * - Host: localhost
 * - Port: 3306
 * - Database: aichatboard
 */
public class DBConnection {
    
    // Database configuration constants
    private static final String DB_DRIVER = "com.mysql.cj.jdbc.Driver";
    private static final String DB_URL = "jdbc:mysql://localhost:3306/aichatboard";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "";
    
    /**
     * Establishes and returns a database connection
     * 
     * @return Connection object connected to the aichatboard database
     * @throws ClassNotFoundException if MySQL JDBC driver is not found
     * @throws SQLException if database connection fails
     */
    public static Connection getConnection() throws ClassNotFoundException, SQLException {
        try {
            // Load MySQL JDBC Driver
            Class.forName(DB_DRIVER);
            
            // Establish connection to the database
            Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
            
            System.out.println("✓ Database connection established successfully!");
            return connection;
            
        } catch (ClassNotFoundException e) {
            System.err.println("✗ MySQL JDBC Driver not found!");
            System.err.println("  Please ensure MySQL Connector/J JAR is in your classpath");
            throw e;
            
        } catch (SQLException e) {
            System.err.println("✗ Failed to connect to database!");
            System.err.println("  Error: " + e.getMessage());
            System.err.println("  Please verify:");
            System.err.println("  1. MySQL server is running");
            System.err.println("  2. Database 'aichatboard' exists");
            System.err.println("  3. Username and password are correct");
            throw e;
        }
    }
    
    /**
     * Safely closes a database connection
     * 
     * @param connection the Connection object to close
     */
    public static void closeConnection(Connection connection) {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                System.out.println("✓ Database connection closed successfully!");
            }
        } catch (SQLException e) {
            System.err.println("✗ Error closing database connection: " + e.getMessage());
        }
    }
}
