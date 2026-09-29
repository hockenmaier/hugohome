---
name: cross-post-to-substack
description: >-
  Cross-post the latest deployed hockenworks.com article to Substack as a draft.
  Use when the user says things like "cross-post to substack", "post my latest
  article to substack", "put the new article on substack", or right after running
  ./deploy.sh. Copies the live article's full body (text + images) into a new
  Substack Article draft, sets the title, and stops at the draft for the user to
  review and publish.
---

# Cross-post the latest article to Substack

This automates the manual cross-post the user used to do by hand:
deploy → wait for the new article on the homepage → open it → copy the full
content → paste into a new Substack post.

It drives the browser via the **Claude-in-Chrome** extension (`mcp__Claude_in_Chrome__*`).
The technique below was recorded live from the user's actual workflow and verified
end-to-end (title + full body with all images came across cleanly).

## Preconditions

- The article is already **deployed and live** (the user runs `./deploy.sh` first).
  This skill does NOT deploy — it assumes the new post is already on hockenworks.com.
- The Chrome extension is connected (`list_connected_browsers` returns a browser).
- The user is already **logged into Substack** (publication: `brianhockenmaier.substack.com`).

## Key facts (recorded from the live site)

- The article body on hockenworks.com lives in `#paige-content` (a `<main>`).
  The page also has `#paige-page-header` (title/tags/date/TOC) and
  `#paige-page-footer` (prev-next nav + subscribe box) — **do NOT copy those**.
- **Start at the text after the table of contents.** The TOC is `#paige-toc`
  (a.k.a. `#TableOfContents`) and lives *inside the header*, NOT in
  `#paige-content`. So selecting `#paige-content` already begins at the first real
  paragraph (e.g. "When a new AI model comes out…") and excludes the TOC. Verified:
  `#paige-content` contains no TOC list. Never widen the selection past
  `#paige-content` or the TOC will leak in.
- The article title is the page's `<h1>`.
- Substack: **Create ▸ Article** opens a fresh, auto-saving draft at
  `https://brianhockenmaier.substack.com/publish/post/{id}` with a separate
  **Title** field, **Subtitle** field, author tag, and body ("Start writing…").

## Procedure

Run these as `mcp__Claude_in_Chrome__*` calls. Batch where possible with `browser_batch`.

### 1. Find the article to cross-post

Unless the user gives a specific URL/slug:

1. Create a tab and `navigate` to `https://hockenworks.com`.
2. The newest post is the first entry under the **"Latest"** heading. It is normally
   dated **today**. Read it with `get_page_text` or a screenshot and confirm the date
   looks current. Click its title to open the article.
3. Confirm you landed on a single article page (URL like
   `https://hockenworks.com/<slug>/`). Capture the slug and the `<h1>` title — you'll
   reuse the title in Substack.

If the user named a specific article, navigate straight to
`https://hockenworks.com/<slug>/` instead.

### 2. Select and copy the clean body

On the article tab, set a DOM selection over `#paige-content`, then copy with a **real
Ctrl+C keystroke** (programmatic `execCommand('copy')` is blocked without a user
gesture, but the keystroke counts as one and copies rich HTML + images to the OS
clipboard):

```js
// javascript_tool on the hockenworks tab
const content = document.querySelector('#paige-content');
const range = document.createRange();
range.selectNodeContents(content);
const sel = window.getSelection();
sel.removeAllRanges();
sel.addRange(range);
JSON.stringify({
  chars: sel.toString().length,
  imgs: content.querySelectorAll('img').length,
  title: document.querySelector('h1').innerText
});
```

Then, **on the same tab** (it must be the focused tab):

```
computer { action: "key", text: "ctrl+c" }
```

Sanity check the returned `chars`/`imgs` are non-zero before moving on.

### 3. Open a new Substack Article draft

1. In a **separate tab**, `navigate` to `https://substack.com/home`.
2. Click the orange **Create** button (left sidebar) → **Article** in the dropdown.
   This opens the editor at `…/publish/post/{id}` with an empty Title and body.
   - Faster alternative: `navigate` directly to
     `https://brianhockenmaier.substack.com/publish?type=newsletter` (opens a new draft),
     but the Create ▸ Article path is the verified one.

### 4. Paste the body

1. Click into the body ("Start writing…", roughly center-left under the author tag).
2. Press **Ctrl+V**.
3. Wait ~4s — Substack re-uploads the pasted images to its own CDN; this takes a moment.
4. Screenshot and confirm the body filled in and images rendered (not broken).

### 5. Set the title

1. Scroll to the top of the editor (the **Title** field sits above the body).
2. Click the Title field and `type` the article's `<h1>` text (from step 2).
3. Leave the **Subtitle** blank unless the user wants one. (The site doesn't carry a
   subtitle into this flow; ask the user if they'd like one generated from the article's
   intro.)

