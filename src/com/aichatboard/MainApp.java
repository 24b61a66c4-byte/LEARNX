package com.aichatboard;

import java.util.List;
import java.util.Scanner;
import com.aichatboard.dao.ChatDAO;
import com.aichatboard.dao.ChatDAO.ChatMessage;
import com.aichatboard.dao.UserDAO;

/**
 * MainApp class - Main driver application for AI Chat Board
 * 
 * This is the entry point for the AI Chat Board application.
 * 
 * Program Flow:
 * 1. Display main menu (Signup / Login)
 * 2. Upon successful login:
 *    - User can send messages
 *    - Generate dummy AI responses
 *    - View chat history
 *    - Logout
 * 
 * Features:
 * - Menu-driven user interface
 * - Input validation
 * - Exception handling
 * - Clean separation of concerns
 */
public class MainApp {
    
    private static Scanner scanner = new Scanner(System.in);
    private static int loggedInUserId = -1;
    private static String loggedInUsername = "";
    
    public static void main(String[] args) {
        System.out.println("\n" +
            "╔═══════════════════════════════════════╗\n" +
            "║   Welcome to AI Chat Board Backend    ║\n" +
            "║   Powered by Java & JDBC              ║\n" +
            "╚═══════════════════════════════════════╝\n");
        
        // Main application loop
        while (true) {
            if (loggedInUserId == -1) {
                displayAuthenticationMenu();
            } else {
                displayChatMenu();
            }
        }
    }
    
    /**
     * Displays the authentication menu (Signup / Login)
     * Only shown when user is not logged in
     */
    private static void displayAuthenticationMenu() {
        System.out.println("\n┌─────────────────────────────────────┐");
        System.out.println("│     AUTHENTICATION MENU              │");
        System.out.println("├─────────────────────────────────────┤");
        System.out.println("│ 1. Signup (Create New Account)       │");
        System.out.println("│ 2. Login (Sign In)                   │");
        System.out.println("│ 3. Exit Application                  │");
        System.out.println("└─────────────────────────────────────┘");
        System.out.print("→ Enter your choice (1-3): ");
        
        String choice = scanner.nextLine().trim();
        
        switch(choice) {
            case "1":
                handleSignup();
                break;
            case "2":
                handleLogin();
                break;
            case "3":
                System.out.println("\n✓ Thank you for using AI Chat Board. Goodbye!");
                System.exit(0);
                break;
            default:
                System.out.println("✗ Invalid choice. Please enter 1, 2, or 3.");
        }
    }
    
    /**
     * Handles user signup (registration)
     */
    private static void handleSignup() {
        System.out.println("\n┌─────────────────────────────────────┐");
        System.out.println("│          CREATE NEW ACCOUNT           │");
        System.out.println("└─────────────────────────────────────┘");
        
        System.out.print("→ Enter username: ");
        String username = scanner.nextLine().trim();
        
        if (username.isEmpty() || username.length() < 3) {
            System.out.println("✗ Username must be at least 3 characters long!");
            return;
        }
        
        System.out.print("→ Enter email: ");
        String email = scanner.nextLine().trim();
        
        if (email.isEmpty() || !email.contains("@")) {
            System.out.println("✗ Please enter a valid email address!");
            return;
        }
        
        System.out.print("→ Enter password: ");
        String password = scanner.nextLine().trim();
        
        if (password.isEmpty() || password.length() < 4) {
            System.out.println("✗ Password must be at least 4 characters long!");
            return;
        }
        
        System.out.print("→ Confirm password: ");
        String confirmPassword = scanner.nextLine().trim();
        
        if (!password.equals(confirmPassword)) {
            System.out.println("✗ Passwords do not match!");
            return;
        }
        
        // Call signup DAO method
        boolean success = UserDAO.signup(username, email, password);
        
        if (success) {
            System.out.println("→ You can now login with your credentials.");
        }
    }
    
    /**
     * Handles user login (authentication)
     */
    private static void handleLogin() {
        System.out.println("\n┌─────────────────────────────────────┐");
        System.out.println("│           USER LOGIN                 │");
        System.out.println("└─────────────────────────────────────┘");
        
        System.out.print("→ Enter username: ");
        String username = scanner.nextLine().trim();
        
        if (username.isEmpty()) {
            System.out.println("✗ Username cannot be empty!");
            return;
        }
        
        System.out.print("→ Enter password: ");
        String password = scanner.nextLine().trim();
        
        if (password.isEmpty()) {
            System.out.println("✗ Password cannot be empty!");
            return;
        }
        
        // Call login DAO method
        int userId = UserDAO.login(username, password);
        
        if (userId != -1) {
            loggedInUserId = userId;
            loggedInUsername = username;
        }
    }
    
    /**
     * Displays the chat menu for logged-in users
     * Allows user to send messages, view history, and logout
     */
    private static void displayChatMenu() {
        System.out.println("\n┌─────────────────────────────────────┐");
        System.out.println("│ Welcome, " + String.format("%-25s", loggedInUsername) + "│");
        System.out.println("├─────────────────────────────────────┤");
        System.out.println("│ 1. Send Message                      │");
        System.out.println("│ 2. View Chat History                 │");
        System.out.println("│ 3. Delete Chat History               │");
        System.out.println("│ 4. Logout                            │");
        System.out.println("└─────────────────────────────────────┘");
        System.out.print("→ Enter your choice (1-4): ");
        
        String choice = scanner.nextLine().trim();
        
        switch(choice) {
            case "1":
                handleSendMessage();
                break;
            case "2":
                displayChatHistory();
                break;
            case "3":
                handleDeleteChatHistory();
                break;
            case "4":
                handleLogout();
                break;
            default:
                System.out.println("✗ Invalid choice. Please enter 1, 2, 3, or 4.");
        }
    }
    
