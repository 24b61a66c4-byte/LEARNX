# AI Chat Board - Java Backend Project

A complete Java backend application for managing user authentication and chat history using JDBC and MySQL.

## 📋 Project Overview

This is a menu-driven console application that demonstrates:
- **User Authentication**: Signup and Login functionality
- **Database Design**: Proper schema with users and chat_history tables
- **JDBC Operations**: Secure database interactions using PreparedStatements
- **Chat Management**: Save and retrieve user messages with AI responses
- **Error Handling**: Comprehensive exception handling and validation

## 🛠️ Technology Stack

- **Language**: Java (Core Java)
- **Database**: MySQL
- **Database Connectivity**: JDBC (Java Database Connectivity)
- **IDE**: Eclipse, VS Code, or IntelliJ IDEA
- **Java Version**: Java 8 or higher

## 📁 Project Structure

```
ai chat board/
├── src/
│   └── com/aichatboard/
│       ├── MainApp.java               # Main driver application
│       ├── db/
│       │   └── DBConnection.java      # Database connection utility
│       └── dao/
│           ├── UserDAO.java           # User signup/login operations
│           └── ChatDAO.java           # Chat message operations
└── database/
    └── aichatboard_database.sql       # MySQL database and table creation scripts
```

## 📦 Prerequisites

Before running this project, ensure you have:

1. **Java Development Kit (JDK)** - Java 8 or higher
   - Download from: https://www.oracle.com/java/technologies/javase-downloads.html
   - Verify installation: `java -version`

2. **MySQL Server** - Version 5.7 or higher
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Ensure MySQL server is running

3. **MySQL JDBC Driver** - mysql-connector-java JAR file
   - Download from: https://dev.mysql.com/downloads/connector/j/
   - Or use: `mysql-connector-java-8.0.x.jar` (latest version)

## 🚀 Installation & Setup

### Step 1: Set Up the Database

1. Open MySQL Command Line or MySQL Workbench
2. Execute the SQL script to create database and tables:
   ```sql
   SOURCE database/aichatboard_database.sql;
   ```
   
   Or copy-paste the contents of `database/aichatboard_database.sql` and run it

3. Verify tables were created:
   ```sql
   USE aichatboard;
   SHOW TABLES;
   DESCRIBE users;
   DESCRIBE chat_history;
   ```

### Step 2: Configure Database Connection

Edit `src/com/aichatboard/db/DBConnection.java` and update these lines:

```java
private static final String DB_URL = "jdbc:mysql://localhost:3306/aichatboard";
private static final String DB_USER = "root";              // Your MySQL username
private static final String DB_PASSWORD = "";             // Your MySQL password
```

### Step 3: Add MySQL JDBC Driver to Classpath

#### For Eclipse:
1. Right-click on project → Build Path → Configure Build Path
2. Click "Add External JAR..." / "Add Library..."
3. Select `mysql-connector-java-x.x.x.jar`
4. Click "Apply and Close"

#### For VS Code:
1. Create a `lib/` folder in the project root
2. Copy `mysql-connector-java-x.x.x.jar` to `lib/`
3. Update classpath in compilation and execution commands

#### For Command Line:
```bash
javac -cp ".:lib/mysql-connector-java-8.0.33.jar" src/com/aichatboard/**/*.java
java -cp ".:lib/mysql-connector-java-8.0.33.jar" com.aichatboard.MainApp
```

### Step 4: Compile the Project

#### Using Command Line:
```bash
# Navigate to project directory
cd "ai chat board"

# On Windows:
javac -cp "bin;lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/db/DBConnection.java
javac -cp "bin;lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/dao/UserDAO.java
javac -cp "bin;lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/dao/ChatDAO.java
javac -cp "bin;lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/MainApp.java

# Or compile all at once:
javac -cp "lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/db/*.java
javac -cp "lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/dao/*.java
javac -cp "lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/*.java
```

#### Using Eclipse:
1. Create new Java Project
2. Copy source files to `src/` folder
3. Add JDBC JAR to Build Path
4. Project → Build All

### Step 5: Run the Application

#### Using Command Line (Windows):
```bash
java -cp "bin;lib/mysql-connector-java-8.0.33.jar" com.aichatboard.MainApp
```

#### Using Eclipse:
1. Right-click on `MainApp.java`
2. Run As → Java Application

## 💻 Usage Guide

### Main Menu
```
1. Signup - Create a new account (username, email, password)
2. Login - Sign in with existing credentials
3. Exit - Close the application
```

### After Login
```
1. Send Message - Send a message and get AI response (saved to database)
2. View Chat History - See all your previous messages and responses
3. Delete Chat History - Remove all your chat conversations
4. Logout - Sign out and return to main menu
```

