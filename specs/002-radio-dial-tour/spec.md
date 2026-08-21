# Feature Specification: Bells Corners Radio — Tune the Dial

**Feature Branch**: `002-radio-dial-tour`

**Created**: 2026-08-20

**Status**: Superseded by [`specs/003-*`](../) on 2026-08-21 — the radio dial is replaced by
an editorial expedition-style page. This spec and its implementation are retained in git
history only; see the newer spec for the current intent.

**Input**: User description: "I want to change the design specifications so that it is more responsive and punchy. I don't like the idea of the map anymore, or the idea of having to take pictures. Let's pivot to something that has a greater wow factor. For example, https://marinabudarina.github.io/chimes/#home. Instead of the chimes, come up with something creative."

## Pivot Summary

This specification **supersedes** `specs/001-bells-corners-tour/spec.md`. The audience, the
subject, and the goal are unchanged: six co-workers who know only downtown Ottawa are
given a short, memorable tour of Bells Corners, and it must knock them off their feet.

What changes:

| Removed from 001 | Replaced with |
| --- | --- |
| Map / route visual | A tactile **radio dial** that *is* the route and the navigation |
| Camera "snap to unlock" mechanic | **Tuning** — drag or flick the dial to find each station |
| Photo-based personal recap | A generated **sign-off card** listing the stations received |
| Physical ride-along dependency | Works anywhere, any time, on any device |

### The Creative Concept

The whole site is one thing: an analog **car radio**. Bells Corners is strung along a
single road, and this tour is strung along a single frequency dial. Each place in the
village is a **station** at its own spot on the dial, in the order you would pass it
driving through.

The visitor drags the dial with a thumb. It has weight — it carries momentum when
flicked and settles with friction. Between stations there is **static**: visual noise and
(when sound is on) a hiss. As the needle nears a station the static resolves, the signal
strengthens, and the station **locks in** — the noise snaps into a full-bleed broadcast:
a big typographic station ident, a visual, a short first-person memory, and a "downtown
translation" that relates the place to something the listener already knows from the
core.

Stations already received stay lit on the dial, so the dial doubles as progress, table of
contents, and route. The dial's backlight travels through the day as you move along it —
morning at one end, strip-mall neon at the other. When every station has been received,
the tour **signs off** with a closing broadcast and a keepsake card.

Nothing to install, nothing to photograph, nothing to find in the real world. One
control, immediate response, high drama.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tune the Dial and Receive the Stations (Priority: P1)

A co-worker opens the link on their phone. The screen is a radio: a frequency dial with a
needle, a band of stations, and one instruction. They drag the dial with their thumb. It
moves with them instantly and keeps going when they flick it. Static fills the screen
between stations; as the needle approaches a station the noise clears and the station
locks in, filling the screen with that place's broadcast — its name, a visual, a short
first-person memory, and where the author supplied one, a downtown translation. They
flick on to the next station. The dial shows which stations they have received and how
many are left, and they can go back to any received station at any time. Everything works
one-handed in portrait, and the whole tour can be completed without sound.

**Why this priority**: This is the product. The dial, the static, and the lock-in are the
entire mechanic; without them there is no tour.

**Independent Test**: On a phone, open the site and tune through the dial from one end to
the other, confirming every station locks in and displays its content, that received
stations remain marked, and that the last station is reachable. Delivers the complete
tour on its own.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site on a phone in portrait, **When** it loads, **Then**
   they see the dial, the needle, and a single clear instruction telling them to tune,
   with no horizontal scrolling and all text readable without zooming.
2. **Given** the dial is on screen, **When** the visitor drags it, **Then** the needle
   tracks their thumb with no perceptible delay, and releasing mid-drag carries the
   needle onward and settles it rather than stopping dead.
3. **Given** the needle is between stations, **When** the visitor looks at the screen,
   **Then** they see a clearly "off-station" state (noise, no readable story) that makes
   it obvious tuning further will find something.
4. **Given** the needle comes to rest near a station, **When** it settles, **Then** the
   station locks in — the noise resolves and that place's broadcast opens with its name,
   at least one visual, the first-person memory, and the downtown translation where one
   exists.
