# Feature Specification: Bells Corners Drive-Through Tour

**Feature Branch**: `001-bells-corners-tour`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "I want to create a website that is responsive and mobile friends -- especially this -- that conveys a short tour by car of my childhood neighbourhood. The audience will be 6 co-workers that have lived in ottawa, but only the downtown core. The goal of this tour is to give them a taste of my city, specifically the small village that I grew up in (Bells Corners). I want the website to knock-them off their feet! They should leave with the feeling not of my creation, but of our creation (AI and human). They should leave with an understanding with the breadth of its powers, and they should resolve to go home and start building themselves!"

## Clarifications

### Session 2026-08-17

- Q: Is the tour viewed virtually or used during a real drive? → A: A real ride-along.
  The author drives; the six co-workers ride with their phones open on the site.
- Q: How do visitors progress through the tour? → A: The site lists the places on the
  route; as they drive past a listed place, a passenger takes a photo of it, and that
  opens the place's description.
- Q: Should the site include the "our creation (human + AI)" layer and call to action?
  → A: No. Removed from the site entirely; the author will explain this in person.
- Q: What causes a place's description to open when a passenger photographs it? → A:
  The site recognizes the place in the photo (image recognition) and unlocks it only
  when the photo is judged to show that place; no location check.
- Q: Does the passenger pick the place first, or does the site identify it from the
  photo? → A: One "snap" action; the site identifies which listed place the photo shows.
  If it is unsure, it offers the top 2–3 candidate places for the passenger to pick.
- Q: What if recognition repeatedly fails on a place the passenger is looking at? → A:
  After two unrecognized attempts, offer a manual "I'm right here — mark it found" pick
  from the list; the last photo taken is kept for the recap.
