# LearnX Web Product Plan

## Scope

This document plans the **web product** for LearnX.

It intentionally focuses on:

- product structure
- frontend experience
- page and feature planning
- user flows
- design system direction
- rollout phases

It intentionally does **not** plan:

- database design
- backend implementation
- API contracts
- infrastructure
- auth internals

Those can be planned later. This document is about making LearnX feel like a real, high-quality web product.

## 1. Product Direction

LearnX should be a **web-only learning platform** that feels as polished as a modern app.

The experience target is:

- as easy to browse as YouTube
- as focused as a study app
- as interactive as a tutor
- as structured as an exam-prep platform

In one line:

**LearnX = learning platform + tutor + revision coach + practice system**

## 2. Main Product Goals

The web product should help students:

- discover what to study
- understand topics clearly
- ask doubts instantly
- practice with structure
- revise for exams efficiently
- track their own learning progress

The product should feel:

- fast
- clean
- mobile-friendly
- confidence-building
- visually modern

## 3. Core Product Principles

These principles should guide every screen.

### 1. Clarity first

Users should always know:

- where they are
- what they can do next
- what topic they are learning
- what action is recommended

### 2. Learning over decoration

The UI should look premium, but every design choice should help learning instead of distracting from it.

### 3. Short path to value

A new user should be able to:

- open LearnX
- choose a subject
- ask a doubt
- start a quiz

within minutes.

### 4. Mobile-first experience

Most students will use phones often. The mobile web experience must feel native-quality, not like a squeezed desktop site.

### 5. Continuous momentum

The product should always suggest a next action:

- continue lesson
- ask a doubt
- take quick quiz
- revise weak topic
- start exam mode

## 4. Target Users

### Primary users

- engineering students
- exam-focused learners
- students who need faster explanations than textbooks provide

### Secondary users

- self-learners preparing for interviews or semester exams
- students who want coding help for academic subjects

### User mindset

Most users are not looking for a generic AI chatbot.

They want:

- "Explain this clearly"
- "Give me the important exam points"
- "Test me on this topic"
- "Tell me what to study next"

## 5. Product Pillars

The web app should be organized around five big pillars.

### 1. Learn

Structured topic pages, lessons, explanations, examples, and concept summaries.

### 2. Ask

AI tutor chat for doubts, follow-up questions, and exam-style explanations.

### 3. Practice

Quick quizzes, topic drills, and revision practice.

### 4. Revise

Exam mode, short notes, important questions, and rapid recap flows.

### 5. Progress

Dashboards showing completed topics, weak areas, strengths, and recommended next steps.

## 6. Information Architecture

The web app should have a clean app structure like this:

```text
/
/subjects
/subjects/:subjectId
/subjects/:subjectId/topic/:topicId
/learn/:subjectId/:topicId
/ask
/practice
/practice/:subjectId
/exam-mode
/progress
/search
/profile
```

### App navigation model

Main navigation should focus on:

- Home
- Subjects
- Ask AI
- Practice
- Progress

Secondary actions:

- Search
- Profile
- Settings

## 7. App Shell

The product should use a strong app shell, not a traditional website layout.

### Desktop shell

- left navigation rail
- top search and quick actions
- central content workspace
- optional right-side contextual panel for notes, resources, or related topics

### Mobile shell

- bottom navigation bar
- sticky top bar with search and current context
- floating quick-action button for "Ask AI"
- swipe-friendly cards and modules

### Persistent quick actions

The user should always have fast access to:

- ask a doubt
- continue learning
- start a quiz
- switch subject

## 8. Core Screens

## 8.1 Landing Page

Purpose:

- explain LearnX quickly
- show trust and clarity
- push users into the app

Sections:

- hero statement
- subject coverage
- how LearnX works
- sample lesson preview
- sample AI tutor preview
- practice and exam-mode preview
- CTA to enter app

### Tone

It should feel product-level, not like a student project landing page.

## 8.2 Home Dashboard

Purpose:

- act as the student's control center
- continue where they left off
- show recommended next actions

Main modules:

- continue learning
- today's recommended topic
- recent subjects
- weak topics to revise
- upcoming exam-mode actions
- recent tutor chats
- quick practice cards

### Dashboard behavior

If the user is new:

- show subject selection
- show onboarding cards
- show "start with your first topic"

If returning:

- prioritize resume actions over discovery

## 8.3 Subject Hub

Purpose:

- give each subject a strong home page
- make it easy to browse units and topics

Sections:

- subject overview
- syllabus/units
- important topics
- progress summary
- recommended path
- recent questions
- quick actions

