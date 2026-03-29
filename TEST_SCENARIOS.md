# AI Chat Board - Example Scenarios & Test Cases

## Test Scenario 1: Complete User Journey

### Step 1: Application Startup
```
Expected Output:
╔═══════════════════════════════════════╗
║   Welcome to AI Chat Board Backend    ║
║   Powered by Java & JDBC              ║
╚═══════════════════════════════════════╝

✓ Database connection established successfully!
✓ Database connection closed successfully!
```

### Step 2: New User Signup
```
Menu Choice: 1 (Signup)

Input:
→ Enter username: alice_wonder
→ Enter email: alice@example.com
→ Enter password: secure123
→ Confirm password: secure123

Expected Output:
✓ Signup successful! User 'alice_wonder' registered successfully.
→ You can now login with your credentials.
```

### Step 3: User Login
```
Menu Choice: 2 (Login)

Input:
→ Enter username: alice_wonder
→ Enter password: secure123

Expected Output:
✓ Login successful! Welcome, alice_wonder!

Welcome, alice_wonder               │
├─────────────────────────────────┤
│ 1. Send Message                  │
│ 2. View Chat History             │
│ 3. Delete Chat History           │
│ 4. Logout                         │
```

### Step 4: Send First Message
```
Menu Choice: 1 (Send Message)

Input:
→ Type your message: Hello AI! How are you today?

Processing:
⏳ AI is thinking...

Expected Output:
✓ User Message: Hello AI! How are you today?
→ AI Response: Hello! How can I assist you today?
✓ Chat message saved successfully!
```

### Step 5: Send Multiple Messages
```
Message 2:
→ Type your message: What's the current time?

Expected Output:
→ AI Response: The current time is: 2026-03-29 14:30:45.123

Message 3:
→ Type your message: Tell me about weather

Expected Output:
→ AI Response: I don't have access to real-time weather data, but you can check a weather app for accurate information!

Message 4:
→ Type your message: Thanks for your help

Expected Output:
→ AI Response: You're welcome! Is there anything else I can help you with?
```

### Step 6: View Chat History
```
Menu Choice: 2 (View Chat History)

Expected Output:
═══════════════════════════════════════
Total Messages: 4
═══════════════════════════════════════

┌─ Chat ID: 1
│  Time: 2026-03-29 14:30:20.000
│  User: Hello AI! How are you today?
│  AI: Hello! How can I assist you today?
└────────────────────────────────

┌─ Chat ID: 2
│  Time: 2026-03-29 14:30:45.123
│  User: What's the current time?
│  AI: The current time is: 2026-03-29 14:30:45.123
└────────────────────────────────

[More messages...]
```

### Step 7: Delete Chat History
```
Menu Choice: 3 (Delete Chat History)

Input:
→ Are you sure? (yes/no): yes

Expected Output:
✓ Chat history deleted successfully!
```

### Step 8: Verify Deletion
```
Menu Choice: 2 (View Chat History)

Expected Output:
ℹ No chat history found for this user.
✓ Retrieved 0 chat message(s).
```

### Step 9: Logout
```
Menu Choice: 4 (Logout)

Expected Output:
✓ You have been logged out successfully!
→ Thank you for using AI Chat Board. See you soon!

[Returns to Authentication Menu]
```

---

## Test Scenario 2: Error Handling - Signup Validation

### Test Case 2.1: Duplicate Username
```
Signup Selection: 1

Input:
→ Enter username: alice_wonder    (Already exists)
→ Enter email: alice2@example.com
→ Enter password: pass123
→ Confirm password: pass123

Expected Output:
✗ Signup failed! Username 'alice_wonder' already exists.
```

### Test Case 2.2: Duplicate Email
```
Input:
→ Enter username: alice_v2
→ Enter email: alice@example.com    (Already exists)
→ Enter password: pass123
→ Confirm password: pass123

Expected Output:
✗ Signup failed! Email 'alice@example.com' already exists.
```

### Test Case 2.3: Short Username
```
Input:
→ Enter username: al              (Less than 3 characters)

Expected Output:
✗ Username must be at least 3 characters long!
```

### Test Case 2.4: Invalid Email
```
Input:
→ Enter username: bob_smith
→ Enter email: invalid-email     (No @ symbol)

Expected Output:
✗ Please enter a valid email address!
```