5. **Given** the visitor has received some stations, **When** they look at the dial,
   **Then** received and not-yet-received stations are visually distinguishable and the
   count of received stations out of the total is visible.
6. **Given** a station was received earlier, **When** the visitor tunes back to it,
   **Then** its broadcast opens again immediately with the same content.
7. **Given** the visitor prefers not to drag, **When** they use keyboard, screen reader,
   or the always-available station guide, **Then** they can step from station to station
   and read every broadcast in full.
8. **Given** the site is opened on a tablet or laptop, **When** it renders, **Then** the
   dial and broadcasts adapt to the wider screen with no loss of content or function.
9. **Given** sound is unavailable, muted, or declined, **When** the visitor takes the
   tour, **Then** every station is fully understandable from what is on screen.

---

### User Story 2 - Be Wowed: Analog Feel, Punch, and the Sign-Off (Priority: P2)

The radio should feel like an object, not a web page. The dial has weight and inertia.
Static is textured and alive. Stations arrive with a snap, not a fade. The dial's
backlight shifts from morning through to neon as the visitor travels along the band, so
the drive is felt as time passing. When the last station is received, the tour signs off:
a closing broadcast that names what the visitor has just been through. Optional sound —
off until the visitor asks for it — adds hiss, the click of the dial, and a station
ident. None of this may cost readability, speed, or one-handed use.

**Why this priority**: "Knock them off their feet" is the stated goal, and the analog
feel is what separates this from a list of paragraphs. It depends on P1 being solid.

**Independent Test**: A first-time visitor on a phone experiences momentum on the dial,
visible static between stations, a snap on lock-in, a palette that changes across the
band, and a sign-off after the final station — and the same tour remains fully usable
with reduced motion preferred and sound off.

**Acceptance Scenarios**:

1. **Given** the visitor flicks the dial hard, **When** they let go, **Then** the needle
   travels on and settles smoothly, and the motion stays fluid throughout.
2. **Given** the needle passes across the band, **When** the visitor watches, **Then**
   the palette and lighting visibly change from one end of the band to the other.
3. **Given** a station locks in, **When** the broadcast opens, **Then** it arrives
   decisively and is fully readable within about one second.
4. **Given** the visitor has a reduced-motion preference set, **When** they take the
   tour, **Then** motion and noise effects are minimized, tuning becomes a direct step
   between stations, and every station and control remains available.
5. **Given** sound is off by default, **When** the visitor chooses to turn it on,
   **Then** one obvious control does so, and one tap turns it off again at any point.
6. **Given** the visitor receives the final station, **When** its broadcast ends,
   **Then** a sign-off closes the tour and names the stations received.

---

### User Story 3 - Keep It and Pass It On (Priority: P3)

After the tour, a co-worker wants to keep something and show someone else. The sign-off
leaves them with a card — the stations they received, in dial order, as a single keepsake
they can save or share. Reopening the link later brings back their progress rather than
starting from silence, and a link to any single station opens that station directly, with
the dial still visible around it, so it can be sent to someone else.

**Why this priority**: Extends the life of the tour past the moment, and reuses all P1
content at low risk.

**Independent Test**: Complete the tour, save or share the sign-off card, reopen the link
later on the same device and confirm received stations are still lit, then open a single
station's link on a different device and confirm it lands on that station.

**Acceptance Scenarios**:

1. **Given** the visitor has finished the tour, **When** the sign-off appears, **Then**
   it offers a keepsake card listing the stations received in dial order, which the
   visitor can keep or pass on.
2. **Given** the visitor took the tour earlier on this device, **When** they reopen the
   link, **Then** their received stations are still marked and they can continue or
   revisit.
3. **Given** a link to a single station, **When** it is opened on any device, **Then**
   that station's broadcast opens with the dial visible around it.

---

### Edge Cases

- **Needle parked between stations and left there**: the off-station state must still
  invite action — the visitor is never stuck on a blank screen with nothing to do.
- **Very fast flick past several stations**: stations flown past are not marked received;
  the visitor can tune back to them, and the motion never stutters or overshoots the band.
