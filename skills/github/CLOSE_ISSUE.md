# Close GitHub Issue

Close a GitHub issue, optionally adding a final comment explaining the resolution.

## Instructions

1. **Get the issue number**:
   - The user should provide the issue number
   - If not provided, ask the user

2. **Determine if a comment should be added**:
   - If the user provides a reason, use it as the closing comment
   - If there's context from the conversation, create a brief closing comment
   - Otherwise, close without a comment

3. **Close the issue** (see examples below)

4. **Confirm the closure**:
   - Display a message confirming the issue was closed
   - Show the issue number and final state
   - Optionally run `gh issue view [number]` to show the closed issue

## Close Examples

### Close with comment
```bash
gh issue close 123 --comment "Fixed in PR #456"
```

### Close with detailed explanation
```bash
gh issue close 123 --comment "$(cat <<'EOF'
## Resolution
This issue has been resolved.

**Fix**: Implemented proper validation for special characters
**Tested**: All edge cases now pass
**PR**: #456
EOF
)"
```

### Close as not planned
```bash
# Use this when the issue won't be worked on
gh issue close 123 --reason "not planned" --comment "This is out of scope for the current roadmap"
```

### Close as completed (default)
```bash
# Default reason is "completed"
gh issue close 123 --comment "Issue resolved"
```

### Simple close without comment
```bash
gh issue close 123
```

## Close Reasons

GitHub supports two close reasons:

- **completed** (default): The issue was resolved/fixed
- **not planned**: The issue won't be worked on

### When to use "not planned"
```bash
# Duplicate issue
gh issue close 123 --reason "not planned" --comment "Duplicate of #456"

# Out of scope
gh issue close 123 --reason "not planned" --comment "Out of scope for this project"

# Won't fix
gh issue close 123 --reason "not planned" --comment "This behavior is intentional"

# Cannot reproduce
gh issue close 123 --reason "not planned" --comment "Cannot reproduce. Please reopen with more details if this persists"
```

## Common Closing Patterns

### Fixed in PR
```bash
gh issue close 123 --comment "Fixed in PR #789"
```

### Fixed in commit
```bash
gh issue close 123 --comment "Fixed in commit abc123"
```

### Duplicate
```bash
gh issue close 123 --reason "not planned" --comment "Duplicate of #456"
```

### Cannot reproduce
```bash
gh issue close 123 --reason "not planned" --comment "Cannot reproduce this issue. Please reopen with additional details if it persists."
```

### Working as intended
```bash
gh issue close 123 --reason "not planned" --comment "This is working as designed. See documentation for details."
```

### Completed as requested
```bash
gh issue close 123 --comment "Completed as requested. Feature is now available in v2.0"
```

## Important Notes

- Always provide context in the closing comment
- Reference PRs or commits that fixed the issue
- Use "not planned" for issues that won't be fixed
- Be clear and helpful in closing comments
- Consider adding relevant labels before closing (e.g., "wontfix", "duplicate")

## Best Practices

1. **Be specific**: Explain what was done or why it's closing
2. **Reference work**: Link to PRs, commits, or related issues
3. **Be helpful**: Provide next steps or alternatives if applicable
4. **Update labels**: Add appropriate labels before closing
5. **Thank contributors**: Acknowledge community contributions
