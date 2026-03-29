package com.aichatboard.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import com.aichatboard.db.DBConnection;

/**
 * ChatDAO class - Data Access Object for Chat History operations
 * 
 * This class handles all database operations related to chat messages:
 * - Saving user messages and AI responses
 * - Retrieving chat history for a user
 * 
 * Uses PreparedStatement for SQL injection prevention
 */
public class ChatDAO {
    
    /**
     * Inner class to represent a chat message with its response
     */
    public static class ChatMessage {
        public int chatId;
        public int userId;
        public String userMessage;
        public String aiResponse;
        public String createdAt;
        
        public ChatMessage(int chatId, int userId, String userMessage, 
                          String aiResponse, String createdAt) {
            this.chatId = chatId;
            this.userId = userId;
            this.userMessage = userMessage;
            this.aiResponse = aiResponse;
            this.createdAt = createdAt;
        }
        
        @Override
        public String toString() {
            return "\n┌─ Chat ID: " + chatId +
                   "\n│  Time: " + createdAt +
                   "\n│  User: " + userMessage +
                   "\n│  AI: " + aiResponse +
                   "\n└────────────────────────";
        }
    }
    
    /**
     * Saves a chat message and AI response to the database
     * 
     * @param userId the ID of the user sending the message
     * @param userMessage the user's message text
     * @param aiResponse the AI's response text
     * @return true if save is successful, false otherwise
     */
    public static boolean saveChatMessage(int userId, String userMessage, String aiResponse) {
        Connection connection = null;
        boolean saveSuccess = false;
        
        try {
            connection = DBConnection.getConnection();
            
            // Insert chat message and response into database using PreparedStatement
            String insertQuery = "INSERT INTO chat_history (user_id, user_message, ai_response) " +
                               "VALUES (?, ?, ?)";
            PreparedStatement preparedStatement = connection.prepareStatement(insertQuery);
            
            preparedStatement.setInt(1, userId);
            preparedStatement.setString(2, userMessage);
            preparedStatement.setString(3, aiResponse);
            
            int rowsAffected = preparedStatement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("✓ Chat message saved successfully!");
                saveSuccess = true;
            }
            
            preparedStatement.close();
            
        } catch (ClassNotFoundException e) {
            System.err.println("✗ Database Driver Error: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("✗ Database Error while saving chat: " + e.getMessage());
        } finally {
            if (connection != null) {
                DBConnection.closeConnection(connection);
            }
        }
        
        return saveSuccess;
    }
    
    /**
     * Retrieves all chat messages for a specific user
     * 
     * @param userId the ID of the user whose chat history to retrieve
     * @return List of ChatMessage objects, or empty list if none found
     */
    public static List<ChatMessage> getChatHistory(int userId) {
        Connection connection = null;
        List<ChatMessage> chatMessages = new ArrayList<>();
        
        try {
            connection = DBConnection.getConnection();
            
            // Query chat history for the user, ordered by most recent first
            String selectQuery = "SELECT chat_id, user_id, user_message, ai_response, " +
                               "created_at FROM chat_history WHERE user_id = ? " +
                               "ORDER BY created_at ASC";
            PreparedStatement preparedStatement = connection.prepareStatement(selectQuery);
            
            preparedStatement.setInt(1, userId);
            
            ResultSet resultSet = preparedStatement.executeQuery();
            
            while (resultSet.next()) {
                int chatId = resultSet.getInt("chat_id");
                int fetchedUserId = resultSet.getInt("user_id");
                String userMessage = resultSet.getString("user_message");
                String aiResponse = resultSet.getString("ai_response");
                Timestamp timestamp = resultSet.getTimestamp("created_at");
                String createdAt = timestamp != null ? timestamp.toString() : "Unknown";
                
                ChatMessage chat = new ChatMessage(chatId, fetchedUserId, userMessage, 
                                                  aiResponse, createdAt);
                chatMessages.add(chat);
            }
            
            resultSet.close();
            preparedStatement.close();
            
            if (chatMessages.isEmpty()) {
                System.out.println("ℹ No chat history found for this user.");
            } else {
                System.out.println("✓ Retrieved " + chatMessages.size() + " chat message(s).");
            }
            
        } catch (ClassNotFoundException e) {
            System.err.println("✗ Database Driver Error: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("✗ Database Error while retrieving chat history: " + e.getMessage());
        } finally {
            if (connection != null) {
                DBConnection.closeConnection(connection);
            }
        }
        
        return chatMessages;
    }
    
    /**
     * Gets the count of chat messages for a specific user
     * 
     * @param userId the ID of the user
     * @return the number of chat messages, or -1 on error
     */
    public static int getChatCount(int userId) {
        Connection connection = null;
        int count = -1;
        
        try {
            connection = DBConnection.getConnection();
            
            String countQuery = "SELECT COUNT(*) as total FROM chat_history WHERE user_id = ?";
            PreparedStatement preparedStatement = connection.prepareStatement(countQuery);
            
            preparedStatement.setInt(1, userId);
            
            ResultSet resultSet = preparedStatement.executeQuery();
            
            if (resultSet.next()) {
                count = resultSet.getInt("total");
            }
            
            resultSet.close();
            preparedStatement.close();
            
        } catch (ClassNotFoundException e) {
            System.err.println("✗ Database Driver Error: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("✗ Database Error while counting chats: " + e.getMessage());
        } finally {
            if (connection != null) {
                DBConnection.closeConnection(connection);
            }
        }
        
        return count;
    }
    
    /**
     * Deletes all chat messages for a specific user
     * 
     * @param userId the ID of the user
     * @return true if deletion is successful, false otherwise
     */
    public static boolean deleteUserChat(int userId) {
        Connection connection = null;
        boolean deleteSuccess = false;
        
        try {
            connection = DBConnection.getConnection();
            
            String deleteQuery = "DELETE FROM chat_history WHERE user_id = ?";
            PreparedStatement preparedStatement = connection.prepareStatement(deleteQuery);
            
            preparedStatement.setInt(1, userId);
            
            int rowsAffected = preparedStatement.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("✓ Chat history deleted successfully!");
                deleteSuccess = true;
            } else {
                System.out.println("ℹ No chat history found to delete.");
            }
            
            preparedStatement.close();
            
        } catch (ClassNotFoundException e) {
            System.err.println("✗ Database Driver Error: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("✗ Database Error while deleting chat: " + e.getMessage());
        } finally {
            if (connection != null) {
                DBConnection.closeConnection(connection);
            }
        }
        
        return deleteSuccess;
    }
}
