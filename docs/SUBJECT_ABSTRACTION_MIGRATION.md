# Subject Abstraction Migration Guide

## Overview
This document outlines the migration from hardcoded DBMS/EDC subject IDs to a generic, database-driven subject system. This enables LearnX to support **any subject domain** without code changes.

## Phase 0: What Was Changed

### Files Modified
1. **Backend**
   - Created `SubjectService.java` — service to load subjects from database
   - Created `SubjectRepository.java` — JPA interface for subject persistence
   - Created `SubjectEntity.java` — JPA entity mapping
   - Created `SubjectController.java` — REST API endpoint `/api/subjects`
   - Updated `LearnerProfileService.java` — uses SubjectService instead of hardcoded logic
   - Build: ✅ No compilation errors

2. **Frontend**
   - Updated `web/src/lib/types.ts` — `SubjectId` is now a generic string
   - Added shared subject helper paths for public routing and catalog access
   - Updated `web/src/components/app-shell.tsx` — uses fallback to "mathematics" instead of hardcoded "dbms"
   - Updated `web/src/__tests__/tutor-practice-handoff.test.ts` — test validator is now dynamic, defaults to "mathematics"

3. **Data**
   - Updated `src/main/resources/catalog.json` — subject IDs are now "mathematics" and "science"
   - Topic IDs changed from `dbms-*` and `edc-*` to `math-*` and `science-*`

## Phase 1: Apply Supabase Schema Migration

### Step 1: Create Subjects Table in Supabase

Open your Supabase SQL editor and run:

