# Feature Specification: Bells Corners — The Expedition Page

**Feature Branch**: `003-editorial-expedition-page`

**Created**: 2026-08-21

**Status**: Draft

**Input**: User description: "Let's get rid of the dial functionality. I want to emulate a national geographic website instead: https://www.nationalgeographic.com/expeditions/destinations/asia/signature/vietnam-laos-cambodia-cultural-conservation-journey/"

## Pivot Summary

This specification **supersedes** `specs/002-radio-dial-tour/spec.md`, which in turn
superseded `specs/001-bells-corners-tour/spec.md`. The audience, the subject, and the goal
are unchanged across all three: six co-workers who know only downtown Ottawa are given a
short, memorable tour of Bells Corners, and it must knock them off their feet.

What changes:

| Removed from 002 | Replaced with |
| --- | --- |
| The radio dial and its band of stations | A long-form **expedition page** read by scrolling |
| Tuning, static, and lock-in as the mechanic | **Editorial craft** — photography, typographic scale, and pacing |
| Received/unreceived progress and the sign-off keepsake | Nothing: the page is **read**, not played |
| Optional synthesised sound | Nothing: the page is silent |
| The dial as the route | A **stylised, illustrated route line** with the seven stops marked |

### The Concept

An expedition brochure for a place nobody would think to run an expedition to.

The page borrows the register of a premium travel itinerary — the kind that presents a
journey as something considered and worth taking: a full-bleed opening photograph, a title
with room to breathe, a short factual strip (how long, how far, how many stops), an
overview that frames the destination for someone who has never been, a drawn route, and
then the journey itself as numbered stops, each with its own headline, photograph, and
story.

The joke and the affection both live in that gap: the format says *expedition to the far
side of the world*, the content says *the strip mall on Robertson Road where I spent my
allowance*. Played completely straight, the format takes an ordinary suburb seriously —
which is exactly what the author feels about it.

The wow is no longer a mechanic. It is the photography at scale, the confidence of the
typography, and the pacing of the scroll.

## Clarifications

### Session 2026-08-21

- Q: Does any interactive mechanic survive, or is this now a page you simply read? → A:
  **Pure editorial, read-only.** No unlocking, no progress tracking, no keepsake. The wow
  comes from photography, typography, scale, and scroll craft.
- Q: How should the seven Bells Corners places be organised on the page? → A: **Numbered
  itinerary entries, Stop 1 through Stop 6**, each with a headline, image, and story, the
  way an expedition itinerary presents days.
- Q: Does the route map come back, given it was removed in the previous pivot? → A: **Yes
  — a stylised, illustrated route line** with the seven stops marked. Decorative and
  editorial, **not** an interactive geographic map: no map library and no tile provider,
  preserving the zero-cost, no-API-key constraint.
- Q: What should happen to the dial implementation built for 002? → A: **Delete it**,
  exactly as 001's camera and map implementation was deleted when 002 superseded it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the Expedition (Priority: P1)

A co-worker opens the link on their phone. A full-bleed photograph fills the screen with
the expedition's title over it and a single line saying what this is. Scrolling down, they
find a short strip of facts — how long the drive takes, how far it goes, how many stops —
then an overview that explains Bells Corners to someone whose Ottawa stops at the
Greenbelt. Below that, the route: a drawn line with seven marked stops. Then the journey
itself, one numbered stop after another, each with a headline, a photograph, the author's
first-person story, and where supplied, a "downtown translation" tying it to something
they already know. At the end, a closing note and the credits. They read it start to
finish in a few minutes, on one thumb, and nothing asks them to do anything but read.

**Why this priority**: This is the product. Without the hero, the overview, the route, the
seven stops, and the closing, there is no tour.

**Independent Test**: On a phone, open the link and scroll from top to bottom, confirming
every section is present, every stop shows its headline, image, story, and translation,
and no content is clipped or unreachable. Delivers the complete tour on its own.

**Acceptance Scenarios**:

1. **Given** a visitor opens the page on a phone in portrait, **When** it loads, **Then**
   they see a full-bleed opening image with the title legible over it, and no horizontal
   scrolling at any width down to 360 px.
2. **Given** the visitor scrolls past the opening, **When** they continue, **Then** they
   meet, in order: the facts strip, the overview, the route illustration, the seven stops in
   numbered order, the closing note, and the credits.
3. **Given** the visitor reaches a stop, **When** they read it, **Then** it shows its
   number, its headline, at least one image with a text alternative, the first-person
   story, and the downtown translation where the author supplied one.
4. **Given** the visitor is on a tablet, laptop, or in landscape, **When** the page
   renders, **Then** the layout adapts with no loss of content and no horizontal page
   scrolling.
5. **Given** an image fails to load, **When** the visitor reaches that stop, **Then** the
   headline, story, and translation still read correctly and the layout does not collapse.
6. **Given** the visitor uses a screen reader or keyboard only, **When** they move through
   the page, **Then** every section, image alternative, link, and control is reachable in
   a sensible order.
7. **Given** the visitor has no network after first load, **When** they scroll the page,
   **Then** every section and image is still there.

