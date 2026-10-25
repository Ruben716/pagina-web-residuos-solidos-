---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

<!--
Source: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
Local modification: the upstream skill fetches its rules at runtime from
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
That file was reviewed and vendored as ./guidelines.md (fetched 2026-10-25) so the
skill does not pull remote instructions on every run. Re-vendor manually to update.
-->

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Read the guidelines from the local file `guidelines.md` in this skill's directory
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Use the vendored copy: [guidelines.md](guidelines.md)

(Upstream: `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`)

## Usage

When a user provides a file or pattern argument:
1. Read `guidelines.md`
2. Read the specified files
3. Apply all rules from the guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.
