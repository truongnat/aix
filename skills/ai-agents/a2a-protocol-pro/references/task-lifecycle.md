# Task Lifecycle

## States

```
submitted → assigned → in-progress → [completed | failed | cancelled]
```

## Sub-tasks

- Parent tasks can spawn child tasks.
- All tasks (parent and child) are trackable via a shared ID space.
- Parent task completes only when all required children complete.

## Error handling

1. **Retry**: Exponential backoff for transient failures.
2. **Escalation**: Forward to human or higher-capability agent.
3. **Fallback**: Reassign to backup agent with same capabilities.
4. **Cancel**: Propagate cancellation to all child tasks.

## Timeouts

- Every task must have a timeout.
- Default: 30 seconds for simple tasks, 5 minutes for complex research.
- No timeout = potential deadlock.