### Test Case 2.5: Short Password
```
Input:
→ Enter username: bob_smith
→ Enter email: bob@example.com
→ Enter password: 123            (Less than 4 characters)

Expected Output:
✗ Password must be at least 4 characters long!
```

### Test Case 2.6: Password Mismatch
```
Input:
→ Enter username: bob_smith
→ Enter email: bob@example.com
→ Enter password: password123
→ Confirm password: different123

Expected Output:
✗ Passwords do not match!
```

---

## Test Scenario 3: Error Handling - Login Validation

### Test Case 3.1: Wrong Password
```
Menu Choice: 2 (Login)

Input:
→ Enter username: alice_wonder
→ Enter password: wrong_password

Expected Output:
✗ Login failed! Invalid username or password.

[Returns to Authentication Menu]
```

### Test Case 3.2: Non-existent User
```
Input:
→ Enter username: nonexistent_user
→ Enter password: password123

Expected Output:
✗ Login failed! Invalid username or password.
```

### Test Case 3.3: Empty Username
```
Input:
→ Enter username: [blank/empty]
→ Enter password: password123

Expected Output:
✗ Username cannot be empty!
```

### Test Case 3.4: Empty Password
```
Input:
→ Enter username: alice_wonder
→ Enter password: [blank/empty]

Expected Output:
✗ Password cannot be empty!
```

---

## Test Scenario 4: Chat Message Features

### Test Case 4.1: Empty Message
```
Menu Choice: 1 (Send Message)

Input:
→ Type your message: [blank/empty]

Expected Output:
✗ Message cannot be empty!
```

### Test Case 4.2: Long Message
```
Input:
→ Type your message: This is a very long message that contains multiple sentences. 
                    I want to test if the system can handle longer messages properly 
                    and store them in the database without any issues. The message 
                    contains important information that needs to be preserved.

Expected Output:
✓ User Message: [Full message displayed]
→ AI Response: That's an interesting question! I understand you're asking about: 
               This is a very long message that contains...
✓ Chat message saved successfully!
```

### Test Case 4.3: Special Characters in Message
```
Input:
→ Type your message: Hello! @#$%^&*() - Can you handle special chars?

Expected Output:
✓ User Message: Hello! @#$%^&*() - Can you handle special chars?
→ AI Response: That's interesting! Tell me more.
✓ Chat message saved successfully!
```

### Test Case 4.4: Numbers and Symbols
```
Input:
→ Type your message: My phone: 123-456-7890 and email: test@mail.com

Expected Output:
✓ User Message: My phone: 123-456-7890 and email: test@mail.com
→ AI Response: That's interesting! Tell me more.
✓ Chat message saved successfully!
```

---

## Test Scenario 5: AI Response Logic

### Test Case 5.1: Hello Greeting
```
Input: "hello"
Expected: "Hello! How can I assist you today?"

Input: "Hi there"
Expected: "Hello! How can I assist you today?"
```

### Test Case 5.2: How Are You
```
Input: "how are you"
Expected: "I'm doing great! Thanks for asking. How can I help you?"

Input: "how r u"
Expected: "I'm doing great! Thanks for asking. How can I help you?"
```

### Test Case 5.3: Weather Query
```
Input: "What's the weather like?"
Expected: "I don't have access to real-time weather data, but you can check a weather app for accurate information!"
```

### Test Case 5.4: Time Query
```
Input: "What time is it?"
Expected: "The current time is: [Current timestamp]"
```

### Test Case 5.5: Help Request
```
Input: "I need help"
Expected: "I'm here to help! What do you need assistance with?"
```

### Test Case 5.6: Goodbye
```
Input: "Goodbye AI bot"
Expected: "Goodbye! Feel free to chat anytime. Take care!"
```

### Test Case 5.7: Question Mark
```
Input: "Can you help me with something?"
Expected: "That's an interesting question! I understand you're asking about: Can you help me with something?..."
```

### Test Case 5.8: Random Statement
```
Input: "I like programming"
Expected: One of random responses:
- "That's interesting! Tell me more."
- "I understand. Is there anything specific you'd like help with?"
- "Thanks for that input. How else can I assist you?"
- etc.
```

---

## Database Verification Test Cases

