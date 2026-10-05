---
name: hockenworks-site
description: >-
  Write, preview, and publish content on the hockenworks.com Hugo site. Use when
  the user wants to add or edit an article/post, set up front matter, tags,
  categories, or a featured image, pick a shortcode for images/video/YouTube,
  run the site locally ("hugo server", "run the site", "preview locally"),
  publish an unlisted preview link, deploy ("./deploy.sh", "push to
  hockenworks.com"), or fix a deploy that isn't showing up (stale gh-pages
  worktree, Cloudflare/GitHub Pages TLS errors).
---

# Hockenworks site — writing, running, publishing

Hugo site in `G:\projects\hugohome`, theme `paige`, deployed to
`hockenworks.com` via the `gh-pages` branch checked out as a git worktree at
`public/`.

## Writing content

### Feature branches for new articles

Before adding a new article, inspect the current branch and working-tree changes.
Create and switch to a feature branch from `master`, using a name such as
`codex/article-<slug>`. Reuse the current feature branch when it already contains
the same article work. If the article work has already begun on `master`, create
the feature branch in place so those edits carry over. Preserve unrelated edits
and do not reset or stash them automatically.

Keep the article, its assets, and related template or skill changes together on
that branch. Stage specific source paths; `public/` is the deployment worktree
and must not be swept into a source commit, even if files there are tracked by
the parent repository. Keep review builds out of `public/`. Merge to `master`
when the user requests publication or explicitly requests the merge.

Put a new content tree with an `index.md` file plus the article's images into
`/content`. Copy the front matter from a similar article, then give it a unique
title, tags, date (and `publishDate` if it differs), and a category of
`"writing"` or `"builds"`.

- Reuse tags and categories from similar posts. **A new category becomes a new
  menu option in the top pill menu of the site** — it would never be appropriate to add one without asking the user.
- Publish new articles as an unlisted preview first (see below).
- Shortcodes exist for centered images with captions, inline images, centered
  videos, and YouTube. Use the ones other articles already use — see
  `layouts/shortcodes/` (e.g. `image-medium`, `image-small`, `image-inline-small`,
  `video-large`) and `paige/youtube`.

Typical front matter (from `content/ai-can-3d-model/index.md`):

```yaml
---
title: "Fable could really 3D model"
date: 2026-06-18
categories: ["builds"]
tags: ["AI", "3D Modeling", "Hardware", "openscad"]
featured: "ai-can-3d-model/images/mom-box-edit.jpg" # could be a .mp4, YouTube URL, whatever
---
```

### Previews and featured media

Content previews populate the home page list and the special references on the
`/about-me` page. They automatically take the **first image/video found in the
article** plus a text summary. If the summary doesn't look right, end it early
with a `<!--more-->` flag in the markdown.

To override the title image instead of using the first one, add `featured` to
the front matter:

```yaml
featured: "/images/sneakpeek.png" # could be an image or a video
```

`featured` accepts a path into `static/` (`/images/foo.png`), a path into the
page bundle (`slug/images/foo.jpg`), a `.mp4` (rendered as an autoplaying
video), or a full YouTube URL.

**A `youtube` shortcode can only be featured when it is the first media in the
post** — make sure it is first and do _not_ set `featured`, due to technical
constraints.

Markdown features are demonstrated at `/test-embeds/` (locally,
`http://localhost:1313/test-embeds/`). That page is unlisted via `_build.list:
never`, so it never appears in lists but is always rendered.

## Running the site locally

From the `hugohome` repo root:

```bash
hugo server --baseURL "http://localhost:1313/" --noHTTPCache
```

Optional flags:

| flag             | effect                                                        |
| ---------------- | ------------------------------------------------------------- |
| `--buildFuture`  | includes articles whose `date`/`publishDate` is in the future |
| `--buildDrafts`  | includes articles with `draft: true`                          |
| `--buildExpired` | includes expired articles                                     |

## Publishing an unlisted preview

Add this to the front matter before deploying — the page renders and is
reachable by URL, but stays out of lists, taxonomies, and RSS:

```yaml
url: "/preview/on-ai-software-vibe-coding-edition/" # any path you like
_build:
  list: never # don't show in section/taxonomy/RSS lists
  render: always # still write the HTML file
```

List the preview link on the previews page (`content/previews.md`) as
`[/preview/<slug>/](/preview/<slug>/)`.

## Publishing an article

"Publish this article" means publish the specified article immediately on
Hockenworks, verify it live, then prepare Substack, Twitter/X, and LinkedIn
composers for Brian to submit manually. It does not submit those external posts
or send the Substack email. Merely preparing an article or discussing this
workflow does not start publication.

Read [the publishing workflow](references/publishing-workflow.md) when the user
requests article publication. Ask early for Brian's one- or two-sentence social
announcement if he has not supplied it; continue independent site publication
while awaiting that text. Use the same supplied text for Twitter/X and LinkedIn
unless Brian provides separate versions.

## Deploying previews or other site changes

An explicit request to deploy an unlisted preview keeps its preview URL and
`_build` settings. Preview deployment does not start cross-posting.

Before running `./deploy.sh`, check that `public/` resolves to its own Git
worktree on `gh-pages`, and that the build uses `https://hockenworks.com/` as its
base URL. The script builds, stages, commits, and pushes generated files. When
running its commands individually, check each result; only "nothing to commit"
is an acceptable no-op. Do not ignore other commit failures.

### Fresh content is not showing up

Check the intended live URL, GitHub Pages deployment state, and the `public/`
worktree before rebuilding. Use `git worktree list` and inspect the worktree's
branch and local changes. Preserve changes before repairing a stale checkout;
do not delete a dirty deployment worktree or its `.git` metadata as a first
step. Keep review builds in a temporary destination so they do not alter the
deployment worktree.

### Cloudflare SSL/DNS error after publishing

Inspect GitHub Pages and Cloudflare DNS/TLS status. The recorded recovery is to
temporarily disable Cloudflare's proxy while GitHub Pages provisions TLS, then
restore it. Diagnose first and apply this only when the current user-authorized
repair scope covers the DNS change.

## Cross-post drafts

After the specified public article and homepage featured image pass live
verification, use [cross-post-to-substack](../cross-post-to-substack/SKILL.md)
for the full-article versus stub decision and formatted email draft, and
[cross-post-to-social](../cross-post-to-social/SKILL.md) for Twitter/X and
LinkedIn. These skills own their platform-specific rules; do not substitute a
blanket full-article copy procedure.

Leave all prepared external composers open with the remaining Publish/Post/Send
action for Brian. Substack drafts should be prepared for email delivery. Every
platform uses the article's featured image; Twitter/X and LinkedIn normally
obtain it from the article link card. Record draft URLs and handoff tabs so the
workflow can resume without creating duplicates.