### 6. Add the hockenworks link-back image at the bottom

Every cross-post ends with the **"read and play this post on hockenworks"** banner
image, linked back to the original hockenworks article. The source is the
**Substack Snippet Builder** page, which renders one snippet per post, newest-first:
`https://hockenworks.com/substack-snippets/`.

Each post's link-back block looks like this (note the URLs are **relative**):

```html
<div class="linkback-image" id="linkback-content">
  <a href="/<slug>/"><img src="/images/hockenworks-linkback.png" alt="Link back to post"></a>
</div>
```

The banner image asset is `https://hockenworks.com/images/hockenworks-linkback.png`.

Steps:

1. In a tab, `navigate` to `https://hockenworks.com/substack-snippets/`. The post being
   cross-posted is normally the **top** block (newest-first). The page has a
   **"Copy LinkBack"** button per post, but only the topmost one is actually wired up
   (the buttons share a duplicate `id`), which conveniently is the newest post.
2. Copy the link-back block **with absolute URLs** so the link survives being pasted onto
   substack.com. Do NOT rely on the page's relative `/…` URLs (they'd resolve against
   substack.com and break). Rewrite them to absolute first, then select + real Ctrl+C:

   ```js
   // javascript_tool on the substack-snippets tab. Set slug to the article being posted.
   const slug = '/ai-can-3d-model/';
   const blocks = [...document.querySelectorAll('#linkback-content, .linkback-image')];
   const block = blocks.find(b => b.querySelector(`a[href*="${slug}"]`)) || blocks[0];
   block.querySelectorAll('a[href]').forEach(a => a.href = new URL(a.getAttribute('href'), 'https://hockenworks.com').href);
   block.querySelectorAll('img[src]').forEach(i => i.src = new URL(i.getAttribute('src'), 'https://hockenworks.com').href);
   const range = document.createRange(); range.selectNodeContents(block);
   const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
   JSON.stringify({ href: block.querySelector('a')?.href, img: block.querySelector('img')?.src });
   ```
   Confirm the returned `href` is `https://hockenworks.com/<slug>/` and `img` is the
   absolute `…/images/hockenworks-linkback.png`. Then, on that focused tab:
   `computer { action: "key", text: "ctrl+c" }`.
3. Back in the Substack draft, click at the **very end of the body** (below the last
   paragraph), press Enter for a fresh line, then Ctrl+V to paste the banner.
4. **Verify the link.** Click the pasted image and confirm it links to
   `https://hockenworks.com/<slug>/`. If Substack dropped the link or kept it relative,
   add it manually: select the image, open the editor's link control, and set the URL to
   the full `https://hockenworks.com/<slug>/`.

### 7. Stop at the draft — do NOT publish

Publishing is public, outward-facing content. **Always stop here.** Substack auto-saves
("Saved" indicator, top-left). Report the draft URL
(`https://brianhockenmaier.substack.com/publish/post/{id}`) and let the user review,
choose section/audience, and click **Publish** themselves — or only publish if they
explicitly tell you to in chat.

## Verification checklist

- [ ] Title matches the article's `<h1>`.
- [ ] Body starts at the real first paragraph (no title/TOC/tags duplicated at top).
- [ ] All images rendered in the Substack body (compare image count to step 2's `imgs`).
- [ ] No homepage nav / "Subscribe" footer / prev-next links pasted at the end.
- [ ] The "read and play this post on hockenworks" link-back banner is at the **very
      bottom** of the post.
- [ ] That banner image links to the absolute `https://hockenworks.com/<slug>/` of this
      exact article (not relative, not a different/older post).

## Troubleshooting

- **Paste landed but images are broken / missing.** Substack occasionally fails to
  import a hot-linked image. Re-copy (step 2) and re-paste, or insert the missing
  image manually via the editor's image button using the `https://hockenworks.com/...`
  source URL.
- **Ctrl+C copied nothing.** The article tab must be the *focused* tab when you send
  the keystroke, and the selection must be set first (step 2). Re-run the JS selection
  immediately before the Ctrl+C.
- **Wrong/old article.** The "Latest" list is newest-first; if the top item isn't dated
  today the deploy may not have propagated yet — reload hockenworks.com after a minute,
  or ask the user for the slug.
- **Link-back banner pasted but not clickable / links to the wrong place.** Substack
  sometimes strips the `<a>` wrapper from a pasted image. Fix it manually: click the
  banner image, open the link control, and set it to `https://hockenworks.com/<slug>/`.
  This is why step 6 absolutizes the URL before copying — relative `/<slug>/` hrefs
  resolve against substack.com and 404.
- **Optional (SEO):** to avoid duplicate-content penalties you can set the Substack
  post's canonical URL to the hockenworks original under post Settings. Not part of the
  user's manual flow — only do this if asked.
