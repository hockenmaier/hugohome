# Repo Instructions

This repository hosts the Hugo-based personal website **Hockenworks**. Key background references are in the notes folder:

- `notes/site-description.md` describes the website, its Hugo setup, and how the Ball Machine integrates with the site.
- `notes/ball-machine-context.md` outlines the structure of the Ball Machine physics simulation game and guidance for editing its code.

Consult these files for context when making changes.

## Shared repository skills

The canonical site workflows live in `.agents/skills/` and apply to any agent
working in this repository:

- `.agents/skills/hockenworks-site/SKILL.md` owns article creation, previews,
  deployment, live verification, and the overall publishing workflow. Its
  references contain Twitter/X and LinkedIn draft preparation.
- `.agents/skills/cross-post-to-substack/SKILL.md` owns Substack content selection,
  formatting, email preparation, and draft verification. The site workflow calls
  it after live verification; a standalone Substack request does not redeploy.

Read the relevant skill before those tasks. Maintain these canonical files and
their references rather than creating competing copies in client-specific skill
folders. Local `.claude/skills/` compatibility junctions point to the same sources.
