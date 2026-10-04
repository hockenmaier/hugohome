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

## Publishing to hockenworks.com

Run `./deploy.sh`, or run its commands individually for more control: `hugo`,
then in `public/`: `git add --all`, `git commit`, `git push origin gh-pages
--force`.

### Fresh content isn't showing up

If new content isn't on hockenworks.com, or you `cd public` and see it isn't on
the `gh-pages` branch:

1. Remove the `/public` folder, or run `hugo --cleanDestinationDir` (same effect
   as deleting `public` and rebuilding).
2. `git worktree list` — you'll see something like
   `…/projects/hugohome/public  1234abcd [gh-pages]`.
3. `git worktree prune` to remove the stale worktree record.
4. `git worktree add public gh-pages` to re-add it fresh.
5. `hugo` in the root directory to recreate `/public`.

### Cloudflare SSL/DNS error after publishing

Check GitHub Pages. If DNS clears but there's a TLS error saying something like
"1 out of 3, attempting again in 15 minutes": go to Cloudflare → hockenworks →
DNS settings, **turn off the proxy for ~15 minutes**, and check whether the TLS
clears on GitHub Pages. Then turn the proxies back on.

## Publishing to Substack

Use the **`cross-post-to-substack`** skill for the mechanics (it copies the live
article body into a fresh Substack draft and stops there for review).

What goes across:

- **Build post** — copy the whole snippet including images, and link the
  hockenworks logo back to the post URL.
- **Writing post** (or a particularly wordy build post that suits Substack —
  use judgement) — copy just the linkback logo, a few places around the article.
  Change any links to other articles back to hockenworks.com links.

Snippets for both live at `https://hockenworks.com/substack-snippets/`.

**Rationale:** builds are full of things that might not work on a blog-only
platform like Substack. This is already true of "This website", "Raspberry Pi
Control Panel" (which hilariously rotates Substack), and "GPT4 solar system",
and it already misses more intricate image layouts, which are more common in
build posts. Since Substack is a blogging platform, blog content lives there in
full and everything else is hockenworks-only.
