# Paper MCP config

This reference describes setup and troubleshooting for paper MCP access.

## Setup checklist
- Ensure the paper MCP server is configured in your MCP client.
- Confirm required credentials and env vars are present (provider-specific).
- Restart the MCP client session after config changes.
- Verify the server appears in the MCP tools list.

## Verification workflow
1. Run a tool-list operation and confirm paper MCP tools are visible.
2. Resolve one known paper by DOI or arXiv ID.
3. Fetch metadata and confirm title/authors/year match expected values.
4. Fetch one section and one citation sample to verify deeper access.

## Common issues and fixes
- Server not visible:
  - Check MCP config path and JSON/TOML syntax.
  - Restart client after edits.
- Auth errors:
  - Re-check env var names and token scope.
  - Confirm account/project access for the paper provider.
- Empty or partial content:
  - Try alternate identifiers (DOI vs arXiv URL).
  - Fetch section-level context instead of full-text.
- Slow or truncated responses:
  - Use smaller section requests and paginate when supported.
  - Prioritize abstract, method, results, and appendix sections needed for the task.

## Input guidance
- Prefer canonical IDs where possible:
  - DOI for published papers
  - arXiv ID for preprints
  - PMID for biomedical papers
- Preserve the exact ID format when passing it to tools.