### Example quick actions

- start from basics
- revise important topics
- practice this subject
- ask AI about this subject

## 8.4 Topic Page

Purpose:

- become the main learning surface for a single topic

Each topic page should include:

- topic title and summary
- why this topic matters
- prerequisites
- lesson content blocks
- diagrams or visual cards
- important formulas or definitions
- exam-style answer section
- common mistakes
- related questions
- ask-AI panel
- quick quiz trigger

### Content blocks

The lesson layout should support:

- quick overview
- deep explanation
- step-by-step breakdown
- worked example
- exam summary
- recap points

## 8.5 AI Tutor Screen

Purpose:

- give students a focused tutor experience

Modes inside the tutor:

- explain simply
- explain deeply
- exam answer mode
- code help mode
- problem-solving mode

### Tutor UX rules

- keep the input box always accessible
- allow follow-up questions without losing context
- show topic chips for context
- support citations/resources area
- allow "convert this to short notes"
- allow "quiz me on this"

### Important

This should feel like a study workspace, not a raw chatbot clone.

## 8.6 Practice Screen

Purpose:

- make practice fast and low-friction

Practice entry points:

- by subject
- by topic
- by difficulty
- by exam mode
- by weak areas

Practice formats:

- quick 5-question drill
- topic quiz
- mixed revision set
- timed challenge

### Result screen

After practice, the UI should show:

- score
- correct and wrong breakdown
- explanation for mistakes
- what to revise next
- retry or continue options

## 8.7 Exam Mode

Purpose:

- turn LearnX into an exam assistant

Sections:

- important questions
- 2-mark answers
- 5-mark answers
- 10-mark answers
- short revision notes
- last-minute revision cards

### UX goal

Exam mode should reduce anxiety. It should feel focused, quiet, and structured.

## 8.8 Progress Screen

Purpose:

- show students how they are improving

Modules:

- overall progress
- subject-wise progress
- weak topics
- strong topics
- recent activity
- practice streaks
- suggested next topics

### Visual style

Use clean progress visuals, but do not overdo gamification.

## 8.9 Search

Purpose:

- let users jump directly to subjects, topics, and questions

Search should support:

- topic names
- subject names
- concept keywords
- common question phrases

### Search results can include

- topics
- lessons
- quizzes
- tutor prompts
- exam resources

## 8.10 Profile and Settings

Purpose:

- let the user adjust the learning experience

Possible settings:

- preferred explanation style
- difficulty preference
- exam focus
- compact or expanded lesson layout
- light/dark theme later if desired

## 9. Onboarding Plan

The onboarding should be fast and useful.

### First-time flow

1. welcome screen
2. choose branch/subject interests
3. choose current goal
4. show recommended starting path
5. enter dashboard

### Goal options

- understand concepts
- prepare for semester exams
- improve coding/problem solving
- revise weak topics

### Onboarding result

The user should leave onboarding with:

- a starting subject
- a recommended topic
- one obvious next action

## 10. Learning Experience Model

Each topic should support multiple ways of learning the same content.

### Modes

- quick summary
- standard explanation
- deep explanation
- exam mode
- solved examples
- quiz mode

### Why this matters

Different students want different depths at different times. The UI should let them switch modes without leaving the topic context.

## 11. Content Design System

To make the product consistent, the frontend should standardize content blocks.

### Reusable content modules

- concept card
- definition block
- formula block
- worked example
- diagram block
- exam answer block
- quick recap list
- common mistakes block
- practice prompt block

Using these blocks will make lessons feel intentional and premium.

## 12. Design Language

The visual direction should feel modern and academic, not childish and not corporate-generic.

### Design goals

- strong readability
- bold but calm interface
- premium spacing
- clear hierarchy
- expressive cards and panels

### Visual character

- clean surfaces
- layered backgrounds
- warm, energetic accent colors
- high-contrast text
- intentional typography

### Avoid

- generic dashboard templates
- overly dark hacker-style aesthetics
- cluttered neon effects
- random illustration overload

## 13. UI Component Plan

The frontend should have a reusable component system from the start.

### Core components

- app shell
- nav rail
- mobile bottom nav
- subject card
- topic card
- lesson block
- tutor message panel
- quiz question card
- result summary card
- progress card
- recommendation card
- search result item
- sticky action bar

### Shared interaction states

- loading
- empty
- partial content
- success
- retry
- offline-ish degraded state

## 14. Motion and Interaction

Motion should support understanding, not distract from it.

### Good use of motion

- page transitions between major sections
- staggered lesson block reveals
- smooth quiz feedback transitions
- expandable answer panels
- context-preserving drawer transitions

