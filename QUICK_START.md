# AI Chat Board - Quick Start Guide

## For Windows Users

### Step 1: Download MySQL JDBC Driver
1. Download from: https://dev.mysql.com/downloads/connector/j/
2. Extract and place `mysql-connector-java-8.0.33.jar` in the `lib/` folder

### Step 2: Ensure MySQL is Running
```powershell
# Open Command Prompt as Administrator
net start MySQL80
```

### Step 3: Create Database
```bash
mysql -u root -p < database/aichatboard_database.sql
```

### Step 4: Configure Database Connection
Edit `src/com/aichatboard/db/DBConnection.java`:
```java
private static final String DB_USER = "root";           // Your username
private static final String DB_PASSWORD = "";          // Your password
```

### Step 5: Compile and Run
```bash
# Double-click compile.bat to compile
# Then double-click run.bat to run the application
```

---

## For Linux/macOS Users

### Step 1: Download MySQL JDBC Driver
```bash
# Create lib folder if it doesn't exist
mkdir -p lib

# Download the JAR file
# Visit: https://dev.mysql.com/downloads/connector/j/
# And place mysql-connector-java-8.0.33.jar in lib/ folder
```

### Step 2: Ensure MySQL is Running
```bash
# macOS with Homebrew
brew services start mysql

# Linux
sudo systemctl start mysql

# Or manually
mysql.server start
```

### Step 3: Create Database
```bash
mysql -u root -p < database/aichatboard_database.sql
```

### Step 4: Configure Database Connection
```bash
nano src/com/aichatboard/db/DBConnection.java

# Find and update:
# DB_USER = "root"
# DB_PASSWORD = "" (your password)
```

### Step 5: Make Scripts Executable and Run
```bash
# Make scripts executable
chmod +x compile.sh run.sh

# Compile
./compile.sh

# Run
./run.sh
```

---

## Project Structure After Setup

```
ai chat board/
├── src/
│   └── com/aichatboard/
│       ├── MainApp.java
│       ├── db/DBConnection.java
│       └── dao/
│           ├── UserDAO.java
│           └── ChatDAO.java
├── bin/                          (Created after compilation)
├── lib/
│   └── mysql-connector-java-8.0.33.jar
├── database/
│   └── aichatboard_database.sql
├── compile.bat / compile.sh      (Compilation scripts)
├── run.bat / run.sh              (Execution scripts)
├── README.md                     (Full documentation)
├── SETUP_GUIDE.md               (Detailed setup guide)
└── QUICK_START.md               (This file)
```

---

## Database Setup - Quick SQL Commands

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS aichatboard;
USE aichatboard;

-- Create Tables
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_history (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Indexes
CREATE INDEX idx_user_id ON chat_history(user_id);
CREATE INDEX idx_created_at ON chat_history(created_at);

-- Verify
SHOW TABLES;
```

---

## Testing the Application

When you run the application, you'll see this menu:

```
╔═══════════════════════════════════════╗
║   Welcome to AI Chat Board Backend    ║
║   Powered by Java & JDBC              ║
╚═══════════════════════════════════════╝

┌─────────────────────────────────────┐
│     AUTHENTICATION MENU              │
├─────────────────────────────────────┤
│ 1. Signup (Create New Account)       │
│ 2. Login (Sign In)                   │
│ 3. Exit Application                  │
└─────────────────────────────────────┘
→ Enter your choice (1-3):
```

### Test Flow:
1. **Signup**: Create account with username, email, password
2. **Login**: Sign in with your credentials
3. **Send Message**: Type a message and get AI response
4. **View History**: See all your chat messages
5. **Logout**: Sign out

---

## Common Issues & Solutions

### Issue: "Database Driver not found"
**Solution**: Download `mysql-connector-java-8.0.33.jar` and place in `lib/` folder

### Issue: "Connection refused"
**Solution**: Make sure MySQL server is running
```bash
# Windows: net start MySQL80
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Issue: "Unknown database 'aichatboard'"
**Solution**: Run the SQL script
```bash
mysql -u root -p < database/aichatboard_database.sql
```

### Issue: "Access denied for user 'root'"
**Solution**: Update credentials in DBConnection.java
```java
private static final String DB_USER = "root";
private static final String DB_PASSWORD = "your_password";  // Update this
```

---

## Key Features

✓ User Signup with validation  
✓ Secure Login authentication  
✓ Send messages and get AI responses  
✓ View chat history with timestamps  
✓ Delete chat history  
✓ SQL Injection prevention (PreparedStatement)  
✓ Exception handling  
✓ Clean menu-driven interface  

---

## Verification Checklist

- [ ] Java is installed (`java -version`)
- [ ] MySQL is installed and running
- [ ] MySQL JDBC driver is in `lib/` folder
- [ ] Database `aichatboard` is created
- [ ] Tables `users` and `chat_history` exist
- [ ] DBConnection.java has correct credentials
- [ ] Project compiles without errors
- [ ] Application starts successfully
- [ ] Can signup and login
- [ ] Can send messages and view history

---

## File Descriptions

| File | Purpose |
|------|---------|
| DBConnection.java | JDBC connection management |
| UserDAO.java | User signup/login logic |
| ChatDAO.java | Chat message storage/retrieval |
| MainApp.java | Menu-driven application |
| aichatboard_database.sql | Database and table creation |
| compile.bat/compile.sh | Compilation script |
| run.bat/run.sh | Execution script |

---

## Next Steps

1. Follow the setup steps above
2. Test all features
3. Review code comments for understanding
4. Extend functionality as needed
5. Read README.md for complete documentation

---

**For detailed information, see SETUP_GUIDE.md and README.md**

Happy Coding! 🚀