    /**
     * Handles sending a message and generating AI response
     */
    private static void handleSendMessage() {
        System.out.println("\n┌─────────────────────────────────────┐");
        System.out.println("│        SEND MESSAGE TO AI BOT        │");
        System.out.println("└─────────────────────────────────────┘");
        
        System.out.print("→ Type your message: ");
        String userMessage = scanner.nextLine().trim();
        
        if (userMessage.isEmpty()) {
            System.out.println("✗ Message cannot be empty!");
            return;
        }
        
        System.out.println("\n⏳ AI is thinking...");
        
        // Generate dummy AI response
        String aiResponse = generateAIResponse(userMessage);
        
        System.out.println("\n✓ User Message: " + userMessage);
        System.out.println("→ AI Response: " + aiResponse);
        
        // Save chat message to database
        boolean saved = ChatDAO.saveChatMessage(loggedInUserId, userMessage, aiResponse);
        
        if (saved) {
            System.out.println("✓ Conversation saved to chat history.");
        } else {
            System.out.println("✗ Failed to save conversation. Please try again.");
        }
    }
    
    /**
     * Displays chat history for the logged-in user
     */
    private static void displayChatHistory() {
        System.out.println("\n┌─────────────────────────────────────┐");
        System.out.println("│         CHAT HISTORY                 │");
        System.out.println("└─────────────────────────────────────┘");
        
        List<ChatMessage> chatMessages = ChatDAO.getChatHistory(loggedInUserId);
        
        if (chatMessages.isEmpty()) {
            System.out.println("ℹ No chat messages found. Start a conversation!");
            return;
        }
        
        System.out.println("\n═══════════════════════════════════════");
        System.out.println("Total Messages: " + chatMessages.size());
        System.out.println("═══════════════════════════════════════");
        
        for (ChatMessage chat : chatMessages) {
            System.out.println(chat);
        }
    }
    
    /**
     * Handles deletion of chat history
     */
    private static void handleDeleteChatHistory() {
        System.out.println("\n┌─────────────────────────────────────┐");
        System.out.println("│      DELETE CHAT HISTORY             │");
        System.out.println("└─────────────────────────────────────┘");
        
        System.out.print("→ Are you sure? (yes/no): ");
        String confirm = scanner.nextLine().trim().toLowerCase();
        
        if (confirm.equals("yes") || confirm.equals("y")) {
            boolean deleted = ChatDAO.deleteUserChat(loggedInUserId);
            if (deleted) {
                System.out.println("✓ Chat history has been deleted.");
            }
        } else {
            System.out.println("✗ Operation cancelled.");
        }
    }
    
    /**
     * Handles user logout
     */
    private static void handleLogout() {
        System.out.println("\n✓ You have been logged out successfully!");
        System.out.println("→ Thank you for using AI Chat Board. See you soon!");
        
        loggedInUserId = -1;
        loggedInUsername = "";
    }
    
    /**
     * Generates a dummy AI response for demonstration
     * In a real application, this would call an actual AI service/API
     * 
     * @param userMessage the user's input message
     * @return a dummy AI response based on keywords
     */
    private static String generateAIResponse(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();
        
        // Dummy AI responses based on keywords
        if (lowerMessage.contains("hello") || lowerMessage.contains("hi") || 
            lowerMessage.contains("greet")) {
            return "Hello! How can I assist you today?";
        } else if (lowerMessage.contains("how are you") || lowerMessage.contains("how r u")) {
            return "I'm doing great! Thanks for asking. How can I help you?";
        } else if (lowerMessage.contains("weather")) {
            return "I don't have access to real-time weather data, but you can check " +
                   "a weather app for accurate information!";
        } else if (lowerMessage.contains("time")) {
            return "The current time is: " + new java.util.Date();
        } else if (lowerMessage.contains("help")) {
            return "I'm here to help! What do you need assistance with?";
        } else if (lowerMessage.contains("who are you") || lowerMessage.contains("what's your name")) {
            return "I'm an AI Chat Bot running on Java with JDBC backend. " +
                   "I help manage chat conversations!";
        } else if (lowerMessage.contains("thank")) {
            return "You're welcome! Is there anything else I can help you with?";
        } else if (lowerMessage.contains("bye") || lowerMessage.contains("goodbye")) {
            return "Goodbye! Feel free to chat anytime. Take care!";
        } else if (lowerMessage.contains("?")) {
            return "That's an interesting question! I understand you're asking about: " +
                   userMessage.substring(0, Math.min(30, userMessage.length())) +
                   "... I'll provide a thoughtful response!";
        } else {
            String[] responses = {
                "That's interesting! Tell me more.",
                "I understand. Is there anything specific you'd like help with?",
                "Thanks for that input. How else can I assist you?",
                "I appreciate your message. What would you like to explore further?",
                "Got it! Would you like me to provide more details on this topic?"
            };
            return responses[(int) (Math.random() * responses.length)];
        }
    }
}
