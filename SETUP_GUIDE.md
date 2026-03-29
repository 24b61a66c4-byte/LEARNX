# AI Chat Board - Complete Setup Guide

## Prerequisites Check

Before you begin, verify you have all required software:

```bash
# Check Java installation
java -version

# Expected output: java version "1.8.0_xxx" or higher

# Check if MySQL is running
mysql --version

# Expected output: mysql Ver 8.x.x
```

---

## Step 1: Download MySQL JDBC Driver

The MySQL JDBC driver is required to connect Java to MySQL.

### Option A: Download from Official Website
1. Visit: https://dev.mysql.com/downloads/connector/j/
2. Select your platform
3. Download `mysql-connector-java-8.0.33.jar` (or latest version)
4. Save to your project's `lib/` folder

### Option B: Using Maven (if available)
```bash
mvn dependency:copy-dependencies -DoutputDirectory=lib
```

### Option C: Using Gradle
```gradle
dependencies {
    implementation 'mysql:mysql-connector-java:8.0.33'
}
```

---

## Step 2: Verify MySQL Installation & Setup

### Windows - Start MySQL Service
```bash
# Open Command Prompt as Administrator
net start MySQL80

# Or search for "Services" and start MySQL Service manually
```

### macOS - Start MySQL Service
```bash
# If installed via Homebrew
brew services start mysql

# Or
mysql.server start
```

### Linux - Start MySQL Service
```bash
sudo systemctl start mysql
# or
sudo /etc/init.d/mysql start
```

### Verify MySQL is Running
```bash
mysql -u root -p
# Enter password when prompted
# If successful, you should see: mysql>
# Type: exit
```

---

## Step 3: Create Database and Tables

### Method 1: Using MySQL Command Line

```bash
# Connect to MySQL
mysql -u root -p

# Enter your password (default is empty, just press Enter)
```

Then execute each SQL command:

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS aichatboard;

-- Use the database
USE aichatboard;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Indexes for Performance
CREATE INDEX idx_user_id ON chat_history(user_id);
CREATE INDEX idx_created_at ON chat_history(created_at);

-- Verify Tables
SHOW TABLES;
```

### Method 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Create a new SQL tab
4. Copy-paste the SQL commands from `database/aichatboard_database.sql`
5. Click "Execute" (or Ctrl+Enter)

### Method 3: Using Script File

```bash
# From command line
mysql -u root -p < database/aichatboard_database.sql

# Or from MySQL prompt
mysql> source database/aichatboard_database.sql;
```

### Verify Database Creation

```sql
-- Check if database exists
SHOW DATABASES;

-- Use database
USE aichatboard;

-- Check tables
SHOW TABLES;

-- Describe tables
DESCRIBE users;
DESCRIBE chat_history;
```

---

## Step 4: Configure Database Connection

Edit `src/com/aichatboard/db/DBConnection.java` and update these credentials:

```java
// Find these lines and update them:
private static final String DB_URL = "jdbc:mysql://localhost:3306/aichatboard";
private static final String DB_USER = "root";              // Your MySQL username
private static final String DB_PASSWORD = "";             // Your MySQL password (if any)
```

**Common configurations:**
- Default: `DB_USER = "root"`, `DB_PASSWORD = ""`
- If you set a password: `DB_PASSWORD = "your_password"`
- If MySQL is on different host: `DB_URL = "jdbc:mysql://192.168.1.100:3306/aichatboard"`

---

## Step 5: Compile the Project

### Using Command Line (Windows)

Create a `lib/` folder first, then place `mysql-connector-java-8.0.33.jar` in it.

```bash
# Navigate to project directory
cd "c:\Users\YourUsername\OneDrive\Desktop\projects\ai chat board"

# Create bin directory
mkdir bin

# Compile all Java files
javac -cp "lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/db/*.java
javac -cp "lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/dao/*.java
javac -cp "lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/*.java
```

**If using semicolon separator on Windows:**
```bash
javac -cp "bin;lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/db/*.java
javac -cp "bin;lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/dao/*.java
javac -cp "bin;lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/*.java
```

### Using Eclipse IDE

1. Create new Java Project: File → New → Java Project
2. Name: "AIChat Board"
3. Copy `src/` folder contents to project's `src/` folder
4. Right-click project → Build Path → Configure Build Path
5. Under "Libraries", click "Add External JAR"
6. Select `mysql-connector-java-8.0.33.jar`
7. Click "Apply and Close"
8. Project → Clean
9. Project → Build All

### Using VS Code

1. Install Extension Pack for Java
2. Create folder structure as given
3. Open Terminal (Ctrl + `)
4. Run compile command above

---

## Step 6: Run the Application

### Using Command Line (Windows)

```bash
# From project directory
java -cp "bin;lib/mysql-connector-java-8.0.33.jar" com.aichatboard.MainApp
```

### Using Command Line (Linux/macOS)

```bash
# From project directory
java -cp "bin:lib/mysql-connector-java-8.0.33.jar" com.aichatboard.MainApp
```

### Using Eclipse

1. Right-click on `MainApp.java`
2. Select: Run As → Java Application
3. Application should start in console

### Using VS Code

1. Install Extension Pack for Java
2. Open `MainApp.java`
3. Click ► (Run) button near main method
4. Or press Ctrl+F5

