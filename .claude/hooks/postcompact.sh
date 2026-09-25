#!/usr/bin/env bash
# Post-compact hook: update walkthrough.md with session summary
set -euo pipefail

PROJECT_ROOT="$1"
WALKTHROUGH="$PROJECT_ROOT/walkthrough.md"

# If no walkthrough exists, create from template
if [[ ! -f "$WALKTHROUGH" ]]; then
    cat > "$WALKTHROUGH" << 'TEMPLATE'
# Project Walk-through

## Session State
- **Last session end:** $(date '+%Y-%m-%d %H:%M')
- **Active agent:** (none)
- **Current budget remaining:** (from session)

## Current Task
> (task description or "None")

## Recent Actions
### Tool Calls
- $(date '+%H:%M:%S') - PostCompact hook triggered - Initialized walkthrough

### File Changes
- (none yet)

## Files Modified
```yaml
/approach:
  files: []
keys:
  - (relative paths)
```

## Questions / Open Issues
- (unanswered questions from session)

## Next Steps
1. (next action)
2. ...

## Agent Notes
- (notes from agent reasoning)

## Key Files
- (important files for this project)

## Credentials Needed
- (any env vars, API keys, passwords required)
TEMPLATE
    echo "Initialized walkthrough.md at $WALKTHROUGH"
    exit 0
fi

# Backup original
cp "$WALKTHROUGH" "${WALKTHROUGH}.bak.$$"

# Update session state timestamp
sed -i "s/^- \*\*Last session end:\*\*.*/- **Last session end:** $(date '+%Y-%m-%d %H:%M')/" "$WALKTHROUGH"

# Append a session block under Recent Actions
SESSION_MARKER="## Recent Actions"
if grep -q "$SESSION_MARKER" "$WALKTHROUGH"; then
    # Insert after the Recent Actions header, before any other section
    awk -v marker="$SESSION_MARKER" -v time="$(date '+%H:%M:%S')" '
    /^## Recent Actions$/ { print; print ""; print "### Tool Calls"; print "- " time " - PostCompact hook triggered - Session compaction completed"; print ""; print "### File Changes"; print "- (see above for details)"; next }
    1
    ' "${WALKTHROUGH}.bak.$$" > "$WALKTHROUGH"
else
    # Fallback: append at end
    {
        cat "${WALKTHROUGH}.bak.$$"
        echo ""
        echo "## Recent Actions"
        echo "### Tool Calls"
        echo "- $(date '+%H:%M:%S') - PostCompact hook triggered - Session compaction completed"
        echo "### File Changes"
        echo "- (see above for details)"
    } > "$WALKTHROUGH"
fi

# Clean up backup
rm -f "${WALKTHROUGH}.bak.$$"

echo "Updated walkthrough.md at $WALKTHROUGH"