## 🔑 Key Features

### 1. User Authentication
- **Signup**: Register new users with validation
  - Prevents duplicate usernames and emails
  - Minimum password length validation
  - Password confirmation check

- **Login**: Authenticate users
  - Returns user_id for database operations
  - Secure credential validation

### 2. Database Security
- **PreparedStmt**: All queries use PreparedStatement to prevent SQL injection
- **Unique Constraints**: Username and email are unique in database
- **Foreign Keys**: chat_history has foreign key to users table
- **Data Integrity**: CASCADE delete for maintaining referential integrity

### 3. Chat Management
- **Save Messages**: Store user messages and AI responses with timestamps
- **Retrieve History**: View all chat messages for a user, sorted by time
- **Delete History**: Clear all messages for a user
- **Message Count**: Track number of messages per user

### 4. AI Response Generation
- Dummy AI responses based on keywords
- In production, replace with actual API calls (OpenAI, etc.)
- Responses are customizable and extensible

## 📊 Database Schema

### users table
```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### chat_history table
```sql
CREATE TABLE chat_history (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

## 🔒 Security Considerations

1. **SQL Injection Prevention**: Uses PreparedStatement with parameterized queries
2. **Input Validation**: All user inputs are validated before processing
3. **Password Security**: In production, use bcrypt for password hashing
4. **Exception Handling**: Proper error messages without exposing sensitive info
5. **Connection Management**: Connections are properly closed in finally blocks

## 🧪 Testing

### Test Scenario 1: User Registration
```
1. Choose Signup
2. Enter: username="john_doe", email="john@example.com", password="pass123"
3. Confirm password: "pass123"
4. Should see: "✓ Signup successful!"
```

### Test Scenario 2: User Login & Chat
```
1. Choose Login
2. Enter: username="john_doe", password="pass123"
3. Should see: "✓ Login successful! Welcome, john_doe!"
4. Send message: "Hello AI"
5. Should receive response and see: "✓ Chat message saved successfully!"
```

### Test Scenario 3: View Chat History
```
1. After login, choose "View Chat History"
2. Should show all previous messages with timestamps
3. Format: Chat ID, Time, User Message, AI Response
```

## ⚠️ Troubleshooting

### Issue: "com.mysql.cj.jdbc.Driver not found"
**Solution**: 
- Ensure MySQL JDBC JAR is in classpath
- Check JAR file name and version match
- Verify JAR is in the correct lib/ folder

### Issue: "Access denied for user 'root'@'localhost'"
**Solution**:
- Update DB_PASSWORD in DBConnection.java
- Ensure MySQL is running
- Verify username/password are correct

### Issue: "Unknown database 'aichatboard'"
**Solution**:
- Run the aichatboard_database.sql script
- Verify database creation: `SHOW DATABASES;`
- Check for typos in database name

### Issue: "Port 3306 Connection refused"
**Solution**:
- Ensure MySQL server is running
- Check MySQL port (default 3306)
- Verify firewall settings

## 📝 File Descriptions

### DBConnection.java
- Manages JDBC database connections
- Centralized connection creation
- Error handling and connection closure

### UserDAO.java
- Handles user signup and login
- Validates existing users
- Uses PreparedStatement for security

### ChatDAO.java
- Saves and retrieves chat messages
- Manages chat history
- Returns formatted ChatMessage objects

### MainApp.java
- Console-based user interface
- Menu-driven application flow
- Orchestrates UserDAO and ChatDAO operations

## 🎯 Future Enhancements

1. **Implement Password Hashing**: Use BCrypt or PBKDF2
2. **Add Real AI API**: Integrate with OpenAI or similar
3. **User Profile Management**: Update username, email, password
4. **Search Functionality**: Search chat history by keywords
5. **Export Chat**: Export conversations to file
6. **Web Frontend**: Create REST API and web interface
7. **Database Connection Pooling**: Implement HikariCP
8. **Logging**: Add log4j for better logging
9. **Unit Testing**: Add JUnit test cases
10. **Authentication**: Implement JWT tokens

## 🤝 Contributing

This is an educational project. Feel free to:
- Enhance features
- Improve security
- Add new functionality
- Fix bugs
- Optimize performance

## 📄 License

This project is provided as-is for educational purposes.

## 👨‍💻 Author

Created as a comprehensive educational project demonstrating:
- Java fundamentals
- JDBC database programming
- Object-oriented design principles
- Application architecture
- Exception handling best practices

---

**Happy Coding!** 🚀

For questions or issues, review the comments in each Java file for detailed explanations.