- Q: Should the site call a paid AI service at runtime (image recognition needs an API
  key with separate pay-as-you-go billing, not covered by the author's Claude Max plan)?
  → A: **No — SUPERSEDES the three recognition answers above.** Zero runtime cost, no
  server, no API key. "Smart-default snap": the passenger taps one Snap action and
  photographs the place; the site pre-selects the **next not-yet-found place in route
  order** (the drive follows the route) and asks for a one-tap confirm, with "pick a
  different place" available. The photo is kept as the keepsake. Works fully offline
  after first load; the site is a static page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ride Along and Unlock Places by Photographing Them (Priority: P1)

A co-worker is a passenger in the author's car with the site open on their phone. They
see a welcome that frames Bells Corners for someone who knows only downtown Ottawa, then
a list of the places on the drive in route order, each shown as "not yet found". As the
car approaches a listed place, the author points it out; the passenger taps a single
"snap" action and photographs it. The site proposes the place it expects next on the
route ("Is this the Bells Corners sign?") — one tap confirms, or the passenger picks a
different place from the list — and opens that place's description: what it is, what it
meant to the author growing up, and (where supplied) a "downtown translation"
relating it to something a downtown-only Ottawan already knows. The passenger can see how
many places they have found and how many remain, and can re-open any found place. At the
last place the tour wraps up with a closing note. Everything is readable one-handed in
portrait, in a moving car, in daylight.

**Why this priority**: This is the product — the drive, the list, and the
photo-to-unlock mechanic that makes the passengers participants rather than viewers.

**Independent Test**: On a phone, open the site, take (or simulate taking) a photo for
each listed place in order, confirm each description opens, and reach the closing note.
Delivers the complete ride-along experience.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site on a phone in portrait, **When** it loads, **Then**
   they see a welcome and the ordered list of places, each marked as not yet found, with
   no horizontal scrolling and all text readable without zooming.
2. **Given** the visitor is at a listed place, **When** they use the single "snap" action
   to photograph it, **Then** the site immediately proposes the next not-yet-found place
   in route order with the photo shown, and one tap ("Yes, that's it") marks that place
   as found and opens its description (name, story, visual, optional downtown
   translation) — no network needed.
2a. **Given** the proposal is wrong (they photographed a different place, or skipped
   ahead), **When** they tap "Pick a different place", **Then** the list of not-yet-found
   places is shown and their pick is marked found with that photo.
2b. **Given** the visitor changes their mind before confirming, **When** they tap
   "Retake" or dismiss, **Then** nothing is marked found and the photo is discarded.
2c. **Given** some places have already been found, **When** the visitor snaps, **Then**
   the proposal is the first not-yet-found place after the highest found route order
   (order-aware default), never a place already found.
3. **Given** the visitor has found some places, **When** they look at the list, **Then**
   they can see which places are found vs. not yet found and how many remain, and can
   re-open any found place's description.
4. **Given** the visitor's phone denies camera access or the camera fails, **When** they
   try to photograph a place, **Then** they are told plainly what happened and can still
   mark the proposed (or a picked) place as found without a photo so the tour continues.
5. **Given** the visitor has found the final place, **When** its description closes,
   **Then** a closing note completes the tour.
6. **Given** the site is opened on a laptop-sized screen (e.g., afterwards), **When** it
   renders, **Then** the layout adapts without loss of content or function.

---

### User Story 2 - Be Wowed: Delight, Motion, and a Personal Keepsake (Priority: P2)

The tour should feel alive rather than like a checklist. Finding a place is a moment: the
route visibly advances, the reveal of the description has presence, and the opening makes
a strong first impression. At the end, the visitor sees their own photos assembled into a
personal recap of the drive — the tour they took, in their own pictures — that they can
keep. None of this may compromise readability, speed, or one-handed use in a car.

**Why this priority**: "Knock them off their feet" is an explicit goal; it depends on the
core mechanic (P1) being solid. Delight is the multiplier, not the foundation.

**Independent Test**: A first-time visitor on a phone sees a route-progress animation on
each find and, after the last place, a recap composed of the photos they took; the tour
remains fully usable with reduced-motion preferred.

**Acceptance Scenarios**:

1. **Given** the visitor finds a place, **When** the description reveals, **Then** the
   route/map visibly progresses to that place and the reveal completes within about a
   second.
2. **Given** the visitor has a reduced-motion preference set, **When** they take the tour,
   **Then** motion effects are minimized and all content and controls remain available.
3. **Given** the visitor has finished, **When** the recap appears, **Then** it shows the
   photos they took in route order with each place's name, and offers a way to keep it.

---

### User Story 3 - Revisit and Share Afterwards (Priority: P3)

After the drive, a co-worker reopens the link at home or at their desk and can browse
every place's description without needing to take photos again, see their recap, and
share a link to a specific place with someone else.

**Why this priority**: Extends the life of the tour beyond the car; low risk, reuses all
P1 content.

**Independent Test**: After completing the tour on a phone, reopen the site later on the
same phone and confirm found places and the recap are still there; open a place's direct
link on another device and confirm the description shows in route context.

**Acceptance Scenarios**:

1. **Given** the visitor completed the tour earlier on this phone, **When** they reopen
   the site, **Then** their found places and recap are still present.
2. **Given** a direct link to a place, **When** it is opened on any device, **Then** the
   place's description opens with the route context visible.

---

### Edge Cases

- Camera permission denied, camera unavailable, or the photo capture fails: visitor is
  told what happened and can mark the place found without a photo (see FR-005).
- Visitor misses a place (car already past it, or they were looking elsewhere): they can
  still open it later without going back (see FR-006).
- Visitor photographs places out of the listed order: allowed; progress reflects what
  has been found regardless of order.
- Very narrow phone (≈360 px) or large system font sizes: no content clipped, controls
  reachable, tap targets large enough to hit in a moving car.
- Connectivity drops mid-drive: everything keeps working offline (FR-012).
- Wrong confirmation (tapped "yes" for the wrong place): visitor can undo the find from
  the place's description and snap again.
- Passenger snaps the same place twice: proposal moves on to the next unfound place;
  retaking a found place's photo is done from its description.
- Bright sunlight / glare: text and controls remain legible (high contrast).
- Photo taken is blurry or of the wrong thing: nothing is checked — it's their
  keepsake; "Retake" is offered before confirming.
- Page refreshed or phone locked/unlocked mid-tour: progress and photos are not lost.
- Drive ends before every place is found: the recap is still available and shows the
  places found so far; unfound places can be opened later (FR-006).
- Media (photo, illustration) for a place fails to load: the story text and route
  position still display.
- Screen reader / keyboard-only use: all places, descriptions, images (via text
  alternatives), controls, and the closing note are reachable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST present a welcome that frames Bells Corners for an audience
  who knows only downtown Ottawa, and a single primary action to begin the ride-along.
- **FR-002**: The site MUST present the tour as an ordered list of places along one car
  route, each shown as found or not yet found, with visible progress (found count and
  total) at all times.
- **FR-003**: The site MUST offer a single primary "snap" action (no prior place
  selection). After a photo is taken, the site MUST propose the next not-yet-found place
  in route order, show the photo, and mark that place as found on a single confirming
  tap; it MUST also offer "pick a different place" (list of not-yet-found places) and
  "retake/dismiss" (discard, nothing found). All of this MUST work with no network.
- **FR-003a**: The proposal MUST be order-aware: the first not-yet-found place whose
  route order is greater than the highest found order, else the first not-yet-found
  place overall; a place already found MUST never be proposed.
- **FR-003b**: The site MUST NOT call any external or paid service at runtime; it MUST be
  deployable as static files with no server component and no secrets.
- **FR-004**: Each place's description MUST include its name, at least one visual, a
  short first-person story, and — where the author supplies one — a "downtown
  translation" comparing it to something familiar downtown.
- **FR-005**: If the camera is denied, unavailable, or fails, the site MUST explain what
  happened and MUST let the visitor mark the proposed (or a picked) place as found
  without a photo so the tour can continue.
- **FR-006**: Visitors MUST be able to open a place they missed (drove past without
  photographing) without returning to it physically, and MUST be able to find places in
  any order.
- **FR-007**: The site MUST show the route on a map-like visual with found places, the
  current/next place, and the remaining route distinguishable.
- **FR-008**: The site MUST keep each visitor's photos and found-progress on their own
  device so that refreshing, locking the phone, or reopening later does not lose them.
- **FR-009**: After the final place, the site MUST present a closing note and a personal
  recap composed of the visitor's own photos in route order, with a way to keep it.
- **FR-010**: The site MUST be responsive: fully usable one-handed in portrait on phones
  (down to ≈360 px wide), with tap targets sized for use in a moving car, and adapting
  layout for tablet and desktop widths with no horizontal page scrolling.
- **FR-011**: The site MUST animate route progression when a place is found and MUST
  honor the visitor's reduced-motion preference.
- **FR-012**: After first load, the site MUST work fully offline for the rest of the
  drive: place list, snap/confirm/pick, descriptions, route, and recap; connectivity
  loss MUST NOT show an error page or block any step.
- **FR-013**: Each place MUST be directly linkable so it can be shared and opened in route
  context on any device.
- **FR-014**: The site MUST meet baseline accessibility: readable high-contrast text
  (including in bright light), keyboard and screen-reader operable controls, and text
  alternatives for every image and map marker.
- **FR-015**: The site MUST NOT require an account, login, or personal information,
  MUST NOT collect visitor location, and MUST NOT send photos anywhere; photos stay on
  the device unless the visitor explicitly chooses to share or export their recap.

### Key Entities

- **Tour**: The single Bells Corners drive; has a title, an introduction, an ordered list
  of Places, a route, and a closing note.
- **Place**: One stop along the route; has a name, order, route position, one or more
  Media items, a first-person story, and an optional downtown translation.
- **Media**: A photo, illustration, or map fragment supplied by the author for a Place;
  has a text alternative and a credit.
- **Find**: A visitor's discovery of a Place — the photo they took (or a no-photo mark
  when the camera was unavailable), how it was confirmed (proposal accepted / picked
  from list / no photo), and when; lives on the visitor's device.
