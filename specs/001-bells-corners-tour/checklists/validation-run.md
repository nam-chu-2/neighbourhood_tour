# Validation Run — quickstart.md walkthrough

**Automated portion recorded**: 2026-08-17 (sandboxed environment; Chromium engine,
iPhone 13 / Pixel 5 metrics + Desktop Chrome). Real-phone rows must be completed by
the author on a device over LAN, and once against `npm run build && npm run preview`
offline — this file is the record for T055.

## Automated (Playwright, built app + service worker)

- [x] US1-1 Welcome + ordered list, no horizontal scroll, one primary action (`us1-snap-flow`)
- [x] US1-2 Snap → proposal with photo → confirm → detail <1 s (`us1-snap-flow`)
- [x] US1-3 Pick a different place (`us1-snap-flow`)
- [x] US1-4 Order-aware proposal incl. wrap-around (`us1-snap-flow`, unit `proposal`)
- [x] US1-5 Retake discards, nothing found (`us1-snap-flow`)
- [x] US1-6 Camera denied → explanation + no-photo find (`us1-fallbacks-offline`)
- [x] US1-7 Offline after first load: reload from SW cache, full flow works (`us1-fallbacks-offline`, Chromium)
- [x] US1-8 Reload persists finds + photos (`us1-snap-flow`)
- [x] US1-9 Desktop layout adapts, all content present (`us1-fallbacks-offline`)
- [x] US2-1 Route draws + marker pops ≤1 s; reduced motion = same content, no animation (`us2-delight-recap`, unit `RouteMap`)
- [x] US2-2 Closing note → recap in route order; Save via Web Share files (`us2-delight-recap`)
- [x] US2-3 Partial recap (3 of N) with honest notice (`us2-delight-recap`)
- [x] US3-1 Reopen same profile: finds + recap present (`us3-revisit-deeplink`)
- [x] US3-2 Deep link locked on fresh profile; `?after=1` readable; share link built (`us3-revisit-deeplink`)
- [x] A11y: axe no serious/critical on welcome/tour/sheet/detail; keyboard path; focus trap; marker names; aria-live (`a11y`)
- [x] Perf: initial JS ≤150 kB gzip; welcome usable <3 s on throttled 4G; precache <15 MB (`perf`)
- [x] Hardening: zero external requests during a full pass (`us1-fallbacks-offline`)

## Real phone over LAN (author to complete)

- [ ] Open `npm run dev` LAN URL on a phone in daylight; text legible, tap targets hit from a moving-car grip
- [ ] Native camera opens from Snap; portrait photo lands in the proposal correctly oriented
- [ ] Lock/unlock the phone mid-tour; progress and photos intact
- [ ] Built app (`npm run preview` over LAN): load once, airplane mode on, complete two finds and open the recap
- [ ] "Ready for the road ✓" appears on the welcome after first load
- [ ] Save your ride: share sheet appears with one JPEG (or download lands on desktop)

## Notes

- WebKit engine could not be installed in the sandbox; the iPhone 13 Playwright
  project runs iPhone metrics on Chromium. Re-run `npx playwright install webkit`
  locally and drop the `browserName` override in `playwright.config.ts` for a true
  Safari pass before the drive.
