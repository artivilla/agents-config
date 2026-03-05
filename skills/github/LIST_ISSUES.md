# List GitHub Issues

List and filter GitHub issues from the current repository using the `gh` CLI.

## Instructions

1. **Determine the filter**:
   - Common filters:
     - `open` - Show open issues (default)
     - `closed` - Show closed issues
     - `all` - Show all issues
     - `assigned` - Show issues assigned to you
     - `created` - Show issues created by you
     - `mentioned` - Show issues where you're mentioned
     - `label:bug` - Show issues with specific label
     - `assignee:username` - Show issues assigned to specific user
   - If no filter specified, default to showing open issues

2. **Fetch and display issues**:
   - Run: `gh issue list --state [filter]` or appropriate filter command
   - Use `--limit 20` to show first 20 issues
   - Format output with: `--json number,title,state,labels,assignees,createdAt`

3. **Display results**:
   - Show a formatted list of issues
   - Include issue number, state, title, and labels
   - Provide guidance on using view-issue for details

## Example Commands

### List open issues
```bash
gh issue list --state open --limit 20
```

### List all issues
```bash
gh issue list --state all --limit 20
```

### List by label
```bash
gh issue list --label bug --limit 20
gh issue list --label "high-priority" --limit 20
```

### List assigned to specific user
```bash
gh issue list --assignee username --limit 20
gh issue list --assignee "@me" --limit 20
```

### List with detailed JSON output
```bash
gh issue list --state open --limit 20 --json number,title,state,labels,assignees,createdAt
```

### Combine filters
```bash
gh issue list --state open --label bug --assignee "@me" --limit 10
```

## Output Format

The default output shows:
- Issue number (e.g., #123)
- Issue state (OPEN, CLOSED)
- Issue title
- Labels (if any)
- Time information

## Tips

- Use `--limit N` to control how many issues are shown (default is 30)
- Use `--json` for structured output that can be parsed
- Combine multiple filters to narrow down results
- Use `--assignee "@me"` to see your assigned issues
- Use `--author username` to see issues created by specific user
