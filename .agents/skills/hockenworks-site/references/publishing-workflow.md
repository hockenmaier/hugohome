# Publish an article and prepare external drafts

## Scope and inputs

A request to "publish this article" authorizes publication on Hockenworks now,
including committing the intended source changes, merging the article feature
branch into `master`, pushing the source, building, and deploying `gh-pages`.
It then calls for Substack, Twitter/X, and LinkedIn drafts with open browser
composers that Brian submits manually. It does not authorize their final
Publish/Post/Send clicks.

Resolve the specific article bundle, title, intended public URL, and featured
media. Do not choose whichever article happens to be newest. If several
articles share a branch, promote only those requested; the others remain
unlisted previews even when their source is merged with the branch.

Ask Brian early for the exact one- or two-sentence announcement to use on
Twitter/X and LinkedIn. Do not invent that copy. Missing social text or one
platform's login should not hold up independent Hockenworks publication.

## Prepare and merge the source

1. Inspect the branch, source changes, and `public/` worktree. Preserve unrelated
   edits, theme changes, and generated output. Stage intended source paths
   explicitly because this repository has legacy tracked files under `public/`.
2. Promote the specified preview: remove its `/preview/` URL override (or set the
   intended public URL), remove `_build.list: never`, and clear any draft/future
   publish restriction. Remove its entry from `content/previews.md`. Keep the
   article's date unless Brian requests a change; do not claim every post must
   be dated today. Preserve old preview links with an alias redirect to the
   public article, and check that a stale generated preview cannot shadow it.
3. Resolve the featured image from the front matter or actual first media using
   the site's templates. Check the page-bundle asset URL at its new public path.
   If the feature is an iframe with no usable image, or a video with no known
   share image, obtain a still image from Brian rather than substituting unrelated
   artwork. This is a real missing publishing input.
4. Build into a temporary destination with the production base URL and without
   draft/future flags. Check the public page, internal links, assets, homepage
   listing/summary, and featured image. Correct material problems before merging.
5. Commit the intended source work on its feature branch. Fetch the remote;
   update `master` without resetting unrelated changes, merge the article branch,
   and push `master`. Resolve routine conflicts using the intended content and
   preserve Brian's edits. Do not silently include unrelated staged files or
   overwrite divergent remote history.

## Deploy and wait for the live version

1. Confirm `public/` is a distinct valid Git worktree on `gh-pages`. Check its
   existing changes before building so another deployment's work is preserved.
2. Build/deploy using the repository's `deploy.sh` or its commands with explicit
   result checks. The output must use `https://hockenworks.com/`, never localhost.
   If generated files from the old preview path remain, remove only the verified
   stale article output while preserving `.git` and unrelated deployment files.
3. Verify the source push and `gh-pages` push succeeded. A local build or push
   success alone does not prove the public article is live.
4. Open the exact public article and homepage in the browser. Reload with brief,
   spaced checks while GitHub Pages/CDN catches up; allow up to about ten minutes
   before switching to deployment diagnosis. Keep waits short enough to provide
   progress updates. Do not repeatedly push unchanged builds during propagation.
5. Compare the live title and distinctive passages with the intended source
   version. Check that the main text, headings, images, and key embeds render
   without major problems. Confirm the homepage list contains this article at
   the position implied by its date and shows the intended featured image.
6. Read the live social metadata and verify the featured image URL loads and is
   the intended asset. Check the actual link card when each social composer opens.
   The same featured image should be used across platforms; no separate upload is
   needed where the link card supplies it correctly.

Begin cross-posting only after this live check passes. If propagation times out
or a material rendering problem remains, preserve the work, report the specific
failure, and resume from live verification after repair.

## Prepare drafts and hand off

Use the Browser/Chrome skills for website computer use and the signed-in browser
that serves this task. Follow their current supported APIs, clipboard, screenshot,
login, and tab-handoff guidance. Use Windows Computer Use when native UI work is
required and permitted by those skills. Do not reuse obsolete Claude-in-Chrome
commands from historical instructions.

- Follow [cross-post-to-substack](../../cross-post-to-substack/SKILL.md): choose
  a build stub or full narrative, copy the live rendered content with formatting,
  check images and Hockenworks link-back banners, and prepare email delivery.
- Follow [cross-post-to-social](../../cross-post-to-social/SKILL.md): prepare
  Twitter/X and LinkedIn with Brian's supplied text and the public article link.
- Leave each composer saved/open as close to manual submission as that platform
  supports. Do not claim an unsaved composer is a durable draft. Preserve the
  tabs using the selected browser's supported handoff/deliverable mechanism.
- Record the article URL, deployed source revision, chosen Substack mode, draft
  URLs/tab handles, and completion state for each platform in the chat. On a
  retry, inspect/reuse existing drafts and live URLs before creating another.
- If one external platform is blocked, continue independent drafts on the others,
  retain the blocked step, and report what Brian needs to finish. Never treat a
  failure as permission to publish, send an email, or recreate already-made posts.

Return the live Hockenworks link and direct draft/composer links or retained tabs.
Briefly list any remaining manual action, including Substack's final email send.
