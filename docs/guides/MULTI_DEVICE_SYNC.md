# Multi-Device Sync Guide

Use this guide when switching between your main machine and college laptop.

## One-Time Setup Per Machine

1. Clone the repository and open it in VS Code.
2. Make sure Git is signed in and can push to `origin`.
3. Use the same branch strategy on both devices (`learnx-clean` + short-lived branches).

## Start of a Session (Pull Latest)

From the repository root, run:

```powershell
./sync-workflow.ps1 -Mode start
```

What it does:

- fetches latest refs
- rebases your branch on top of upstream (`pull --rebase --autostash`)
- shows whether you are ahead/behind

## End of a Session (Push Safe State)

After committing your changes, run:

```powershell
./sync-workflow.ps1 -Mode end
```

What it does:

- verifies working tree is clean
- pushes your current branch
- sets upstream automatically if missing

## Quick Status Check

```powershell
./sync-workflow.ps1 -Mode status
```

## Recommended Cross-Device Routine

1. Start session sync.
2. Make changes and commit in small chunks.
3. End session sync before closing laptop.
4. On the other machine, repeat start session sync before editing.

## If Rebase Conflicts Happen

1. Resolve conflict files.
2. Run `git add <file>` for each resolved file.
3. Run `git rebase --continue`.
4. If needed, abort with `git rebase --abort` and ask for help.
