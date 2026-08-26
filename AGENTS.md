# Superset workspace safety

Before changing files, verify `pwd`, `git branch --show-current`, `git status --short`, and `git worktree list --porcelain`.

When the active checkout is under `.superset/worktrees/`, it is the user-visible Superset workspace and is the default implementation target. Do not create, select, or write to a sibling or nested Git worktree with `git worktree add` merely because a feature plan asks for a dedicated worktree: in Superset, the active workspace already provides that isolation.

Creating or switching to another worktree requires the user's explicit request. Before reporting completion, verify that `git status --short` in the active workspace shows the changes being reported.
