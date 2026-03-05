# Create GitHub Issue from Context

You need to create a GitHub issue using the `gh` CLI tool. Follow these steps:

## Variables

{ TMPDIR: $TMPDIR, TIMESTAMP: $TIMESTAMP } = $`node -p "JSON.stringify({TMPDIR: require('os').tmpdir(), TIMESTAMP: new Date().toISOString().replace(/[:.]/g, '-')})"`

## Example

Use the "Write" tool to write the body to a temp file $TMPDIR/gh_issue_body_$TIMESTAMP.md
<template>
## Summary
Login fails when username contains special characters like @, #, or spaces.

## Context
User reported authentication errors during testing. The issue occurs consistently
with usernames containing special characters.

## Details
Error message: "Invalid username format"
Affected usernames: user@domain, user#123, "user name"

## Acceptance Criteria
- [ ] Special characters are properly escaped
- [ ] All valid email formats work as usernames
- [ ] Tests added for edge cases
</template>

## List the Available Labels using the `gh` CLI tool

```bash
gh label list
```

## Create the issue using the `gh` CLI tool

```bash
gh issue create --title "Fix login with special characters in username" --body-file $TMPDIR/gh_issue_body_$TIMESTAMP.md
```

## Avoid Cleaning Up Temporary Files

Don't attempt to `rm` the temporary file.