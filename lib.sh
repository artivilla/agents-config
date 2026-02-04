#!/bin/bash
# shared functions for install.sh and sync.sh

# resolve ~ to $HOME in path strings
expand_path() {
    local path="$1"
    echo "${path/#\~/$HOME}"
}

# parse agents.conf and output enabled agent entries
# each line: agent_name<tab>expanded_skills_path
get_enabled_agents() {
    local config_file="$1"
    if [[ ! -f "$config_file" ]]; then
        echo -e "claude\t$HOME/.claude/skills"
        return
    fi
    while IFS='=' read -r name path; do
        [[ -z "$name" || "$name" =~ ^[[:space:]]*# ]] && continue
        name="$(echo "$name" | tr -d '[:space:]')"
        path="$(echo "$path" | tr -d '[:space:]')"
        path="$(expand_path "$path")"
        echo -e "$name\t$path"
    done < "$config_file"
}