### Verify Users Table
```sql
SELECT * FROM users;

Expected Output:
+---------+-----------------+----------------------+----------+---------------------+
| user_id | username        | email                | password | created_at          |
+---------+-----------------+----------------------+----------+---------------------+
| 1       | alice_wonder    | alice@example.com    | sec...   | 2026-03-29 14:20... |
| 2       | bob_smith       | bob@example.com      | pass...  | 2026-03-29 14:25... |
+---------+-----------------+----------------------+----------+---------------------+
```

### Verify Chat History Table
```sql
SELECT * FROM chat_history WHERE user_id = 1;

Expected Output:
+---------+---------+-----------------------------+------------------------+---------------------+
| chat_id | user_id | user_message              | ai_response            | created_at          |
+---------+---------+-----------------------------+------------------------+---------------------+
| 1       | 1       | Hello AI! How are you ... | Hello! How can I as... | 2026-03-29 14:30... |
| 2       | 1       | What's the current time?  | The current time is... | 2026-03-29 14:30... |
+---------+---------+-----------------------------+------------------------+---------------------+
```

### Check User Count
```sql
SELECT COUNT(*) as total_users FROM users;
Expected: 2 (or your number of registered users)
```

### Check Chat Count for User
```sql
SELECT COUNT(*) as total_chats FROM chat_history WHERE user_id = 1;
Expected: Shows total messages for user_id 1
```

### Verify Foreign Key Constraint
```sql
-- Try to insert chat without valid user_id
INSERT INTO chat_history (user_id, user_message, ai_response) VALUES (999, 'test', 'test');

Expected Output:
ERROR 1452 (23000): Cannot add or update a child row: a foreign key 
constraint fails (`aichatboard`.`chat_history`, CONSTRAINT `chat_history_ibfk_1` 
FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`))
```

---

## Multi-Session Test Scenario

### Session 1: User Alice
```
Login: alice_wonder / secure123
Send: "Hello"
Send: "How are you?"
View History: Shows 2 messages
Logout
```

### Session 2: User Bob (after creating account)
```
Signup: bob_dev / developer@example.com / dev123
Login: bob_dev / dev123
Send: "Hi AI"
View History: Shows 1 message (Bob's messages only, not Alice's)
Logout
```

### Session 3: Alice Again
```
Login: alice_wonder / secure123
View History: Shows original 2 messages + any new ones
Send: "Still here!"
View History: Shows 3 messages
Logout
```

**Verification**: Each user sees only their own chat history

---

## Performance Test Scenario

### Test Case: Large Message Volume
```
1. Login as a user
2. Send 100 messages quickly
3. View chat history

Expected:
- All messages saved to database
- History displays in correct timestamp order
- No data loss
- Response time remains reasonable
```

---

## Security Test Scenarios

### Test Case 1: SQL Injection Attempt (Should Fail)
```
Signup Username: admin' OR '1'='1
Expected: Treated as literal username, not SQL injection
Result: Either "Username already exists" or fails with validation

✓ Security: SQL Injection prevented by PreparedStatement
```

### Test Case 2: SQL Injection in Message
```
Send Message: '; DROP TABLE chat_history; --
Expected: Message stored as literal text, table not dropped

✓ Security: SQL Injection prevented by PreparedStatement
```

### Test Case 3: Password Not Echoed
```
During login/signup, password field should:
- NOT display what you type
- NOT echo to console
- Be processed securely

✓ Security: Password is read safely
```

---

## Summary of Test Results

After running all tests, you should have:

| Category | Tests | Status |
|----------|-------|--------|
| Signup | 6 | ✓ Pass |
| Login | 4 | ✓ Pass |
| Chat | 4 | ✓ Pass |
| AI Response | 8 | ✓ Pass |
| Database | 5 | ✓ Pass |
| Multi-User | 1 | ✓ Pass |
| Performance | 1 | ✓ Pass |
| Security | 3 | ✓ Pass |
| **TOTAL** | **32** | **✓ Pass** |

---

## Test Checklist

- [ ] Application starts without errors
- [ ] Can create multiple user accounts
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong password
- [ ] Cannot signup with duplicate username/email
- [ ] Can send messages
- [ ] Messages are saved to database
- [ ] Can view chat history
- [ ] Chat history shows only user's messages
- [ ] Can delete chat history
- [ ] Can logout successfully
- [ ] AI responses vary based on keywords
- [ ] SQL injection attempts fail safely
- [ ] Database maintains data integrity
- [ ] Multiple users run independently

---

**Note**: All expected outputs are based on successful execution with a running MySQL server and properly configured database.
