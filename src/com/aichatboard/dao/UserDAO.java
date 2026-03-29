package com.aichatboard.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import com.aichatboard.db.DBConnection;

/**
 * UserDAO class - Data Access Object for User operations
 * 
 * This class handles all database operations related to users:
 * - User Registration (Signup)
 * - User Authentication (Login)
 * 
 * Security Note: Uses PreparedStatement to prevent SQL Injection attacks
 */
public class UserDAO {
    
    /**
     * Registers a new user in the database
     * 
     * Features:
     * - Validates if username already exists
     * - Validates if email already exists
     * - Uses PreparedStatement to prevent SQL injection
     * - Stores encrypted/plain password (for production, use bcrypt or similar)
     * 
     * @param username the username for the new account
     * @param email the email address for the new account
     * @param password the password for the new account
     * @return true if signup is successful, false if username/email already exists
     */
    public static boolean signup(String username, String email, String password) {
        Connection connection = null;
        boolean signupSuccess = false;
        
        try {
            connection = DBConnection.getConnection();
            
            // Check if username already exists
            if (isUsernameExists(connection, username)) {
                System.out.println("✗ Signup failed! Username '" + username + "' already exists.");
                return false;
            }
            
            // Check if email already exists
            if (isEmailExists(connection, email)) {
                System.out.println("✗ Signup failed! Email '" + email + "' already exists.");
                return false;
            }
            
            // Insert new user into database using PreparedStatement
            String insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
            PreparedStatement preparedStatement = connection.prepareStatement(insertQuery);
            
            preparedStatement.setString(1, username);
            preparedStatement.setString(2, email);
            preparedStatement.setString(3, password);
            
            int rowsAffected = preparedStatement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("✓ Signup successful! User '" + username + "' registered successfully.");
                signupSuccess = true;
            }
            
            preparedStatement.close();
            
        } catch (ClassNotFoundException e) {
            System.err.println("✗ Database Driver Error: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("✗ Database Error during signup: " + e.getMessage());
        } finally {
            if (connection != null) {
                DBConnection.closeConnection(connection);
            }
        }
        
        return signupSuccess;
    }
    
    /**
     * Authenticates a user by validating username and password
     * 
     * Features:
     * - Validates user credentials
     * - Returns user_id if authentication is successful
     * - Uses PreparedStatement to prevent SQL injection
     * 
     * @param username the username to authenticate
     * @param password the password to validate
     * @return user_id if login is successful, -1 if login fails
     */
    public static int login(String username, String password) {
        Connection connection = null;
        int userId = -1;
        
        try {
            connection = DBConnection.getConnection();
            
            // Query user by username and password using PreparedStatement
            String loginQuery = "SELECT user_id FROM users WHERE username = ? AND password = ?";
            PreparedStatement preparedStatement = connection.prepareStatement(loginQuery);
            
            preparedStatement.setString(1, username);
            preparedStatement.setString(2, password);
            
            ResultSet resultSet = preparedStatement.executeQuery();
            
            if (resultSet.next()) {
                userId = resultSet.getInt("user_id");
                System.out.println("✓ Login successful! Welcome, " + username + "!");
            } else {
                System.out.println("✗ Login failed! Invalid username or password.");
            }
            
            resultSet.close();
            preparedStatement.close();
            
        } catch (ClassNotFoundException e) {
            System.err.println("✗ Database Driver Error: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("✗ Database Error during login: " + e.getMessage());
        } finally {
            if (connection != null) {
                DBConnection.closeConnection(connection);
            }
        }
        
        return userId;
    }
    
    /**
     * Checks if a username already exists in the database
     * 
     * @param connection the database connection
     * @param username the username to check
     * @return true if username exists, false otherwise
     */
    private static boolean isUsernameExists(Connection connection, String username) {
        try {
            String checkQuery = "SELECT user_id FROM users WHERE username = ?";
            PreparedStatement preparedStatement = connection.prepareStatement(checkQuery);
            preparedStatement.setString(1, username);
            
            ResultSet resultSet = preparedStatement.executeQuery();
            boolean exists = resultSet.next();
            
            resultSet.close();
            preparedStatement.close();
            
            return exists;
        } catch (SQLException e) {
            System.err.println("✗ Error checking username: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Checks if an email already exists in the database
     * 
     * @param connection the database connection
     * @param email the email to check
     * @return true if email exists, false otherwise
     */
    private static boolean isEmailExists(Connection connection, String email) {
        try {
            String checkQuery = "SELECT user_id FROM users WHERE email = ?";
            PreparedStatement preparedStatement = connection.prepareStatement(checkQuery);
            preparedStatement.setString(1, email);
            
            ResultSet resultSet = preparedStatement.executeQuery();
            boolean exists = resultSet.next();
            
            resultSet.close();
            preparedStatement.close();
            
            return exists;
        } catch (SQLException e) {
            System.err.println("✗ Error checking email: " + e.getMessage());
            return false;
        }
    }
}
