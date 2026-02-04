# Multi-Agent Skills Symlink Support

## Summary

Add `agents.conf` config file so `install.sh` and `sync.sh` symlink skills to multiple AI agent directories, not just `~/.claude/skills/`. Settings, agents/, and rules/ remain Claude-only.

## Config File: `agents.conf` (new, repo root)

Simple `name=path` format, one per line. Comments with `#`. Claude enabled by default, others commented out.

```
claude=~/.claude/skills
# codex=~/.codex/skills
# amp=~/.config/agents/skills
# antigravity=~/.gemini/antigravity/global_skills
# droid=~/.factory/skills
# gemini=~/.gemini/skills
```

## New File: `lib.sh` (repo root)

Shared functions sourced by both `install.sh` and `sync.sh`:

- `expand_path()` - resolve `~` to `$HOME`
- `get_enabled_agents()` - parse `agents.conf`, output `name\texpanded_path` lines. Falls back to claude-only if no config file exists.

## Files Modified

### 1. `install.sh`
- Added `source "$CONFIG_DIR/lib.sh"` near top
- Skills loop wraps in outer loop over `get_enabled_agents`. For each agent:
  - `mkdir -p "$agent_skills_path"`
  - Prints agent header (e.g. `Skills -> codex (~/.codex/skills)`)
  - Inner loop symlinks each skill to `$agent_skills_path/$skill_name`
  - Conflict handling per-agent independently
- Done message lists which agents were configured

### 2. `sync.sh`
- Added `source "$CONFIG_DIR/lib.sh"` near top
- Added `show_dir_status_for_path()` for per-agent skills status display
- **Status display**: Loops over agents, shows skills status per agent dir
- **`add_skill`**: After adding to repo + claude symlink, also creates symlinks for other enabled agents
- **`remove_skill`**: After removing from repo, also removes symlinks from other enabled agents
- **`validate_all_skills`**: Checks local-only skills across all agent dirs (deduplicates)
- **`undo_last`**: Restore loop walks all top-level dirs in backup instead of hardcoded `.claude`

### 3. `tests/test_helper.bash`
- Copies `lib.sh` to `$FAKE_REPO/` in `setup_test_env`
- Creates default `agents.conf` (claude pointing to `$FAKE_HOME/.claude/skills`) in `setup_test_env`
- Added `create_multi_agent_conf` helper (claude + codex + gemini pointing to fake dirs)

### 4. `tests/install.bats` - 9 new test cases
- Skills symlink to multiple agents
- Agent dirs get created
- Only enabled agents get skills
- agents/rules stay claude-only with multi-agent
- Dry-run shows per-agent output
- Conflict in one agent handled independently
- Falls back to claude-only without agents.conf
- Multi-agent is idempotent
- Shows enabled agents in done message

### 5. `tests/sync.bats` - 3 new test cases
- Status shows skills per agent
- `add skill` symlinks to all enabled agents
- `remove skill` cleans up all agent symlinks

### 6. `tests/validation.bats`
- Updated assertions from `(local)` to `(local` to match new `(local - agent_name)` format

### 7. `CLAUDE.md` / `README.md`
- Documented `agents.conf` usage and multi-agent support

## Key Design Decisions

- **No bash 4+ features** - avoids associative arrays since macOS ships bash 3.2
- **Fallback** - missing `agents.conf` = claude-only (backwards compatible)
- **Skills only** - other item types (settings, agents, rules) stay claude-only
- **Independent conflicts** - each agent dir handles conflicts separately
- **Shared lib** - `lib.sh` avoids duplicating the config parser

## Supported Agents

| Agent | Global Skills Path |
|-------|-------------------|
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.codex/skills/` |
| Amp | `~/.config/agents/skills/` |
| Antigravity | `~/.gemini/antigravity/global_skills/` |
| Droid | `~/.factory/skills/` |
| Gemini CLI | `~/.gemini/skills/` |

## Test Results

69/69 tests passing (`bats tests/`).