- **Recap**: The visitor's end-of-tour keepsake — their Finds in route order with Place
  names.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a mid-range phone over a typical mobile connection, the welcome and
  place list are usable within 3 seconds of opening the link.
- **SC-002**: From taking a photo to the description opening takes at most one tap and
  under 1 second, with no network access.
- **SC-002a**: In a rehearsal drive following the route, the proposed place is correct
  on at least 9 of 10 snaps (no "pick a different place" needed).
- **SC-003**: All six co-workers complete the full drive (every place found, recap shown)
  during a single ride of roughly 20–30 minutes without needing help from the driver to
  operate the site.
- **SC-004**: 100% of places and the recap render without clipping or horizontal
  scrolling at phone (≈360 px), tablet, and desktop widths.
- **SC-005**: After the drive, at least 5 of the 6 co-workers can name three things they
  learned about Bells Corners, and at least 5 of 6 describe the experience as surprising
  or "wow" (informal poll).
- **SC-006**: Every image and map marker has a text alternative and every control is
  operable by keyboard; the tour is completable with animations disabled and with camera
  access denied (no-photo marks).
- **SC-007**: With connectivity cut after the site has loaded, a visitor can still
  snap, confirm, read every description, and open the recap without an error page.

## Assumptions

- **Real ride-along**: the author drives one route with the six co-workers as passengers
  (one or more cars), each with the site open on their own phone in daylight.
- The drive is "short": roughly 6–10 places over about 20–30 minutes.
- The author supplies the personal content — the place list, memories, and any personal
  photos or visuals for each place; content is authored once and baked into the site. No
  content-management or editing interface is in scope.
- The passengers' photos are keepsakes and part of the unlock ritual; they never leave
  the passenger's own device. There is no group album or upload unless the visitor
  chooses to share their recap themselves.
- The site is a static page with no server, no accounts, and no paid or external
  service at runtime — zero hosting/API cost. Passengers load it once (Wi-Fi or mobile
  data before setting off); everything after that works offline.
- The drive follows the route order, so "next unfound place" is the right default most
  of the time; picking a different place covers detours and skipped stops.
- The site is reachable via a shareable link, with no login and no visitor analytics
  beyond what is needed to operate it.
- English only. Downtown references assume familiarity with the core (e.g., ByWard
  Market, Parliament, the Canal).
- The "our creation (human + AI)" message and the call to action to build are delivered
  by the author in person and are intentionally not part of the site.
- Public facts about Bells Corners used in stories will be checked by the author before
  the drive; the site is a personal narrative, not a reference.