---

## Step 7: Test the Application

Once the application starts, you should see:

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

### Test Signup
1. Enter choice: `1`
2. Username: `testuser`
3. Email: `test@example.com`
4. Password: `password123`
5. Confirm: `password123`
6. You should see: `✓ Signup successful!`

### Test Login
1. Enter choice: `2`
2. Username: `testuser`
3. Password: `password123`
4. You should see: `✓ Login successful! Welcome, testuser!`

### Test Chat
1. Enter choice: `1` (Send Message)
2. Type message: `Hello AI`
3. You should see AI response
4. Message saved: `✓ Chat message saved successfully!`

### Test Chat History
1. Enter choice: `2` (View Chat History)
2. You should see your previous messages

---

## Troubleshooting Guide

### Error: "com.mysql.cj.jdbc.Driver not found"

**Cause**: MySQL JDBC driver not in classpath

**Solutions**:
```bash
# Option 1: Verify file exists
ls lib/mysql-connector-java-8.0.33.jar  # On Linux/macOS
dir lib\mysql-connector-java-8.0.33.jar  # On Windows

# Option 2: Re-download driver from:
# https://dev.mysql.com/downloads/connector/j/

# Option 3: Use correct JAR filename in compile/run commands
```

### Error: "Connection refused with address localhost/127.0.0.1:3306"

**Cause**: MySQL server not running

**Solutions**:
```bash
# Windows: Check Services
# - Press Win+R
# - Type: services.msc
# - Find and right-click MySQL Service
# - Select Start

# Or from Command Prompt (as Administrator):
net start MySQL80

# Linux/macOS:
sudo systemctl start mysql
# or
brew services start mysql
```

### Error: "Unknown database 'aichatboard'"

**Cause**: Database not created

**Solutions**:
```bash
# Verify database exists:
mysql -u root -p -e "SHOW DATABASES;"

# Create if missing:
mysql -u root -p < database/aichatboard_database.sql

# Or manually:
mysql -u root -p
mysql> CREATE DATABASE aichatboard;
mysql> USE aichatboard;
# [Then run all SQL commands from setup]
```

### Error: "Access denied for user 'root'@'localhost'"

**Cause**: Wrong password or wrong username

**Solutions**:
1. Find your MySQL username:
   ```bash
   mysql -u root
   # If works, password is empty
   ```

2. Update DBConnection.java:
   ```java
   private static final String DB_USER = "root";           // Your username
   private static final String DB_PASSWORD = "";          // Your password (empty or your pwd)
   ```

3. Reset MySQL root password (if forgotten):
   ```bash
   # Windows:
   mysqld --skip-grant-tables
   mysql -u root
   mysql> FLUSH PRIVILEGES;
   mysql> SET PASSWORD FOR 'root'@'localhost' = PASSWORD('newpassword');
   
   # Linux:
   sudo /etc/init.d/mysql stop
   sudo mysqld_safe --skip-grant-tables &
   mysql -u root
   mysql> FLUSH PRIVILEGES;
   mysql> UPDATE mysql.user SET PASSWORD=PASSWORD("newpassword") WHERE USER='root';
   ```

### Error: "Table doesn't exist"

**Cause**: Chat history table not created

**Solutions**:
```sql
USE aichatboard;
SHOW TABLES;
# If chat_history not there, run:

CREATE TABLE chat_history (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### Error: "Duplicate entry 'username' for key 'username'"

**Cause**: Username already exists

**Solutions**:
- Choose a different username during signup
- Or check existing users:
  ```sql
  USE aichatboard;
  SELECT * FROM users;
  ```

---

## Project File Structure

After setup, your project should look like:

```
ai chat board/
├── src/
│   └── com/aichatboard/
│       ├── MainApp.java
│       ├── db/
│       │   └── DBConnection.java
│       └── dao/
│           ├── UserDAO.java
│           └── ChatDAO.java
├── bin/                    (Created after compilation)
│   └── com/aichatboard/...
├── lib/
│   └── mysql-connector-java-8.0.33.jar
├── database/
│   └── aichatboard_database.sql
├── README.md
└── SETUP_GUIDE.md
```

---

## Quick Reference Commands

### Compile
```bash
javac -cp "lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/db/*.java
javac -cp "lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/dao/*.java
javac -cp "lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/*.java
```

### Run (Windows)
```bash
java -cp "bin;lib/mysql-connector-java-8.0.33.jar" com.aichatboard.MainApp
```

### Run (Linux/macOS)
```bash
java -cp "bin:lib/mysql-connector-java-8.0.33.jar" com.aichatboard.MainApp
```

### Check Database
```bash
mysql -u root -p
mysql> USE aichatboard;
mysql> SELECT * FROM users;
mysql> SELECT * FROM chat_history;
```

---

## Next Steps

1. Test all features (Signup, Login, Chat, History, Delete, Logout)
2. Verify data in database using MySQL Workbench
3. Try different inputs and error scenarios
4. Review code comments for better understanding
5. Extend functionality as needed

---

**If you encounter any issues, check:**
1. ✓ MySQL server is running
2. ✓ JDBC driver JAR in classpath
3. ✓ Database and tables created
4. ✓ DBConnection.java has correct credentials
5. ✓ All Java files compiled successfully

Happy Coding! 🚀
