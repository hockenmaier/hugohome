# Shared browser work for Hockenworks cross-posts

These are repository instructions for any agent working in hugohome. Use the
browser, clipboard, and computer-use tools available in that agent's environment;
no particular client, plugin, extension, or tool identifier is required. Follow
those tools' own access rules and supported interaction methods.

## Session and controls

Use Brian's existing signed-in session for the intended platform/account. Keep
source and destination tabs in one browser session when possible. Inspect current
visible controls and use their labels or observed positions. If a required
capability or login is missing, identify that step and continue independent
preparation; do not treat a missing tool as successful completion.

## Rich content transfer

Copy the selected live rendered content, preserving HTML, images, captions,
formatting, and links. Prefer the source page's copy controls or supported rich
selection and normal copy/paste. For a body without a copy control, use supported
rendered-content selection.

If the available tools support rendered DOM reads and a rich clipboard write,
read the rendered HTML/text, normalize relative URLs in the clipboard payload
outside the source page, and write both HTML and plain-text clipboard formats.
Paste through the editor UI. Respect read-only browser operations; do not use
unsupported page-script mutations to create a selection or rewrite the DOM.

An operating-system clipboard and a browser's virtual clipboard may be separate.
A source "Copied!" indicator alone does not prove that rich data reached the
clipboard used by the destination. Verify the actual paste, or a supported
clipboard payload inspection, before claiming transfer success. Keep rich HTML
and images intact; do not silently fall back to a plain-text article.

## Visual verification and handoff

Wait for image imports and link previews to finish. Compare the actual editor
with the selected source and the platform-specific checks. Capture the finished
preview/composer when supported. Report any remaining limitation precisely.

Leave Substack, Twitter/X, and LinkedIn at manual submission. Save drafts where
the platform offers that option, and keep filled composer pages open otherwise.
Use the agent's supported tab-retention or handoff mechanism; if it has none,
leave the browser open and return the page URL and remaining action. Clearly
identify unsaved composers that depend on the open tab. Preserve existing draft
URLs and completion state so a retry does not create duplicates.