---

### User Story 2 - Be Wowed by the Craft (Priority: P2)

The page should feel commissioned rather than assembled. Photographs run to the full width
of the screen and are given room. The title carries real typographic weight. Sections
arrive with deliberate pacing as the visitor scrolls — image and text settling into place
rather than simply appearing. The route line draws itself as it comes into view, and the
seven stop markers land along it. Nothing is decorative at the cost of readable text, a
still page for anyone who prefers reduced motion, or the speed of a phone on mobile data.

**Why this priority**: "Knock them off their feet" is the stated goal, and with the
mechanic gone, the craft is the only thing carrying it. It depends on the content of P1
being in place first.

**Independent Test**: A first-time visitor on a phone sees full-bleed imagery, scroll-paced
section reveals, and the route drawing itself — and with reduced motion preferred, sees the
same page complete and still, with nothing missing.

**Acceptance Scenarios**:

1. **Given** the visitor scrolls into a new section, **When** it enters view, **Then** it
   settles into place within about half a second and is immediately readable.
2. **Given** the visitor scrolls to the route, **When** it enters view, **Then** the route
   line and its seven stop markers resolve into their finished state.
3. **Given** the visitor has a reduced-motion preference set, **When** they read the page,
   **Then** no scroll-triggered motion plays, every section is visible in its finished
   state, and no content depends on an animation having run.
4. **Given** the visitor is on a mid-range phone over a typical mobile connection, **When**
   they open the link, **Then** the opening image and title are readable quickly and
   scrolling stays smooth throughout.
5. **Given** any text sits over a photograph, **When** the visitor reads it in daylight,
   **Then** it remains legible against every part of the image behind it.

---

### User Story 3 - Find a Stop and Pass It On (Priority: P3)

A co-worker wants to get back to the stop about the plaza without scrolling for it, or
send that one stop to someone else. A persistent way to jump between stops is available on
larger screens, each stop can be linked to directly, and opening such a link lands on that
stop in the context of the whole page.

**Why this priority**: Makes a long page navigable and lets it travel further, at low risk.
It reuses all P1 content and adds no new content of its own.

**Independent Test**: Open a link to a single stop on another device and confirm it lands
on that stop within the full page; use the jump navigation to move between stops and
confirm each one is reached.

**Acceptance Scenarios**:

1. **Given** a link to a single stop, **When** it is opened on any device, **Then** the
   page lands on that stop with the rest of the expedition above and below it.
2. **Given** the visitor is on a screen wide enough to show it, **When** they use the stop
   navigation, **Then** they can move directly to any stop, and the navigation shows which
   stop they are currently in.
3. **Given** the visitor wants to share the page, **When** they look for a way to do so,
   **Then** the page offers a plain way to copy or share the link.

---

### Edge Cases

- **Very narrow phone (≈360 px) or large system font sizes**: nothing clipped, no
  horizontal scrolling, all text readable without zooming.
- **Text over photography**: legibility must hold regardless of what the photograph is
  doing behind it — including a bright sky exactly where the title sits.
- **A photograph is missing or fails to load**: that stop still reads completely.
- **Reduced-motion preference**: the page is complete and still; nothing is only visible
  after an animation.
- **Screen reader or keyboard only**: the route illustration is decorative and must be
  announced as such rather than read as meaningless text; every stop remains reachable.
- **Very long story text for one stop**: the layout absorbs it without breaking the rhythm
  of the page.
- **Connectivity drops mid-read**: the rest of the page and its images are still there.
- **Deep link to a stop that no longer exists**: the visitor lands on the page rather than
  on an error, and can carry on reading.
- **Printing or "reader mode"**: the stories remain readable as text.
- **Slow connection**: images load progressively without the page jumping around as they
  arrive.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST open with a full-bleed photograph carrying the expedition
  title and a single-line description of what this is.
- **FR-002**: The page MUST present a short strip of expedition facts — at minimum the
  duration, the distance, and the number of stops.
- **FR-003**: The page MUST include an overview that frames Bells Corners for an audience
  who knows only downtown Ottawa.
- **FR-004**: The page MUST include a stylised, illustrated route showing the seven stops in
  order along it. The route MUST be decorative: it MUST NOT be an interactive or
  geographic map, MUST NOT depend on any external map service, and MUST NOT be the only
  way to reach any content.
- **FR-005**: The page MUST present each place as a numbered itinerary stop, in route
  order, with a headline, at least one image, and a first-person story.
- **FR-006**: Each stop MUST show the author's "downtown translation" where one is
  supplied, relating the place to something familiar from the core.
- **FR-007**: The page MUST end with a closing note and a credits line for the imagery.
- **FR-008**: The page MUST be read-only: it MUST NOT track progress, unlock content,
  require any action to reveal a stop, or produce a keepsake.
- **FR-009**: The page MUST be silent: it MUST NOT play audio.
- **FR-010**: The page MUST be responsive: fully readable one-handed in portrait down to
  ≈360 px wide, adapting to tablet, desktop, and landscape, with no horizontal page
  scrolling at any supported width.