- **Tuning out of order or skipping stations**: allowed; progress reflects what has been
  received, and the sign-off appears once all stations are received in any order.
- **Reaching either end of the band**: the dial stops cleanly at the edge with a visible
  limit rather than continuing into emptiness.
- **A visual for a station fails to load**: the station's name, memory, and translation
  still display.
- **Sound blocked or unavailable on the device**: silent parity — the tour is complete
  without it and no error is shown beyond a plain note if the visitor asked for sound.
- **Reduced-motion preference set**: no inertia, no noise animation; tuning steps
  directly between stations and all content remains reachable.
- **Very narrow phone (≈360 px) or large system font sizes**: nothing clipped, dial still
  operable, tap targets large enough for a thumb.
- **Screen reader or keyboard only**: the dial exposes its stations as an ordered,
  navigable set; every broadcast, visual alternative, control, and the sign-off is
  reachable without dragging.
- **Landscape or a phone rotated mid-tour**: layout adapts and the current station and
  progress are preserved.
- **Page refreshed or device locked mid-tour**: received stations are not lost.
- **Connectivity drops after first load**: tuning, stations, sign-off, and keepsake keep
  working.
- **Visitor stops before receiving every station**: they can leave and come back; the
  sign-off remains available once the last station is received.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST open on a single full-screen radio dial with a clear,
  single instruction to tune, and MUST require no setup, account, permission grant, or
  device capability beyond a screen.
- **FR-002**: The dial MUST be operable by direct drag and flick, and the needle MUST
  track the visitor's input continuously and without perceptible delay.
- **FR-003**: A flick MUST carry the needle onward and settle it, rather than stopping it
  at the point of release.
- **FR-004**: The dial MUST present every place in the tour as a station positioned along
  one band in the order the places occur along the road through Bells Corners.
- **FR-005**: When the needle is not on a station, the site MUST show an unmistakable
  off-station state with no readable story content.
- **FR-006**: When the needle settles at or near a station, the site MUST lock that
  station in and open its broadcast without any further action from the visitor.
- **FR-007**: Each station's broadcast MUST include the place's name, at least one
  visual, a short first-person memory, and — where the author supplies one — a "downtown
  translation" relating it to something familiar from downtown Ottawa.
- **FR-008**: The dial MUST distinguish received from not-yet-received stations and MUST
  show the number received out of the total at all times.
- **FR-009**: Visitors MUST be able to return to any received station and re-read it, and
  MUST be able to receive stations in any order.
- **FR-010**: The site MUST provide an always-available station guide — an ordered,
  readable list of every station — from which any station can be opened directly, so the
  tour is completable without dragging.
- **FR-011**: The site MUST present the visitor's position along the band as a visible
  change in lighting and palette from one end to the other.
- **FR-012**: After the final station is received, the site MUST present a sign-off that
  closes the tour and names the stations received.
- **FR-013**: The site MUST offer a keepsake card listing the stations received in dial
  order, which the visitor can save or share.
- **FR-014**: Sound MUST be off by default, MUST be switchable on and off from one
  obvious control at any point, and MUST never be required: every station MUST be fully
  understandable with sound off.
- **FR-015**: The site MUST honor the visitor's reduced-motion preference by minimizing
  motion and noise effects and stepping directly between stations, with no loss of
  content or function.
- **FR-016**: The site MUST be responsive: fully usable one-handed in portrait down to
  ≈360 px wide, with thumb-sized controls, and MUST adapt to tablet, desktop, and
  landscape widths with no horizontal page scrolling.
- **FR-017**: The site MUST keep each visitor's received stations on their own device so
  that refreshing, locking the device, or returning later does not lose them.
- **FR-018**: Each station MUST be directly linkable so it can be shared and opened on
  any device with the dial visible around it.
- **FR-019**: After first load, the site MUST work fully offline: tuning, every station,
  the sign-off, and the keepsake; connectivity loss MUST NOT show an error page or block
  any step.
- **FR-020**: The site MUST NOT call any external or paid service at runtime and MUST be
  deployable with no server component and no secrets.
