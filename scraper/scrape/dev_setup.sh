#!/bin/bash
set -e

# Note:
# This is just a convenience script for setting up the dev environment
# If you are on MAC or Linux and don't have uv installed, this will install it for you
# If you are on Windows, you will need to install uv manually or use PIP

# ==================================================
# Configuration
# ==================================================

LOG_FILE="log.txt"

# --------------------------------------------------
# Logging function
# --------------------------------------------------
log() {
    local msg="$1"
    if [ -n "$LOG_FILE" ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - $msg" >> "$LOG_FILE"
    else
        echo "$msg"
    fi
}

# --------------------------------------------------
# Initialize / reset log
# --------------------------------------------------
reset_log() {
    # If no log file is configured, do nothing
    [ -z "$LOG_FILE" ] && return 0

    mkdir -p "$(dirname "$LOG_FILE")"
    : > "$LOG_FILE"
}

# --------------------------------------------------
# Get script directory
# --------------------------------------------------
get_script_dir() {
    # $0 may be relative or absolute
    SCRIPT="$0"

    # If $0 is a relative path, prepend current working directory
    case "$SCRIPT" in
        /*) ;; # absolute path, do nothing
        *) SCRIPT="$(pwd)/$SCRIPT" ;;
    esac

    # Strip the filename to get directory
    SCRIPT_DIR="$(dirname "$SCRIPT")"

    # Convert to absolute path
    # Save current directory
    OLD_PWD="$(pwd)"
    cd "$SCRIPT_DIR" || return 1
    SCRIPT_DIR="$(pwd)"
    cd "$OLD_PWD" || return 1

    echo "$SCRIPT_DIR"
}


# --------------------------------------------------
# Check if curl is installed; returns 1 if missing
# --------------------------------------------------
require_curl() {
    if ! command -v curl >/dev/null 2>&1; then
        if command -v log >/dev/null 2>&1; then
            log "WARNING: curl is not installed — skipping update"
        else
            printf '%s\n' "WARNING: curl is not installed — skipping update" >&2
        fi
        return 1
    fi
    return 0
}

# --------------------------------------------------
# Ensure 'uv' is installed
# --------------------------------------------------
UV_INSTALL_URL="https://astral.sh/uv"
install_uv() {
    if command -v uv >/dev/null 2>&1; then
        return 0
    fi

    log "Installing uv..."

    if ! require_curl; then
        log "See: $UV_INSTALL_URL"
        printf '%s\n' "See: $UV_INSTALL_URL" >&2
        return 1
    fi

    if ! curl -LsSf "$UV_INSTALL_URL/install.sh" | sh; then
        log "ERROR: uv installation script failed"
        log "See: $UV_INSTALL_URL"
        printf '%s\n' "ERROR: failed to install uv" >&2
        printf '%s\n' "See: $UV_INSTALL_URL" >&2
        return 1
    fi

    # Common uv install location
    if [ -d "$HOME/.local/bin" ]; then
        PATH="$HOME/.local/bin:$PATH"
        export PATH
    fi

    if ! command -v uv >/dev/null 2>&1; then
        log "ERROR: uv installed but not found in PATH"
        log "See: $UV_INSTALL_URL"
        printf '%s\n' "ERROR: uv installed but not found in PATH" >&2
        printf '%s\n' "See: $UV_INSTALL_URL" >&2
        return 1
    fi

    log "uv installed successfully"
    return 0
}

# --------------------------------------------------
# Create virtual environment
# --------------------------------------------------
create_venv() {
    if [ ! -d ".venv" ]; then
        log "🔧 Creating virtual environment..."
        uv venv --python "$PY_VERSION"
    fi
}

# --------------------------------------------------
# Sync dependencies
# --------------------------------------------------
sync_dependencies() {
    log "🔄 Syncing dependencies..."
    uv sync --extra dev
}

# ==================================================
# Main Execution Flow
# ==================================================
main() {
    SCRIPT_DIR="$(get_script_dir)"
    cd "$SCRIPT_DIR" || {
        log "❌ Failed to cd into $SCRIPT_DIR"
        exit 1
    }

    reset_log
    log "=================================================="
    log "🚀 Setting up dev environment for Licensing Board Scraper"
    log "📁 Directory: $SCRIPT_DIR"
    log "--------------------------------------------------"

    #read -p "Press Enter to continue...1" _ </dev/tty
    
    install_uv
    sync_dependencies

    log "=================================================="
}

main "$@"

