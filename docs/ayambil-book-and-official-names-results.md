# Programme photographs and official credits

## Files changed

- `apps/web/src/lib/ayambilOfficialCredits.js`: invitation organisers and inviting
  organisations, plus the Day 02 book reference. Separate entries, no sponsor labels.
- `apps/web/src/components/AyambilBookProgramme.jsx`: bilingual, newly written
  source-inspired programme introduction; contained/tappable supplied photographs;
  separate beneficiary, organiser and inviting-organisation panels.
- `apps/web/public/assets/ayambil/book-page-8.jpeg` and `book-page-9.jpeg`: copies of
  the two supplied photographs, separate from the six untouched event artworks.
- `apps/web/src/pages/AyambilPage.jsx`: English primary event heading with prominent
  Gujarati name, evening highlights/book section, venue then registration/terms.
  Existing three-day programme and six-image brochure remain accessible.
- `apps/web/src/pages/AyambilEveningPage.jsx`: consistent identity; source section
  on Sairam's page only. Manan's separate programme is preserved.
- `apps/web/src/components/AyambilEventDetails.jsx`: removes visible Vijayollas
  footer branding while preserving existing navigation and exact Maps URLs.
- `apps/web/src/lib/ayambilPassPresentation.js`: date-specific beneficiary defaults,
  common invitation organisers/inviters and revised eight bilingual pass rules.
- `apps/web/src/components/AyambilDigitalPass.jsx`: attendee/name-number precede
  programme, date-specific credits; removes duplicated credits from terms panel.
- `apps/web/src/components/AyambilDigitalPass.css` and
  `apps/web/src/pages/AyambilPage.css`: prominent Gujarati programme titles,
  editorial photo grid, stacked mobile credits/photos and compact PDF credit columns.
- `apps/web/tests/ayambilPassPresentation.test.js`: checks date-specific credit
  separation and saved credit precedence.

## Source-derived copy

Both supplied pages have the running header “માતૃપૂજા”. Readable themes include
attachment to homeland, language and family; preserving culture and values;
gratitude towards roots; and respect for people protecting the country. The new
Gujarati introduction summarises these themes in everyday language. The English
paragraph summarises that introduction. Neither paragraph is labelled as a quote.
The photographs are presented intact, not cropped or replaced. No author identity
was inferred from the book photographs; the religious reference comes from Day 02.

## Poster spelling differences requiring acknowledgement before publication

The original Day 02 and main invitation display the second family as
“શ્રી રંતાબેન બસ્તીમલજી પાલેરિયા પરિવાર (પુના)”, whereas the typed request says
“શ્રી રમાબેન …”. The source-based local configuration uses રંતાબેન and retains
the shown શ્રી honorific. Please confirm this difference before publication.

The first family is “શ્રીમતી મીનાક્ષીબેન રસિકલાલ શાહ પરિવાર (વડગામ)”. The book
reference reads “પૂ.આ.શ્રી હેમચંદ્રસાગરસૂરિ મ. લિખિત ‘માતૃપૂજા પુસ્તક’”, rather
than the typed “માતૃપૂજન પુસ્તક”. No unverified quotation was added.

Inviters are stored separately:
- શ્રી પો. ડે. જૈનનગર જૈન સંઘ, પાલડી
- શ્રી વર્ધમાન જૈન શ્વેતાંબર મૂર્તિપૂજક સંઘ, ઉસ્માનપુરા
- શ્રીમતી શીલાબેન નિર્મલકુમાર શાંતિકુમાર ચોકસી પરિવાર

The two organiser families are used as Sairam evening beneficiaries only, as shown
on Day 02. Manan's evening beneficiary names remain awaiting exact confirmation;
the Sairam beneficiaries are NOT assigned to Manan's pass. The common invitation
organisers/inviters apply to both. Saved approved credit snapshots take precedence.

## Tests actually executed

- Frontend lint passed.
- Frontend unit tests: 19 passed.
- Supabase local regression: four suites passed, including 49 reported assertions.
- Disposable local PocketBase integration: 52 checks passed, including maximum two
  attendees, rejection of a third by API, unique saved passes, retries, private
  downloads, cancellation/reissue and authorization. Provider calls mocked.
- Deno Edge Function type check passed (existing workspace warning).
- Vite production build passed (2325 modules).

## Incomplete visual checks

The saved browser permission block documented in the preceding task remains
unresolved. No workaround or alternate browser automation was used. New Manan and
Sairam PDFs were not generated or visually inspected in this run; browser download,
print, native print dialog and 360/390/430px screenshot/overflow checks remain
unverified. The export code still specifies one portrait A4 page, 210 × 297mm;
actual page fit, Gujarati glyphs and terms readability must be checked after the
saved localhost browser block is cleared. Physical printing is unverified.

Production settings, backend data, migration history, DNS, hosting, credentials,
registration flags and WhatsApp flags were untouched. No real message was sent.
No QR, barcode, verification/check-in or payment feature was added.
