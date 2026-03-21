# UI_Quizzes

## Focus
This module provides the **user interface, voice interaction, visual learning diagrams, and adaptive quizzes** for LearnBot Pro.

## Responsibilities
- Console/CLI menu system for learner navigation
- Adaptive quiz engine: dynamically selects questions based on performance
- Voice interaction: text-to-speech (TTS) output and speech-to-text (STT) input
- Visual learning: ASCII/Unicode diagrams and structured concept maps
- Quiz result display with performance feedback

## Package Structure
```
src/
└── com/
    └── learnx/
        └── ui/
            ├── menu/         # Main menu, navigation, and screen rendering
            ├── quiz/         # Quiz flow, question display, answer evaluation
            ├── voice/        # TTS and STT integration helpers
            └── visual/       # Diagram renderers and visual concept maps
```

## Key Features
| Feature              | Description                                               |
|----------------------|-----------------------------------------------------------|
| Adaptive Quizzes     | Questions chosen by difficulty via the Core Logic engine  |
| Voice Interaction    | Reads questions aloud; accepts spoken answers (optional)  |
| Visual Diagrams      | Text-based concept maps and structured topic overviews    |
| Progress Dashboard   | Shows scores, streaks, and topic mastery at session end   |

## Integration
All source files compile into the common `src/` directory at the project root.  
When merging, place your classes under `src/com/learnx/ui/`.

## Guidelines
- Keep UI logic **separate** from business logic — call Core Java services via interfaces.
- Voice features should degrade gracefully when audio hardware is unavailable.
- All quiz logic must respect the difficulty level set by the adaptive engine.
- Use clear, age-appropriate language in all displayed text.
- Provide keyboard shortcuts for all menu actions (accessibility).
