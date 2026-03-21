# Database_Auth

## Focus
This module manages **MySQL database design, user data persistence, and authentication/security** for LearnBot Pro.

## Responsibilities
- MySQL schema design and migration scripts
- JDBC connection pooling and configuration
- User registration, login, and session token management
- Data Access Objects (DAOs) for all domain entities
- Password hashing and security utilities
- Role-based access control (student, instructor, admin)

## Package Structure
```
src/
└── com/
    └── learnx/
        └── db/
            ├── config/       # JDBC DataSource and connection pool setup
            ├── model/        # Database entity classes (mirror of core models)
            ├── dao/          # Data Access Objects (CRUD operations)
            ├── auth/         # Authentication, hashing, token management
            └── migration/    # SQL migration scripts and schema versioning
```

## Database Schema (overview)
| Table            | Purpose                                 |
|------------------|-----------------------------------------|
| `users`          | Learner accounts and profile data       |
| `sessions`       | Learning session records                |
| `questions`      | Question bank with difficulty levels    |
| `topics`         | Topic catalogue                         |
| `performance`    | Per-session performance metrics         |
| `auth_tokens`    | Active authentication tokens            |

## Integration
All source files compile into the common `src/` directory at the project root.  
When merging, place your classes under `src/com/learnx/db/`.  
SQL migration files go under `src/com/learnx/db/migration/`.

## Guidelines
- Use **JDBC** directly (no ORM) to stay aligned with the Core Java approach.
- Never store plain-text passwords — the starter implementation uses **PBKDF2WithHmacSHA256** (see `PasswordHasher.java`). For production, consider upgrading to a memory-hard algorithm such as **BCrypt** or **Argon2**.
- Parameterise every SQL statement to prevent SQL injection.
- Write rollback-safe migration scripts (wrap DDL in transactions where the DB supports it).
- Credentials must be loaded from environment variables or a `.env` file — **never hard-coded**.
