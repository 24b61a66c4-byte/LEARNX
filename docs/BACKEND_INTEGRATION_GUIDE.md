# Backend Integration Guide

## Overview

This guide explains how the LearnX frontend integrates with the Spring Boot backend API via Supabase authentication.

## Architecture

```
Frontend (Next.js) 
  ↓
Supabase Auth (JWT tokens)
  ↓
Backend API (Spring Boot)
  ↓
Supabase PostgreSQL (RLS policies)
```

## Environment Setup

### Frontend Environment Variables

Add to `web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

For production:
- `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1`

### Backend Environment Variables

Ensure backend is configured with PostgreSQL:

```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/learnx
spring.datasource.username=postgres
spring.datasource.password=your-password
```

For Supabase:
```properties
spring.datasource.url=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=your-supabase-password
```

## API Client Usage

### Basic Setup

The frontend provides an `api.ts` client library for backend API calls:

```typescript
import { profileApi, quizApi, notesApi, progressApi } from "@/lib/api";
```

### With Authentication

Use the `useBackendApi()` hook to automatically include the authenticated user ID:

```typescript
import { useBackendApi } from "@/lib/use-backend-api";

export function MyComponent() {
  const { profile, quiz, notes, progress } = useBackendApi();

  async function handleOnboarding(onboardingData) {
    try {
      const result = await profile.completeOnboarding(onboardingData);
      console.log("Onboarding saved:", result);
    } catch (error) {
      console.error("Failed to save onboarding:", error);
    }
  }

  return (
    <button onClick={() => handleOnboarding({...})}>
      Complete Onboarding
    </button>
  );
}
```

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Profile Management

**GET /profiles/{userId}**
- Get user profile
- Returns: LearnerProfile object

**POST /profiles**
- Save/update profile
- Body: LearnerProfile object
- Returns: Saved LearnerProfile

**POST /profiles/onboarding**
- Complete user onboarding
- Query: `userId`
- Body: Profile with interests, preferences, accessibility settings
- Returns: Updated LearnerProfile

**DELETE /profiles/{userId}**
- Delete user profile
- Returns: 204 No Content

### Quiz Results

**POST /quiz-results**
- Submit quiz/practice results
- Body:
  ```json
  {
    "userId": "uuid",
    "subjectId": "dbms",
    "topicId": "sql-basics",
    "score": 85,
    "correctCount": 17,
    "totalCount": 20,
    "xpEarned": 150
  }
  ```
- Returns: QuizResult object with id, timestamp

**GET /quiz-results/user/{userId}**
- Get all quiz results for user
- Returns: Array of QuizResult

**GET /quiz-results/user/{userId}/subject/{subjectId}**
- Get quiz results for specific subject
- Returns: Array of QuizResult

**GET /quiz-results/user/{userId}/subject/{subjectId}/average**
- Get average score for subject
- Returns: { averageScore: number }

### Study Notes

**POST /notes**
- Create study note
- Body:
  ```json
  {
    "userId": "uuid",
    "subjectId": "dbms",
    "topicId": "sql-basics",
    "title": "My SQL Notes",
    "content": "SELECT * FROM users;",
    "source": "manual"
  }
  ```
- Returns: StudyNote object

**GET /notes/{noteId}**
- Get specific note
- Returns: StudyNote object

**GET /notes/user/{userId}**
- Get all notes for user
- Returns: Array of StudyNote

**GET /notes/user/{userId}/topic/{topicId}**
- Get notes for specific topic
- Returns: Array of StudyNote

**PUT /notes/{noteId}**
- Update note
- Body: Partial StudyNote object
- Returns: Updated StudyNote

**DELETE /notes/{noteId}**
- Delete note
- Returns: 204 No Content

### Progress Tracking

**GET /progress/user/{userId}/subject/{subjectId}**
- Get progress for subject
- Returns: ProgressSnapshot with XP, level, weak/strong topics

**POST /progress**
- Update progress
- Body:
  ```json
  {
    "userId": "uuid",
    "subjectId": "dbms",
    "xp": 1500,
    "level": 5,
    "strongTopics": ["sql-basics", "joins"],
    "weakTopics": ["transactions"],
    "lastPracticed": "2026-03-29T10:30:00Z"
  }
  ```
- Returns: Updated ProgressSnapshot

**POST /progress/initialize**
- Initialize progress for new subject
- Query: `userId`, `subjectId`
- Returns: New ProgressSnapshot with defaults

## Gateway Pattern

The `gateways.ts` file uses a pattern of local-first persistence with optional backend sync:

```typescript
export const practiceGateway = {
  async submit(answers) {
    // 1. Process locally
    const result = evaluateAnswers(answers);
    
    // 2. Save to localStorage
    writeLocalStorage(PRACTICE_HISTORY_KEY, result);
    
    // 3. Try to sync to backend (non-blocking)
    try {
      await quizApi.submitQuiz({
        userId: currentUser.id,
        ...result
      });
    } catch (error) {
      console.warn("Backend sync failed, data saved locally");
    }
    
    return result;
  }
};
```

This ensures offline functionality while syncing when available.

## Integration Checklist

When adding new backend features:

- [ ] Add JPA entity in backend: `src/main/java/com/learnx/persistence/model/`
- [ ] Add Spring Data repository: `src/main/java/com/learnx/persistence/repository/`
- [ ] Add service class: `src/main/java/com/learnx/persistence/service/`
- [ ] Add REST controller: `src/main/java/com/learnx/api/controller/`
- [ ] Update `web/src/lib/api.ts` with new API methods
- [ ] Update `web/src/lib/gateways.ts` to call new API (with fallback)
- [ ] Create usage example in a component using `useBackendApi()`
- [ ] Test authentication flow with real Supabase user
- [ ] Verify RLS policies allow user access

## Error Handling

All API calls should handle failures gracefully:

```typescript
try {
  const profile = await backendApi.profile.getProfile();
} catch (error) {
  if (error.message.includes("401")) {
    // Redirect to login
  } else if (error.message.includes("network")) {
    // Show offline notice, use cached data
  } else {
    // Show error toast
  }
}
```

## Testing

### Local Testing

1. Start backend:
   ```bash
   cd g:\LEARNX
   mvn spring-boot:run
   ```

2. Update frontend .env.local:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

3. Sign up in frontend, confirm onboarding saves via:
   ```bash
   # Check backend logs or database
   SELECT * FROM learner_profiles;
   ```

4. Complete quiz, verify in database:
   ```bash
   SELECT * FROM quiz_results WHERE user_id = 'your-user-uuid';
   ```

### Production Testing

1. Deploy backend to production
2. Update `NEXT_PUBLIC_API_URL` environment variable
3. Deploy frontend
4. Test full flow: signup → onboarding → quiz → verify in database

## Troubleshooting

### 401 Unauthorized
- Check JWT token expiration
- Verify RLS policies allow user access
- Ensure userId matches auth.users(id)

### 404 Not Found
- Verify API endpoint spelling
- Check backend is running on correct port
- Confirm `NEXT_PUBLIC_API_URL` is correct

### Network Errors
- Verify CORS headers from backend
- Check `NEXT_PUBLIC_API_URL` in browser Network tab
- Ensure backend and frontend are on same network (for local testing)

### Data Not Persisting
- Check RLS policies in Supabase
- Verify foreign key constraints
- Confirm userId is valid UUID format

## Security Notes

- All API calls require Supabase JWT token (passed via Authorization header)
- RLS policies enforce user-scoped data access
- Backend validates all inputs before database operations
- Session tokens expire after defined period (check application.properties)

## Next Steps

See [SUPABASE_SCHEMA.md](./supabase-schema.sql) for database schema details.
