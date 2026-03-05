# Update GitHub Issue

Modify an existing GitHub issue's title, body, labels, assignees, or other attributes.

## Instructions

1. **Identify the issue**:
   - Get the issue number from the user
   - If not provided, ask which issue to update

2. **Determine the update type**:
   Ask the user or infer from context what needs updating:
   - **Title**: New title for the issue
   - **Body**: Updated description
   - **Labels**: Add or remove labels
   - **Assignees**: Add or remove assignees
   - **Milestone**: Set milestone
   - **Comment**: Add a comment to the issue

3. **Perform the appropriate update** (see examples below)

4. **Confirm the update**:
   - Run `gh issue view [number]` to show the updated issue
   - Display what was changed

## Update Examples

### Update title
```bash
gh issue edit 123 --title "New Issue Title"
```

### Update body (using temporary file)
```bash
# Create temp file with new body
cat > /tmp/gh_issue_update_$$.md <<'EOF'
## Updated Summary
New description of the issue...

## Additional Details
More context and information...
EOF

gh issue edit 123 --body-file /tmp/gh_issue_update_$$.md
rm /tmp/gh_issue_update_$$.md
```

### Add labels
```bash
# Add single label
gh issue edit 123 --add-label "bug"

# Add multiple labels
gh issue edit 123 --add-label "bug,high-priority,needs-review"
```

### Remove labels
```bash
# Remove single label
gh issue edit 123 --remove-label "wontfix"

# Remove multiple labels
gh issue edit 123 --remove-label "duplicate,invalid"
```

### Add assignees
```bash
# Assign to yourself
gh issue edit 123 --add-assignee "@me"

# Assign to specific user
gh issue edit 123 --add-assignee "username"

# Assign to multiple users
gh issue edit 123 --add-assignee "user1,user2"
```

### Remove assignees
```bash
# Remove specific assignee
gh issue edit 123 --remove-assignee "username"

# Remove all assignees
gh issue edit 123 --remove-assignee "*"
```

### Set milestone
```bash
gh issue edit 123 --milestone "v2.0"
```

### Add a comment
```bash
# Simple comment
gh issue comment 123 --body "This is a comment"

# Multi-line comment with heredoc
gh issue comment 123 --body "$(cat <<'EOF'
## Status Update
Work is in progress.

Expected completion: Next week
EOF
)"
```

### Combine multiple updates
```bash
gh issue edit 123 \
  --title "Updated Title" \
  --add-label "in-progress" \
  --add-assignee "@me"
```

## Important Notes

- Use `--body-file` for body updates to avoid markdown conflicts
- Multiple labels/assignees can be comma-separated
- Use `$$` in temp file names to avoid conflicts (expands to process ID)
- Clean up temporary files after updates
- Verify changes with `gh issue view [number]`

## Common Update Patterns

### Mark as in progress
```bash
gh issue edit 123 --add-label "in-progress" --add-assignee "@me"
```

### Mark as blocked
```bash
gh issue edit 123 --add-label "blocked"
gh issue comment 123 --body "Blocked by: [reason]"
```

### Request review
```bash
gh issue edit 123 --add-label "needs-review"
gh issue comment 123 --body "Ready for review @reviewer"
```

### Update priority
```bash
gh issue edit 123 --remove-label "low-priority" --add-label "high-priority"
```
