# Vrijweg delivery rules

These rules are mandatory for every future change to this project.

## Mobile-first acceptance gate

- The primary target device is Luc's Samsung Galaxy S24 Ultra (SM-S928B), used through an Android browser or in-app webview.
- Never call a version tested or ready based only on a desktop build, desktop screenshot, source inspection, or successful compilation.
- Before every publication, test the complete changed flow at a 393 CSS-pixel mobile viewport and a second narrow viewport of 360 CSS pixels.
- Measure geometry; do not judge it only by eye. Assert that no content, dialog, footer, button, map control, or navigation item crosses the viewport edges.
- Modal acceptance at 393 CSS pixels: 12 CSS pixels left margin, 369 CSS pixels width, 12 CSS pixels right margin. The content must scroll vertically inside the viewport and its footer actions must remain reachable.
- Verify `device-width`, `initial-scale=1`, safe-area handling, `100dvh`, and touch targets of at least 44 CSS pixels where practical.
- Inspect computed `transform` and the individual CSS `translate` property. Tailwind v4 translation utilities and a custom `transform` must never both reposition the same dialog.
- Test Android browser/webview behavior and external handoffs separately: Google Maps directions, Street View, location permission, sharing, calling, microphone, and notifications.
- Reopen the live production URL on the target phone after publication. Browser or favicon caching must not be mistaken for a successful update.

## Regression from 30 August 2026

The toilet-details dialog was shifted half a screen left on the S24 Ultra. Root cause: Tailwind's individual `translate` property combined with Vrijweg's custom `transform`, applying two 50% shifts. The permanent safeguards are:

- no `translate-x-[-50%]` or `translate-y-[-50%]` utilities on `DialogContent`;
- `[data-slot="dialog-content"] { translate: none !important; }`;
- explicit mobile viewport metadata;
- a measured mobile regression check before delivery.

If the mobile acceptance gate cannot be run, report that limitation and do not state that the mobile version has been fully verified.