### Avoid

- constant bouncing
- flashy animation on every card
- slow transitions that reduce study speed

## 15. Mobile Experience Rules

Because this is web-only, mobile quality is critical.

### Mobile rules

- bottom navigation should be thumb-friendly
- key actions should stay reachable with one hand
- long lessons should have sticky shortcuts
- quiz options should be large and tap-safe
- tutor input should stay visible above the keyboard
- progress visuals should remain legible on small screens

### Mobile-first priority screens

- dashboard
- topic page
- tutor
- quick quiz

## 16. Desktop Experience Rules

Desktop should feel like a productivity workspace.

### Desktop advantages

- split-view lesson + tutor
- wider analytics and progress layouts
- richer side panels
- faster multi-step study workflows

Desktop should not just stretch the mobile layout. It should use the extra space well.

## 17. Accessibility Standards

LearnX should be usable by a wide range of students.

### Accessibility priorities

- strong color contrast
- visible focus states
- keyboard navigation
- readable font sizes
- semantic headings
- clear error states
- captions/transcripts for media later

Accessibility should be part of the design system, not an afterthought.

## 18. Performance Goals

If the product feels slow, students will leave.

### Experience targets

- fast first load on average student devices
- immediate navigation feedback
- lightweight transitions
- content visible before advanced modules finish loading
- tutor interface that feels responsive even when generation takes time

### Frontend planning implications

- route-based loading
- skeleton states
- progressive disclosure
- smart caching on the client later

## 19. PWA Direction

Even though LearnX is web-only, it should feel installable and dependable.

### PWA-style goals

- add to home screen
- strong icon and splash behavior
- app-like shell
- resilient revisiting behavior
- useful offline or degraded handling for static screens later

This supports the "website that feels like an app" goal.

## 20. Feature Priorities

If we focus the product properly, the first public experience should not try to do everything.

### Must-have for v1

- strong landing page
- home dashboard
- subject hub
- topic page
- AI tutor screen
- basic practice flow
- progress screen
- search

### Should-have after v1

- exam mode
- saved notes
- recent history
- better recommendation surfaces
- richer lesson media

### Can wait

- voice interactions
- collaboration
- social features
- heavy gamification

## 21. Frontend Tech Direction

This is still frontend planning, not backend planning.

Recommended direction:

- Next.js or React
- TypeScript
- component-driven UI architecture
- utility-first styling or structured design tokens
- PWA support

### Frontend architecture sections

- app shell
- marketing layer
- authenticated app layer later
- reusable UI component library
- lesson/content rendering layer
- tutor interaction layer
- quiz/practice layer
- progress visualization layer

## 22. Suggested Frontend Folder Mindset

The frontend should eventually be organized around features, not random pages only.

Example high-level shape:

```text
app/
components/
features/subjects/
features/learn/
features/tutor/
features/practice/
features/progress/
features/search/
styles/
```

This is not a strict implementation rule yet. It is a planning direction to keep the web app maintainable.

## 23. Content and UX Tone

LearnX should sound:

- supportive
- clear
- smart
- exam-aware
- never robotic

The product copy should avoid:

- overhype
- vague AI marketing language
- intimidating academic jargon without explanation

## 24. Recommended Rollout Plan

## Phase 1: Product Foundation

Build:

- landing page
- app shell
- home dashboard
- subject hub
- topic page skeleton

Goal:

- users can browse and understand the product structure

## Phase 2: Learning Experience

Build:

- rich lesson blocks
- AI tutor screen
- topic-level quick actions
- search

Goal:

- users can learn and ask questions smoothly

## Phase 3: Practice Experience

Build:

- quiz flows
- results screen
- retry and revision prompts
- progress summaries

Goal:

- users can study actively, not only read

## Phase 4: Exam Layer

Build:

- exam mode
- important questions
- short-answer and long-answer layouts
- rapid revision experience

Goal:

- LearnX becomes useful during real exam preparation

## Phase 5: Product Polish

Build:

- stronger PWA feel
- saved state improvements
- performance tuning
- richer visual system
- premium transitions and responsiveness

Goal:

- the web app feels refined and memorable

## 25. What Success Looks Like

The product is working when a student can:

1. open LearnX on mobile or desktop
2. choose a subject quickly
3. understand a topic without friction
4. ask a doubt naturally
5. test themselves immediately
6. see what to study next
7. come back and continue without confusion

## 26. Final Product Statement

LearnX should not feel like "a website with AI."

It should feel like:

**a serious, modern learning app delivered through the web**
