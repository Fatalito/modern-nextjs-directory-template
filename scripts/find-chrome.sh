#!/bin/bash
# Locate Playwright's bundled Chromium (Docker/Linux CI).
# Outputs the binary path, or nothing if not found.
# When empty, chrome-launcher auto-detects the system Chrome (macOS/standard installs).
find /ms-playwright -name chrome -path "*/chromium-*/chrome-linux64/chrome" -not -path "*headless*" -type f 2>/dev/null | head -1
