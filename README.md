# LearnBot Pro 🎓

**LearnBot Pro** is an age-adaptive AI learning platform built with:

| Technology | Role |
|---|---|
| Core Java (Java 17+) | System logic, adaptive engine, domain models |
| MySQL + JDBC | Database persistence and authentication |
| LangChain4j + Google Gemini | AI-powered adaptive responses |
| Console UI + Voice + Visual | Learner interaction and quizzes |

---

## Repository Structure

```
LEARNX/
├── CoreJava_Logic/   # Adaptive learning engine, domain models, core services
├── Database_Auth/    # MySQL schema, JDBC DAOs, authentication, password hashing
├── AI_Integration/   # LangChain4j + Google Gemini client, prompt builder, response parser
├── UI_Quizzes/       # CLI menu, adaptive quiz runner, voice interaction, visual diagrams
└── src/              # Common integration directory – all modules merge here
```

Each folder has its own `README.md` with detailed guidelines for that section.

---

## Team Workspaces

| Folder | Owner | Focus |
|---|---|---|
| `CoreJava_Logic/` | Core Java developer | Adaptive learning logic and system architecture |
| `Database_Auth/` | Database / Auth developer | MySQL design, user data, and security |
| `AI_Integration/` | AI developer | LangChain4j and Google Gemini responses |
| `UI_Quizzes/` | UI developer | Voice interaction, visual diagrams, and adaptive quizzes |

---

## Integration

When merging individual modules, copy source files into the corresponding
package under `src/com/learnx/` as described in [`src/README.md`](src/README.md).

---

## Getting Started

1. **Clone** the repository and open your assigned module folder.
2. Read the `README.md` inside your folder for setup and guidelines.
3. Set required environment variables (see each module's README).
4. Compile and test your module independently before merging into `src/`.

---

## Environment Variables

| Variable | Required by | Description |
|---|---|---|
| `DB_URL` | Database_Auth | JDBC URL (e.g. `jdbc:mysql://localhost:3306/learnx`) |
| `DB_USER` | Database_Auth | Database username |
| `DB_PASSWORD` | Database_Auth | Database password |
| `GEMINI_API_KEY` | AI_Integration | Google Gemini API key |
| `GEMINI_MODEL` | AI_Integration | Model name (default: `gemini-pro`) |

> ⚠️ **Never commit credentials.** Always load secrets from environment variables.
