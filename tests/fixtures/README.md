# Test fixtures

`places/<place-id>-1.jpg` — one stand-in "camera photo" per place in
`src/content/tour.ts`, used by the Playwright suites via `setInputFiles` (the
snap flow never needs a real camera in tests). `none-1.jpg` is a photo of
nothing on the tour.

Regenerate after changing the place list:

```bash
npm run fixtures
```

The script (`scripts/make-fixtures.ts`) renders each place name onto a coloured
800×600 JPEG with `sharp`. Commit the regenerated files — e2e runs (CI included)
use them as-is.