```sql
-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  accent VARCHAR(7),
  backdrop VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects_readable" ON subjects
  FOR SELECT USING (true);

-- Seed initial subjects
INSERT INTO subjects (id, name, description, tags, accent, backdrop, is_active)
VALUES 
  ('mathematics', 'Mathematics', 'Numbers, patterns, and problem solving', ARRAY['math', 'patterns', 'revision'], '#3B82F6', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', true),
  ('science', 'Science', 'Everyday concepts, experiments, and clear explanations', ARRAY['science', 'experiments', 'revision'], '#10B981', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', true)
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Verify Table in Supabase UI
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL above (or paste in parts)
3. Verify in **Table Editor** that `subjects` table exists with 2 rows (mathematics, science)

### Step 3: Update Backend Database Connection

Ensure your `application.properties` has Supabase JDBC connection:

```properties
spring.datasource.url=jdbc:postgresql://{SUPABASE_HOST}:5432/{SUPABASE_DB}?sslmode=require
spring.datasource.username={SUPABASE_USER}
spring.datasource.password={SUPABASE_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
```

## Phase 2: Test Backend API

### Step 1: Start Backend

```bash
cd g:\LEARNX
mvn spring-boot:run
```

### Step 2: Test Subject Endpoint

In browser or Postman:

```
GET http://localhost:8085/api/subjects
```

Expected response:

```json
[
  {
    "id": "mathematics",
    "name": "Mathematics",
    "description": "Numbers, patterns, and problem solving",
    "tags": ["math", "patterns", "revision"],
    "accent": "#3B82F6",
    "backdrop": "linear-gradient(...)"
  },
  {
    "id": "science",
    "name": "Science",
    "description": "Everyday concepts, experiments, and clear explanations",
    "tags": ["science", "experiments", "revision"],
    "accent": "#10B981",
    "backdrop": "linear-gradient(...)"
  }
]
```

### Step 3: Test Legacy ID Mapping

```
GET http://localhost:8085/api/subjects/dbms
```

Should return the **mathematics** subject (backward compatibility).

```
GET http://localhost:8085/api/subjects/edc
```

Should return the **science** subject (backward compatibility).

## Phase 3: Frontend Integration

### Step 1: Update Environment Variable

Add to `.env.local` or deployment config:

```
NEXT_PUBLIC_API_URL=http://localhost:8085
```

### Step 2: Test Frontend Subject Helpers

In any component:

```typescript
import { getSubjects } from '@/lib/data/catalog';

export function MyComponent() {
  const subjects = getSubjects();

  return (
    <ul>
      {subjects.map((s) => <li key={s.id}>{s.name}</li>)}
    </ul>
  );
}
```

### Step 3: Run Frontend Dev Server

```bash
cd web
npm run dev -- --port 3001
```

Visit `http://localhost:3001/app` and verify:
1. No console errors about subject loading
2. Subjects are fetched from API
3. Old URLs like `?subjectId=dbms` still work (mapped to mathematics)

## Phase 4: Migration: Existing User Data

### For New Users
- No action needed; profile setup will use the first available subject from API

### For Existing Users
- **Option A (Safe)**: Leave data as-is; SubjectService maps `dbms` → `mathematics`, `edc` → `science`
- **Option B (Clean)**: Run migration script in Supabase to update records

#### Option B: Data Migration Script

```sql
-- Add new column for backward compatibility
ALTER TABLE learner_profiles ADD COLUMN IF NOT EXISTS legacy_subject_id TEXT;

-- Populate legacy_subject_id from existing preferred_subject_id
UPDATE learner_profiles 
SET legacy_subject_id = preferred_subject_id
WHERE legacy_subject_id IS NULL;

-- Map old IDs to new IDs
UPDATE learner_profiles 
SET preferred_subject_id = 'mathematics'
WHERE preferred_subject_id = 'dbms';

UPDATE learner_profiles 
SET preferred_subject_id = 'science'
WHERE preferred_subject_id = 'edc';
```

## Phase 5: Backward Compatibility Testing

### Old URLs Should Still Work

Test these URLs in browser:

```
❌ OLD: http://localhost:3001/app/ask?subjectId=dbms&topicId=dbms-sql-basics
✅ Should map to: mathematics subject, math-* topic

❌ OLD: http://localhost:3001/app/subjects/edc
✅ Should map to: science subject
```

### Test Cases

| Old URL | Expected Mapping | Status |
|---------|------------------|--------|
| `?subjectId=dbms` | `→ mathematics` | ✅ SubjectService maps |
| `?subjectId=edc` | `→ science` | ✅ SubjectService maps |
| `?topicId=dbms-sql-basics` | `→ needs catalog mapping` | 🟡 Test required |
| `/subjects/dbms` | `→ mathematics` | 🟡 Test required |
| `/subjects/edc` | `→ science` | 🟡 Test required |

## Phase 6: Testing Checklist

- [ ] Backend builds without errors
- [ ] `/api/subjects` returns 2+ subjects
- [ ] `/api/subjects/dbms` maps to mathematics
- [ ] `/api/subjects/edc` maps to science
- [ ] Frontend app loads without subject-related console errors
- [ ] subject helper path returns subjects list
- [ ] Old `?subjectId=dbms` URLs work
- [ ] New user onboarding defaults to first available subject
- [ ] Tests pass: `npm test` (frontend), `mvn test` (backend)

## Phase 7: Add New Subjects (Future)

To add a new subject **without code changes**:

### Step 1: Insert in Supabase

```sql
INSERT INTO subjects (id, name, description, tags, accent, backdrop, is_active)
VALUES 
  ('physics', 'Physics', 'Forces, energy, and motion', 
   ARRAY['physics', 'experiments'], '#FF6B35', '...', true);
```

### Step 2: Frontend Auto-Updates
- No code change needed
- Next refresh → `/api/subjects` includes physics
- UI automatically shows in subject picker

### Step 3: Add Topics
- Create topics with `subjectId = 'physics'` in catalog
- TopicService will auto-include them

## Rollback Plan (if needed)

If issues occur:

### Option 1: Revert Subject Mappings to Code-Only
- Pull old code from `git log`
- Keep database schema but don't load from DB
- Use hardcoded fallback in SubjectService

### Option 2: Database Rollback
```sql
-- Restore old subject IDs in user profiles
UPDATE learner_profiles 
SET preferred_subject_id = 
  CASE 
    WHEN preferred_subject_id = 'mathematics' THEN 'dbms'
    WHEN preferred_subject_id = 'science' THEN 'edc'
    ELSE preferred_subject_id
  END;

-- Drop new tables (optional)
DROP TABLE IF EXISTS subjects CASCADE;
```

## Metrics and Monitoring

Track these after migration:

1. **API Performance**
   - Subject loading latency (target: <100ms)
   - Cache hit rate

2. **User Impact**
   - % of users hitting old URLs
   - Subject mismatch errors in logs
   - Onboarding completion rate

3. **Data Quality**
   - # of users with unmapped subjects
   - Cross-subject topic links still valid

---

## Questions or Help?

Refer to:
- [Backend Integration Guide](./BACKEND_INTEGRATION_GUIDE.md)
- [API Documentation](./ARCHITECTURE.md)
- [Database Schema](./supabase-schema.sql)
