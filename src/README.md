# LearnBot Pro – Common Source Directory

This directory is the **integration target** for all four feature modules.

## How to integrate

When each team member's module is ready to merge, copy (or symlink) their
source tree here following the package structure below:

```
src/
└── com/
    └── learnx/
        ├── core/          ← from CoreJava_Logic/src/com/learnx/core/
        │   ├── model/
        │   ├── service/
        │   ├── engine/
        │   └── util/
        ├── db/            ← from Database_Auth/src/com/learnx/db/
        │   ├── config/
        │   ├── model/
        │   ├── dao/
        │   ├── auth/
        │   └── migration/
        ├── ai/            ← from AI_Integration/src/com/learnx/ai/
        │   ├── client/
        │   ├── prompt/
        │   ├── response/
        │   └── config/
        └── ui/            ← from UI_Quizzes/src/com/learnx/ui/
            ├── menu/
            ├── quiz/
            ├── voice/
            └── visual/
```

## Build

> A `pom.xml` or `build.gradle` will be added to this directory once the
> team agrees on the build tool. Until then, compile with:
>
> ```bash
> find src -name "*.java" | xargs javac -d out/
> ```

## Naming conventions

| Rule | Detail |
|------|--------|
| Root package | `com.learnx` |
| Sub-packages | match the module folder name (`core`, `db`, `ai`, `ui`) |
| Class names  | UpperCamelCase |
| Test classes | same name + `Test` suffix, placed in a `test/` mirror tree |
