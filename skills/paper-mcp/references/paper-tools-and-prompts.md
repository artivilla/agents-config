# Paper MCP tools and prompts

Use this reference to map your server's tool names to the paper workflow.

## Tool mapping checklist
Map these capabilities to your available paper MCP tools before running a task:
- Resolve identifiers (DOI/arXiv/PMID/URL)
- Fetch metadata (title, authors, year, venue)
- Fetch full text or section text
- Fetch figures and tables (with captions)
- Fetch citation/reference list
- Search papers by topic/keyword (optional)

If the server lacks one capability, document the gap and proceed with fallback methods.

## Prompt templates

### 1) Single-paper quick brief
Use when the user needs a concise summary with traceability.

```text
Use Paper MCP to analyze this paper: <doi-or-url>
Steps:
1. Fetch metadata.
2. Fetch abstract + method + main results sections.
3. Fetch key figures/tables and captions.
4. Return:
   - 5-bullet summary
   - contributions
   - limitations
   - 3 directly supported evidence snippets with section references
```

### 2) Extraction table for implementation
Use when the user wants code-facing details.

```text
Analyze paper: <doi-or-url>
Return a structured extraction table with columns:
- task
- dataset
- model/setup
- metrics
- baseline
- reported gains
- compute or latency constraints
- reproducibility notes
Include section or figure references for every row.
```

### 3) Multi-paper comparison
Use for literature review or method selection.

```text
Compare these papers:
- <paper-1>
- <paper-2>
- <paper-3>

For each paper, fetch metadata + key method/results sections.
Return:
- comparison table (assumptions, strengths, weaknesses, compute cost)
- disagreements between papers
- recommendation by scenario
Cite section-level evidence for each key claim.
```

### 4) Citation integrity check
Use before finalizing high-stakes summaries.

```text
For paper <doi-or-url>, list all claims in this draft that require citations.
Validate each claim against paper sections and references.
Mark each claim as:
- supported
- partially supported
- unsupported
Return corrected wording for unsupported claims.
```

## Output quality gate
Before responding, verify:
- Every major claim is tied to a section, figure, or citation.
- Numeric values match source context exactly.
- Uncertainty and missing context are explicitly called out.
- No invented citations or fabricated metrics are present.