- **FR-011**: Sections MUST settle into place as the visitor scrolls to them, and the
  route MUST resolve into its finished state when it comes into view.
- **FR-012**: The page MUST honour a reduced-motion preference by presenting every section
  in its finished state with no scroll-triggered motion, losing no content.
- **FR-013**: Any text placed over imagery MUST remain legible against the full range of
  the image behind it.
- **FR-014**: Every stop MUST be directly linkable, and opening such a link MUST land on
  that stop within the full page.
- **FR-015**: On screens wide enough to carry it, the page MUST offer navigation between
  stops that indicates which stop the visitor is currently reading.
- **FR-016**: The page MUST offer a plain way to share or copy its link.
- **FR-017**: After first load, the page MUST work fully offline — every section and image
  — and connectivity loss MUST NOT show an error or block scrolling.
- **FR-018**: The page MUST NOT call any external or paid service at runtime and MUST be
  deployable with no server component and no secrets.
- **FR-019**: The page MUST meet baseline accessibility: readable contrast throughout,
  keyboard and screen-reader operable navigation and links, a meaningful text alternative
  for every photograph, and decorative artwork marked as decorative.
- **FR-020**: The page MUST NOT require an account, login, or personal information, MUST
  NOT collect the visitor's location, and MUST NOT send anything about the visitor
  anywhere.
- **FR-021**: The page MUST remain readable as plain text — with images absent — so that
  reader modes and printing produce the stories intact.
- **FR-022**: Any error the visitor can encounter MUST leave them on a readable page
  rather than on an error screen.

### Key Entities

- **Expedition**: The tour itself; has a title, a one-line description, an opening image,
  a set of expedition facts, an overview, a route, an ordered list of Stops, a closing
  note, and credits.
- **ExpeditionFact**: One item in the facts strip — a label and a value (e.g. "Duration" /
  "25 minutes").
- **Stop**: One place in Bells Corners; has a number, a headline, one or more Images, a
  first-person story, and an optional downtown translation.
- **Image**: A photograph or illustration supplied by the author; has a text alternative
  and a credit.
- **Route**: The decorative illustrated line and the seven marked positions along it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a mid-range phone over a typical mobile connection, the opening image and
  title are readable within 3 seconds of opening the link.
- **SC-002**: A visitor can read the page end to end — opening to credits — in 6 minutes
  or less.
- **SC-003**: Scrolling stays smooth from top to bottom with no visible stutter, on a
  mid-range phone.
- **SC-004**: 100% of sections and stops render without clipping or horizontal scrolling
  at phone (≈360 px), tablet, and desktop widths, in both portrait and landscape.
- **SC-005**: Every text-over-image pairing meets the readable-contrast floor, verified
  across the full area the text occupies.
- **SC-006**: The page is complete and readable with motion disabled, with images absent,
  and by keyboard alone — with no content missing in any of the three cases.
- **SC-007**: With connectivity cut after first load, a visitor can still scroll the whole
  page with its imagery and reach the closing note.
- **SC-008**: All six co-workers read the page to the end without being prompted to scroll
  or told how it works.
- **SC-009**: At least 5 of the 6 co-workers can name three things they learned about
  Bells Corners afterwards, and at least 5 of 6 describe the page as surprising or "wow"
  (informal poll).
- **SC-010**: At least 4 of the 6 co-workers reopen the page or pass on a link within a
  week.

## Assumptions

- **The reference page could not be read directly.** It renders its content with
  JavaScript, so this spec describes the *editorial qualities* being emulated — full-bleed
  photography, generous typographic scale, a facts strip, an overview, a drawn route, and a
  numbered itinerary — rather than claiming to reproduce that specific page. Nothing from
  the reference is copied: no text, imagery, branding, or name.
- **The wow now rests on the author's photographs.** With the mechanic gone, the page has
  nothing to hide behind: an expedition layout carrying placeholder illustrations will look
  empty in a way the dial did not. Real photographs of the seven places are a prerequisite
  for the effect, not a finishing touch.
- The tour comprises seven stops and is designed to be read in about 5 minutes.
- The author supplies all content — title, facts, overview, stop headlines, stories,
  downtown translations, and photography — authored once and baked into the site. No
  content-management or editing interface is in scope.
- The page is location-independent: it is read anywhere, at any time, on any device, and
  does not depend on being in Bells Corners or in a car.
- The site remains static, with no server, accounts, analytics, or paid service at runtime
  — zero hosting and runtime cost — and keeps working offline after first load.
- The site is reachable via a single shareable link with no login.
- English only. Downtown translations assume familiarity with the core (e.g. ByWard
  Market, Parliament, the Canal).
- The "our creation (human + AI)" message and the call to build are delivered by the author
  in person and remain intentionally absent from the site, as decided in 001.
- Public facts about Bells Corners used in the stories are checked by the author before the
  page is shown; the site is a personal narrative, not a reference.
- The expedition framing is affectionate rather than mocking: the format is played
  straight, and the humour comes from taking an ordinary suburb seriously.
