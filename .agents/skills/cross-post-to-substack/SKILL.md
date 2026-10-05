---
name: cross-post-to-substack
description: >-
  Prepare a Substack email draft from a verified live Hockenworks article.
  Copy full rendered narrative articles or the rendered build stub from
  substack-snippets, preserve formatting and linked Hockenworks banners,
  use the same featured image, and leave the saved composer for manual submission.
  Use for explicit Hockenworks-to-Substack requests or the Substack drafting step
  of the hockenworks-site workflow. This skill does not deploy the site or prepare
  Twitter/X or LinkedIn posts.
---

# Prepare a Hockenworks Substack draft

Publication: `https://brianhockenmaier.substack.com/`.
Source snippet builder: `https://hockenworks.com/substack-snippets/`.
Link-back banner asset: `https://hockenworks.com/images/hockenworks-linkback.png`.

When invoked by the site publishing workflow, use its verified public article
URL and completed live check. For a standalone Substack request, verify the
specified already-live article directly; do not invoke the publishing workflow
or redeploy the site. If the article is still an unlisted preview, report that
it needs publication first. Do not guess from today's date/newest homepage item.

## Decide between the full article and a build stub

Read the actual article; its taxonomy is a useful hint, not the only criterion.

- **Stub:** articles whose value includes live-hosted code, playable content,
  iframe embeds, or other substantial interactions that cannot carry over to
  Substack. Also use a stub for mostly images and discussion of an actual build
  with little narrative. The game-dev article with Little Voyager is a stub.
- **Full article:** long-form writing or substantial narrative whose content can
  display meaningfully on Substack. A narrative-heavy build may qualify even if
  its Hockenworks category is `builds`. Ordinary pictures or a YouTube video do
  not automatically force a stub; evaluate the reader's experience.

Make this judgment without asking Brian to classify routine posts. Follow an
explicit per-article instruction when he provides one. Record the chosen mode.
Do not change the article's Hugo category merely to select a Substack mode.

## Browser and formatted transfer

Follow [the shared browser workflow](../hockenworks-site/references/browser-workflow.md)
using the tools available to the current agent. Copy live rendered HTML, text,
links, and images and paste as rich content. Do not rebuild the body from raw
Markdown or replace the formatted body with plain text. Verify the actual paste,
including imported images, before continuing.

## Stub source

1. Open the live snippet builder through computer use. Locate the block whose
   title/link matches the exact public article; do not blindly take the first.
   Current blocks use `.substack-snippet`, `.post-summary`, and `.linkback-image`.
2. Copy its opening summary text followed by the Hockenworks logo/banner block.
   This short stub is the entire Substack body. Keep its links and formatting;
   do not append the rest of the article or its interactive iframe.
3. The current "Copy All" button copies a larger `.copy-content` block including
   the media column and reading-time text. Select/extract `.post-summary` and
   `.linkback-image` together when that larger payload differs from Brian's
   requested text-then-banner stub. "Copy LinkBack" copies only the banner.
4. Set the separate draft title to the article title. Use the article's exact
   featured image for the Substack preview/cover, even though the stub body ends
   in the distinct Hockenworks link-back banner.

## Full-article source

1. Open the verified public Hockenworks article. Copy the complete rendered
   article body, including images, captions, headings, lists, and links. The
   body is `#paige-content`; the title is the page's `<h1>`.
2. Keep the title for Substack's separate title field. Exclude site navigation,
   tags/date/TOC, prev-next navigation, subscribe widgets, and Ball Machine UI.
   Copying the whole article does not mean copying those surrounding controls.
3. Paste the rich body and wait for Substack's image imports to complete.
4. Preserve existing Hockenworks-labelled banners. If absent, get the exact
   article's linked banner from the snippet builder and add it at the bottom.
   For a long article, place occasional additional banners between major
   sections, without duplicating ones already present. Use judgment about spacing.
5. Resolve internal article links and asset URLs to absolute Hockenworks URLs.
   Every Hockenworks-labelled image/banner, wherever it appears, must link to
   this exact public article, including in the resulting email. Ordinary
   illustrations retain their intended links.

## Draft, featured image, and email settings

Reuse a previously-created draft for this article when resuming; check the
publication's drafts/current handoff before creating a duplicate. In the
signed-in publication UI, create an Article draft and paste into its body. Use
observed controls; the historical entry point is Create > Article and editor
URLs resemble `https://brianhockenmaier.substack.com/publish/post/{id}`.

- Match the Hockenworks title exactly. Leave the subtitle blank unless supplied.
- Use the identical featured image from the verified Hockenworks article for
  Substack's cover/social preview. If Substack picks the logo/banner instead,
  correct the preview image. A correct visible card is sufficient evidence when
  it automatically selects the intended image. Do not invent replacement art.
- All posts are intended to send email. Prepare the draft/send options for email
  delivery; never silently choose web-only publication. Preserve established
  audience/section defaults, and ask only if a required choice has no clear
  existing default. Keep existing free-access settings; do not introduce paywalls.
- Do not set a canonical URL or generate extra copy unless Brian requests it.
- If email options only appear later in a publishing flow, advance only through
  clearly non-submitting steps. Leave the final Publish/Send click to Brian and
  explicitly identify any email checkbox still requiring his action.

## Verify the actual draft

Compare source and pasted draft visually with the available screenshot/preview
tools. Check meaningful content rather than requiring pixel-identical CSS.

- Title, opening, ending, paragraph order, headings, lists, emphasis, and captions
  survived. A full article contains all intended sections; a stub contains only
  the selected opening text and linked banner.
- All intended images finish importing and render without broken placeholders;
  compare their count/order with the selected source, including added banners.
- No source-page navigation, TOC, tags, subscription form, or game UI leaked in.
- Every Hockenworks-labelled banner links to the exact absolute public article
  URL. Inspect the image's link in the editor; repair wrappers lost during paste.
  Check the email preview when available to verify links survive there too.
- The preview/featured image matches Hockenworks and email delivery is prepared.
- The editor indicates the draft is saved. Reopen/refresh the saved draft if
  needed to confirm persistence; do not refresh an unsaved composer.

Repair missing images or broken links before reporting success. For images that
fail to import, retry that image using the editor's image UI and the original
Hockenworks asset. Report any platform limitation accurately.

Leave the saved draft open, preserving its tab through the browser's supported
handoff/deliverable mechanism. Return its direct URL and remaining manual submit
step. Never click final Publish/Send as part of this workflow. Only a later,
explicit instruction changing this submission scope can authorize that action.
