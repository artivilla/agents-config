# Assign GitHub Issue

Assign a GitHub issue to one or more team members, or assign it to yourself.

## Instructions

1. **Get the issue number and assignee**:
   - The user should provide the issue number
   - The user should provide the username (or "me" for self-assignment)
   - If not provided, ask the user

2. **Determine the assignee**:
   - If "me" or "@me", assign to the current user
   - Otherwise, use the provided username(s)
   - Multiple usernames can be provided

3. **Perform the assignment** (see examples below)

4. **Confirm the assignment**:
   - Display a message confirming who was assigned
   - Optionally show the updated issue with `gh issue view [number]`

## Assignment Examples

### Assign to yourself
```bash
gh issue edit 123 --add-assignee "@me"
```

### Assign to specific user
```bash
gh issue edit 123 --add-assignee "username"
```

### Assign to multiple users
```bash
gh issue edit 123 --add-assignee "user1,user2,user3"
```

### Remove assignee
```bash
# Remove specific user
gh issue edit 123 --remove-assignee "username"
```

### Remove all assignees
```bash
gh issue edit 123 --remove-assignee "*"
```

### Replace assignee
```bash
# Remove old assignee and add new one
gh issue edit 123 --remove-assignee "olduser" --add-assignee "newuser"
```

## Common Assignment Patterns

### Take ownership of an issue
```bash
gh issue edit 123 --add-assignee "@me"
```

### Reassign to another team member
```bash
gh issue edit 123 --remove-assignee "@me" --add-assignee "teammate"
```

### Assign to team lead for review
```bash
gh issue edit 123 --add-assignee "team-lead"
gh issue comment 123 --body "Ready for review @team-lead"
```

### Distribute work across team
```bash
# Assign frontend work
gh issue edit 123 --add-assignee "frontend-dev"

# Assign backend work
gh issue edit 456 --add-assignee "backend-dev"

# Assign design work
gh issue edit 789 --add-assignee "designer"
```

## Query Assigned Issues

### View issues assigned to you
```bash
gh issue list --assignee "@me"
```

### View issues assigned to specific user
```bash
gh issue list --assignee "username"
```

### View unassigned issues
```bash
gh issue list --assignee ""
```

### View issues by state and assignee
```bash
# Open issues assigned to you
gh issue list --state open --assignee "@me"

# All issues (open and closed) assigned to user
gh issue list --state all --assignee "username"
```

## Important Notes

- Use `@me` to assign to yourself without knowing your username
- Multiple assignees are comma-separated (no spaces)
- Use `*` to remove all assignees
- Not all repositories allow multiple assignees (depends on GitHub plan)
- Assignees must have read access to the repository

## Best Practices

1. **Assign early**: Assign issues when starting work to avoid duplicates
2. **Communicate**: Add a comment when assigning to someone else
3. **Check capacity**: Don't overload team members with assignments
4. **Use yourself**: Assign to yourself when taking ownership
5. **Update status**: Combine assignment with label updates (e.g., "in-progress")

## Assignment Workflow Example

### Starting work on an issue
```bash
# 1. Assign to yourself
gh issue edit 123 --add-assignee "@me"

# 2. Update status label
gh issue edit 123 --add-label "in-progress"

# 3. Add comment
gh issue comment 123 --body "Starting work on this issue"
```

### Requesting help
```bash
# 1. Add additional assignee
gh issue edit 123 --add-assignee "helper"

# 2. Add comment explaining what help is needed
gh issue comment 123 --body "@helper Could you help with the database schema changes?"
```

### Handing off work
```bash
# 1. Remove yourself and add new person
gh issue edit 123 --remove-assignee "@me" --add-assignee "teammate"

# 2. Add comment with context
gh issue comment 123 --body "$(cat <<'EOF'
@teammate Handing this off to you.

## Context
- Database migrations are complete
- API endpoints need implementation
- Tests are in progress

Let me know if you need any clarification!
EOF
)"
```
