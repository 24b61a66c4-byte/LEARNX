# LEARNX Setup Complete ✓

Your LEARNX project has been successfully imported to: `c:\Users\ranad\OneDrive\Desktop\LEARNX`

## Project Overview

**LearnX** is a production-oriented learning platform featuring:
- **Backend**: Java 17 Spring Boot API with AI-assisted tutor (Google Gemini + search)
- **Frontend**: Next.js web application (App Router, TypeScript)
- **Database**: PostgreSQL (Supabase recommended for cloud)
- **Deployment**: Docker, Vercel, Railway

## What's Been Set Up

✓ Project cloned from GitHub  
✓ `web/.env.local` created (frontend environment)  
✓ `.env.local` created (backend environment)  
✓ Frontend dependencies installed (732 npm packages)  

## Project Structure

```
LEARNX/
├── src/                          # Java Spring Boot backend
│   ├── main/java/                # Backend source code
│   ├── main/resources/           # Application properties, database configs
│   └── test/                     # Backend tests
├── web/                          # Next.js frontend
│   ├── src/                      # React components and pages
│   ├── public/                   # Static assets
│   ├── package.json              # Frontend dependencies
│   └── node_modules/             # Installed packages (732 packages)
├── docs/                         # Project documentation
│   ├── architecture/             # Blueprint and overview
│   └── planning/                 # Implementation planning
├── docker-compose.yml            # Local Docker setup
├── pom.xml                       # Maven configuration
├── .env.local                    # Backend secrets (created)
└── web/.env.local                # Frontend secrets (created)
```

## Next Steps

### 1. Configure Environment Variables

**Backend** (`c:\Users\ranad\OneDrive\Desktop\LEARNX\.env.local`):
```
LEARNX_ENV=dev
LEARNX_FRONTEND_URL=http://localhost:3000
LEARNX_DB_URL=jdbc:postgresql://localhost:5432/learnx
LEARNX_DB_USERNAME=postgres
LEARNX_DB_PASSWORD=postgres
LEARNX_GEMINI_API_KEY=your_key_here  (optional)
LEARNX_TAVILY_API_KEY=your_key_here  (optional)
```

**Frontend** (`c:\Users\ranad\OneDrive\Desktop\LEARNX\web\.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key
```

### 2. Set Up Database

**Option A: Local PostgreSQL (Docker)**
```bash
cd c:\Users\ranad\OneDrive\Desktop\LEARNX
docker-compose up -d
```

**Option B: Supabase Cloud**
1. Go to https://supabase.com/dashboard
2. Create a new project
3. Copy credentials to `.env.local`:
   - `LEARNX_DB_URL` from Connection String
   - `NEXT_PUBLIC_SUPABASE_URL` from Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from API Key

### 3. Run the Application

**Terminal 1 - Backend (Java)**
```bash
cd c:\Users\ranad\OneDrive\Desktop\LEARNX
mvn clean compile
mvn spring-boot:run
# Backend runs on http://localhost:8080
```

**Terminal 2 - Frontend (Node.js)**
```bash
cd c:\Users\ranad\OneDrive\Desktop\LEARNX\web
npm run dev
# Frontend runs on http://localhost:3000
```

### 4. Deploy to Production

**Vercel** (Frontend):
```bash
cd c:\Users\ranad\OneDrive\Desktop\LEARNX\web
npm install -g vercel
vercel login
vercel
```

**Railway** (Backend):
1. Go to https://railway.app
2. Create new project
3. Connect GitHub repository
4. Add environment variables from `.env.local`

**Supabase** (Database):
- Already configured if using Supabase
- Connection string auto-loads from `LEARNX_DB_URL`

## Available Commands

### Backend (Maven)
```bash
mvn clean compile              # Compile code
mvn clean test                # Run tests
mvn spring-boot:run           # Run development server
mvn clean package             # Build JAR
```

### Frontend (Next.js)
```bash
cd web
npm run dev                   # Development server
npm run build                 # Production build
npm run start                 # Run production build
npm test                      # Run tests
```

## API Endpoints

When running locally, the API is available at:
```
http://localhost:8080/api/v1
```

Key endpoints:
- `POST /tutor/ask` - Ask the AI tutor a question
- `GET /health` - Health check
- Documentation available at GitHub repository

## Documentation

See the `docs/` folder for:
- `architecture/` - System design and blueprint
- `planning/` - Implementation roadmap
- `coordination/` - Team workflow and branching strategy

## Troubleshooting

**Port already in use?**
```bash
# Backend (8080)
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Frontend (3000)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Dependencies issues?**
```bash
# Frontend
cd web
rm -r node_modules
npm install

# Backend
mvn clean install
```

**Database connection error?**
- Verify PostgreSQL is running (Docker or local)
- Check `LEARNX_DB_URL` in `.env.local`
- Ensure credentials are correct

## Git Workflow

Your repository is set up with Git. Common commands:
```bash
git status                    # Check changes
git add .                     # Stage changes
git commit -m "message"       # Commit
git push origin main          # Push to GitHub
git pull                      # Fetch latest
```

## Security Notes

⚠️ **Never commit secrets!** These files are in `.gitignore`:
- `.env.local` (backend secrets)
- `web/.env.local` (frontend secrets)
- `node_modules/`

Keep API keys and credentials safe:
- Gemini API Key
- Tavily API Key
- Supabase credentials
- Database passwords

---

**Ready to start?**

1. Edit `.env.local` and `web/.env.local` with your credentials
2. Set up your database (Docker or Supabase)
3. Run `mvn spring-boot:run` and `npm run dev`
4. Open http://localhost:3000

For questions, refer to the README.md in the project root or the docs/ folder.