- **FR-021**: The site MUST meet baseline accessibility: high-contrast readable text
  including in bright light, keyboard and screen-reader operable dial and controls, text
  alternatives for every visual, and a text equivalent for any information conveyed by
  sound or by the off-station state.
- **FR-022**: The site MUST NOT require an account, login, or personal information, MUST
  NOT collect the visitor's location, and MUST NOT send anything about the visitor
  anywhere; progress stays on the device unless the visitor chooses to share a station
  link or their keepsake.
- **FR-023**: Any error the visitor can encounter MUST state plainly what happened and
  what they can do next, and MUST leave the tour usable.

### Key Entities

- **Broadcast (the tour)**: The single Bells Corners tour; has a title, an opening
  instruction, an ordered band of Stations, a palette that travels across the band, and a
  sign-off.
- **Station**: One place in Bells Corners; has a name, a position on the band, an order,
  one or more Visuals, a first-person memory, and an optional downtown translation.
- **Visual**: An image or illustration supplied by the author for a Station; has a text
  alternative and a credit.
- **Reception**: The visitor's record that a Station has been received and when; lives on
  the visitor's device.
- **Keepsake**: The end-of-tour card — the Stations received, in dial order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a mid-range phone over a typical mobile connection, the dial is on
  screen and draggable within 3 seconds of opening the link.
- **SC-002**: A first-time visitor receives their first station within 10 seconds of the
  dial appearing, without being told how it works.
- **SC-003**: The needle responds to a drag within a tenth of a second, and tuning motion
  stays smooth with no visible stutter throughout a full sweep of the band.
- **SC-004**: A station locks in and becomes fully readable within 1 second of the needle
  settling.
- **SC-005**: All six co-workers complete the tour — every station received and the
  sign-off reached — in 10 minutes or less, unaided.
- **SC-006**: 100% of stations, the station guide, the sign-off, and the keepsake render
  without clipping or horizontal scrolling at phone (≈360 px), tablet, and desktop
  widths, in both portrait and landscape.
- **SC-007**: The tour is completable end to end with sound off, with reduced motion
  preferred, and by keyboard alone — with all content available in each case.
- **SC-008**: With connectivity cut after first load, a visitor can still tune, read every
  station, reach the sign-off, and open the keepsake without an error page.
- **SC-009**: At least 5 of the 6 co-workers can name three things they learned about
  Bells Corners afterwards, and at least 5 of 6 describe the experience as surprising or
  "wow" (informal poll).
- **SC-010**: At least 4 of the 6 co-workers reopen the link or pass on a station link
  within a week of the tour.

## Assumptions

- **Not tied to a real drive**: with the map and camera removed, the tour no longer
  depends on being physically in Bells Corners or in a moving car. It can be taken in the
  author's car, at a desk, or anywhere — this is the point of the pivot.
- The tour comprises roughly 6–10 stations and is designed to be enjoyed in about 5–10
  minutes, with rewatch value.
- The author supplies all content — station list, memories, downtown translations, and
  visuals — authored once and baked into the site. No content-management or editing
  interface is in scope.
- The dial metaphor replaces the map entirely: the band's order carries the geography, so
  no map, coordinates, or location data are needed anywhere in the experience.
- Sound is an enhancement, not content. It is off by default because visitors may open the
  link in an office or a car; the tour is specified and tested as complete without it.
- The site is static, with no server, accounts, analytics, or paid service at runtime —
  zero hosting and runtime cost, and it keeps working offline after first load.
- The site is reachable via a single shareable link with no login.
- English only. Downtown translations assume familiarity with the core (e.g., ByWard
  Market, Parliament, the Canal).
- The "our creation (human + AI)" message and the call to build are delivered by the
  author in person and remain intentionally absent from the site, as decided in 001.
- Public facts about Bells Corners used in the memories are checked by the author before
  the tour is shown; the site is a personal narrative, not a reference.
- The radio metaphor is a fresh visual and interaction concept, not a reproduction of the
  referenced chimes site; that link served only as a benchmark for tactility and delight.
