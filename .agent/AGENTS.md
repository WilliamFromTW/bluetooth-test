# Rules

- **Execution Confirmation**: Before modifying files, running commands, or making other destructive changes, ALWAYS propose the plan/changes to the user first and ask for explicit confirmation before executing them.
- **Strict Version Control**: After every significant update or feature completion, always perform a `git add` and `git commit` to ensure a complete version history.
- **Async Task Synchronization**: When invoking an asynchronous background subagent or task (e.g., syncing specs), ALWAYS wait for the completion message from the subagent before performing final `git add`, `git commit`, or branch operations.
