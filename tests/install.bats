#!/usr/bin/env bats
# Tests for install.sh

load 'test_helper'

setup() {
    setup_test_env
}

teardown() {
    teardown_test_env
}

# =============================================================================
# Basic Installation Tests
# =============================================================================

@test "install.sh creates ~/.claude directory" {
    create_fake_settings
    run_install
    assert_dir "$FAKE_HOME/.claude"
}

@test "install.sh symlinks settings.json" {
    create_fake_settings
    run_install
    assert_symlink "$FAKE_HOME/.claude/settings.json" "$FAKE_REPO/settings.json"
}

@test "install.sh symlinks statusline.sh" {
    create_fake_statusline
    run_install
    assert_symlink "$FAKE_HOME/.claude/statusline.sh" "$FAKE_REPO/statusline.sh"
}

@test "install.sh symlinks skills" {
    create_fake_skill "test-skill"
    run_install
    assert_symlink "$FAKE_HOME/.claude/skills/test-skill" "$FAKE_REPO/skills/test-skill"
}

@test "install.sh symlinks multiple skills" {
    create_fake_skill "skill-one"
    create_fake_skill "skill-two"
    create_fake_skill "skill-three"
    run_install
    assert_symlink "$FAKE_HOME/.claude/skills/skill-one" "$FAKE_REPO/skills/skill-one"
    assert_symlink "$FAKE_HOME/.claude/skills/skill-two" "$FAKE_REPO/skills/skill-two"
    assert_symlink "$FAKE_HOME/.claude/skills/skill-three" "$FAKE_REPO/skills/skill-three"
}

@test "install.sh symlinks agents" {
    create_fake_agent "test-agent"
    run_install
    assert_symlink "$FAKE_HOME/.claude/agents/test-agent.md" "$FAKE_REPO/agents/test-agent.md"
}

@test "install.sh symlinks rules" {
    create_fake_rule "test-rule"
    run_install
    assert_symlink "$FAKE_HOME/.claude/rules/test-rule.md" "$FAKE_REPO/rules/test-rule.md"
}

# =============================================================================
# Dry Run Tests
# =============================================================================

@test "install.sh --dry-run doesn't create symlinks" {
    create_fake_settings
    create_fake_skill "test-skill"
    run_install --dry-run
    [[ ! -L "$FAKE_HOME/.claude/settings.json" ]]
    [[ ! -L "$FAKE_HOME/.claude/skills/test-skill" ]]
}

@test "install.sh --dry-run shows what would be done" {
    create_fake_settings
    run run_install --dry-run
    [[ "$output" == *"[dry-run]"* ]]
    [[ "$output" == *"Would link settings.json"* ]]
}

@test "install.sh -n is alias for --dry-run" {
    create_fake_settings
    run run_install -n
    [[ "$output" == *"[dry-run]"* ]]
    [[ ! -L "$FAKE_HOME/.claude/settings.json" ]]
}

# =============================================================================
# Conflict Detection Tests
# =============================================================================

@test "install.sh detects conflict when local file exists" {
    create_fake_settings
    # Create a different local settings.json
    mkdir -p "$FAKE_HOME/.claude"
    echo '{"local": true}' > "$FAKE_HOME/.claude/settings.json"

    run run_install --dry-run
    [[ "$output" == *"Would backup and replace"* ]]
}

@test "install.sh --force overwrites conflicts with backup" {
    create_fake_settings
    # Create a conflicting local file
    mkdir -p "$FAKE_HOME/.claude"
    echo '{"local": true}' > "$FAKE_HOME/.claude/settings.json"

    run_install --force
    assert_symlink "$FAKE_HOME/.claude/settings.json" "$FAKE_REPO/settings.json"
    assert_backup_exists
}

@test "install.sh doesn't treat existing correct symlinks as conflicts" {
    create_fake_settings
    mkdir -p "$FAKE_HOME/.claude"
    ln -s "$FAKE_REPO/settings.json" "$FAKE_HOME/.claude/settings.json"

    run run_install --dry-run
    [[ "$output" != *"Would backup"* ]]
}

# =============================================================================
# Backup Tests
# =============================================================================

@test "install.sh creates backup when overwriting" {
    create_fake_settings
    mkdir -p "$FAKE_HOME/.claude"
    echo '{"local": true}' > "$FAKE_HOME/.claude/settings.json"

    run_install --force
    assert_backup_exists
    assert_manifest_operation "install"
}

@test "install.sh backup contains original file" {
    create_fake_settings
    mkdir -p "$FAKE_HOME/.claude"
    echo '{"local": true}' > "$FAKE_HOME/.claude/settings.json"

    run_install --force

    local latest
    latest="$(get_latest_backup)"
    [[ -f "$FAKE_REPO/.backup/$latest/.claude/settings.json" ]]
}

@test "install.sh backup manifest has correct format" {
    create_fake_settings
    mkdir -p "$FAKE_HOME/.claude"
    echo '{"local": true}' > "$FAKE_HOME/.claude/settings.json"

    run_install --force

    local latest
    latest="$(get_latest_backup)"
    local manifest="$FAKE_REPO/.backup/$latest/manifest.json"

    # Check manifest structure
    grep -q '"timestamp":' "$manifest"
    grep -q '"operation": "install"' "$manifest"
    grep -q '"items":' "$manifest"
    grep -q '"user":' "$manifest"
}

