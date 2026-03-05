# View GitHub Issue Details

Display the full details of a specific GitHub issue including description, comments, labels, and metadata.

## Instructions

1. **Get the issue number**:
   - The user should provide the issue number
   - If not provided, ask the user for the issue number

2. **Fetch issue details**:
   - Run: `gh issue view [issue-number]`
   - This will display the full issue including:
     - Title and body
     - Issue number and state (open/closed)
     - Author and creation date
     - Labels and assignees
     - All comments with timestamps

3. **Display the information**:
   - Present the issue details in a readable format
   - Highlight key information like current state, assignees, and labels
   - If the issue has many comments, summarize the discussion

4. **Suggest actions**:
   - Based on the issue content, suggest relevant actions:
     - Update the issue if changes are needed
     - Close the issue if it's resolved
     - Assign the issue to someone if unassigned

## Example Commands

### View basic issue
```bash
gh issue view 123
```

### View with web browser
```bash
gh issue view 123 --web
```

### View with JSON output
```bash
gh issue view 123 --json title,body,state,labels,assignees,comments
```

### View with comments
```bash
# Default view includes all comments
gh issue view 123
```

## Output Includes

- **Title**: The issue title
- **State**: Open or closed status
- **Author**: Who created the issue
- **Labels**: All labels attached to the issue
- **Assignees**: Who the issue is assigned to
- **Milestone**: Associated milestone (if any)
- **Body**: The full issue description
- **Comments**: All comments in chronological order

## Tips

- Use `--web` to open the issue in your browser
- Use `--json` to get structured data for parsing
- Review comments to understand the full context
- Check labels to understand issue categorization
- Look at assignees to see who's responsible
