# Performer photograph and Manan beneficiary fix

## Implemented

Sairam Dave's actual photograph is saved as
`apps/web/public/assets/ayambil/sairam-dave-portrait.webp` (30,496 bytes,
683 × 1024 pixels). Source: https://sairamdave.com/about/; source image
https://sairamdave.com/wp-content/uploads/2025/10/about-journey-img-683x1024.webp.
The downloaded image was visually inspected and depicts Sairam Dave. The shared
PerformerPortrait component now renders it as an actual img on the landing-page
performer card, registration-choice card and Sairam's dedicated page. It is local,
not hotlinked. Source attribution is recorded here; no independent reuse licence
or organiser approval of this specific online asset is claimed.

Manan Sanghvi's actual portrait remains missing. Repository/public asset searches
found none; the supplied posters contain religious illustrations, not his photo.
His Saregama artist page resolves its image to `/resources/images/art_default/style-8.jpg`,
a generic default which was not used. No unrelated face or generated portrait was
substituted. Required asset: an approved Manan Sanghvi portrait, preferably named
`apps/web/public/assets/ayambil/manan-sanghvi-portrait.webp`; set the Day 01
programme's `portrait` field to that local URL after the supplied photo is verified.
The actual music-note/MS placeholder was removed and replaced with a clearly
labelled, portrait-proportioned image slot. This task is not fully complete while
that photograph remains missing.

Manan's beneficiary panel is displayed in his landing-page highlight,
registration-choice card and dedicated page, and his pass default credits:
- પ.પૂ.આ. શ્રી વિરાગચંદ્રસાગરસૂરી મ.ની પવિત્ર પ્રેરણાથી
- સંસારી માતા-પિતા: શ્રીમતી મીનાબેન કિરણજી પાલેરિયા
- સંસારી ભાઈ-ભાભી: રાજુભાઈ – પ્રિયાબેન

These are the user's explicitly supplied spellings for the Day 01 evening panel.
The original poster was reviewed in the preceding task; its small name text should
receive a final organiser spelling check before publication. Day 01 credits are
not assigned to Day 02. Existing saved credit snapshots retain precedence.

## Changed files

- `apps/web/src/components/AyambilEventDetails.jsx`: real-image branch, labelled
  missing-photo slot, reusable Manan-only beneficiary panel.
- `apps/web/src/lib/ayambilProgramme.js`: Sairam portrait URL and source.
- `apps/web/src/lib/ayambilOfficialCredits.js`: Manan evening beneficiary details.
- `apps/web/src/lib/ayambilPassPresentation.js`: Manan-specific pass credits.
- `apps/web/src/pages/AyambilPage.jsx` and `AyambilEveningPage.jsx`: correct panel
  placement for Manan only.
- `apps/web/src/pages/AyambilPage.css`: consistent portrait frames, cover sizing,
  face-aware object positioning and mobile dimensions; beneficiary panel styling.
- `apps/web/tests/ayambilPassPresentation.test.js`: correct Manan credits and
  separation from Sairam's families.
- `apps/web/public/assets/ayambil/sairam-dave-portrait.webp`: actual portrait asset.

## Verification

Frontend lint, 19 frontend tests and Vite production build passed. The downloaded
Sairam asset itself was visually inspected with the image viewer. The source code
and production build confirm the shared image branch is wired into the pages;
that is not browser visual verification.

The previously recorded saved permission block for the localhost browser preview
has not been cleared. Actual webpage, desktop/mobile screenshots and visible
in-browser photo rendering remain unverified. No alternate browser workaround was
attempted. Clear the saved browser permission block to finish those checks.

No pass export dimensions, PDF library, backend security, registration flags,
production configuration, DNS, hosting or WhatsApp sending were changed.