# =============================================================================
# Help Tests
# =============================================================================

@test "install.sh --help shows usage" {
    run run_install --help
    [[ "$output" == *"Usage:"* ]]
    [[ "$output" == *"--dry-run"* ]]
    [[ "$output" == *"--force"* ]]
}

@test "install.sh -h shows usage" {
    run run_install -h
    [[ "$output" == *"Usage:"* ]]
}

# =============================================================================
# Idempotency Tests
# =============================================================================

@test "install.sh is idempotent (running twice works)" {
    create_fake_settings
    create_fake_skill "test-skill"

    run_install
    run_install

    assert_symlink "$FAKE_HOME/.claude/settings.json" "$FAKE_REPO/settings.json"
    assert_symlink "$FAKE_HOME/.claude/skills/test-skill" "$FAKE_REPO/skills/test-skill"
}

@test "install.sh preserves local-only items" {
    create_fake_settings
    mkdir -p "$FAKE_HOME/.claude/skills/local-skill"
    echo "local content" > "$FAKE_HOME/.claude/skills/local-skill/SKILL.md"

    run_install

    # Local skill should still exist
    [[ -d "$FAKE_HOME/.claude/skills/local-skill" ]]
    [[ -f "$FAKE_HOME/.claude/skills/local-skill/SKILL.md" ]]
}

# =============================================================================
# Multi-Agent Installation Tests
# =============================================================================

@test "install.sh symlinks skills to multiple agents" {
    create_multi_agent_conf
    create_fake_skill "test-skill"
    run_install
    assert_symlink "$FAKE_HOME/.claude/skills/test-skill" "$FAKE_REPO/skills/test-skill"
    assert_symlink "$FAKE_HOME/.codex/skills/test-skill" "$FAKE_REPO/skills/test-skill"
    assert_symlink "$FAKE_HOME/.gemini/skills/test-skill" "$FAKE_REPO/skills/test-skill"
}

@test "install.sh creates agent skill directories" {
    create_multi_agent_conf
    create_fake_skill "test-skill"
    run_install
    assert_dir "$FAKE_HOME/.codex/skills"
    assert_dir "$FAKE_HOME/.gemini/skills"
}

@test "install.sh only installs skills to enabled agents" {
    # default conf has only claude
    create_fake_skill "test-skill"
    run_install
    assert_symlink "$FAKE_HOME/.claude/skills/test-skill" "$FAKE_REPO/skills/test-skill"
    [[ ! -d "$FAKE_HOME/.codex/skills" ]]
}

@test "install.sh agents/rules stay claude-only with multi-agent" {
    create_multi_agent_conf
    create_fake_agent "test-agent"
    create_fake_rule "test-rule"
    run_install
    assert_symlink "$FAKE_HOME/.claude/agents/test-agent.md" "$FAKE_REPO/agents/test-agent.md"
    assert_symlink "$FAKE_HOME/.claude/rules/test-rule.md" "$FAKE_REPO/rules/test-rule.md"
    [[ ! -e "$FAKE_HOME/.codex/agents" ]]
    [[ ! -e "$FAKE_HOME/.gemini/rules" ]]
}

@test "install.sh --dry-run shows per-agent output" {
    create_multi_agent_conf
    create_fake_skill "test-skill"
    run run_install --dry-run
    [[ "$output" == *"codex"* ]]
    [[ "$output" == *"gemini"* ]]
}

@test "install.sh handles conflict in one agent independently" {
    create_multi_agent_conf
    create_fake_skill "test-skill"
    # create conflict only in codex
    mkdir -p "$FAKE_HOME/.codex/skills/test-skill"
    echo "local" > "$FAKE_HOME/.codex/skills/test-skill/README.md"

    run_install --force
    assert_symlink "$FAKE_HOME/.claude/skills/test-skill" "$FAKE_REPO/skills/test-skill"
    assert_symlink "$FAKE_HOME/.codex/skills/test-skill" "$FAKE_REPO/skills/test-skill"
    assert_backup_exists
}

@test "install.sh falls back to claude-only without agents.conf" {
    rm -f "$FAKE_REPO/agents.conf"
    create_fake_skill "test-skill"
    run_install
    assert_symlink "$FAKE_HOME/.claude/skills/test-skill" "$FAKE_REPO/skills/test-skill"
}

@test "install.sh multi-agent is idempotent" {
    create_multi_agent_conf
    create_fake_skill "test-skill"

    run_install
    run_install

    assert_symlink "$FAKE_HOME/.claude/skills/test-skill" "$FAKE_REPO/skills/test-skill"
    assert_symlink "$FAKE_HOME/.codex/skills/test-skill" "$FAKE_REPO/skills/test-skill"
    assert_symlink "$FAKE_HOME/.gemini/skills/test-skill" "$FAKE_REPO/skills/test-skill"
}

@test "install.sh shows enabled agents in done message" {
    create_multi_agent_conf
    create_fake_skill "test-skill"
    run run_install
    [[ "$output" == *"claude"* ]]
    [[ "$output" == *"codex"* ]]
    [[ "$output" == *"gemini"* ]]
}
