# Validation record

Checked 2026-10-31 using Node.js 24, npm and the production static build.

## Automated checks

- Clean dependency installation with `npm ci` completed in the independent showcase.
- Six tests passed: seven-day data independence and complete intervals; nonmutating previews, accept/reject behavior and reset; synthetic hourly fatigue; fixed preset routing and four states; absence of live connections/recording/storage in the app; audit scanner rejection fixtures.
- TypeScript strict checking passed.
- Vite production build passed. All fonts and assets are local; source maps are disabled.
- Source and built-output public-content audit passed.
- Original V4 source/server/data comparison: 51 files checked, zero changes.

## Browser checks

Checked the built app, then repeated loading and refresh using a plain static server mounted at `/space-max-showcase/` to simulate a GitHub Pages project path.

- Three desktop columns render, and the original WebGL particle animation runs. The canvas reports progressing frames and `contextLost=false`.
- Idle, Listening, Thinking and Speaking buttons update the particle state and visible state indicator.
- Fixed Demo scenario playback transitions through Listening, Thinking and Speaking and progressively renders scripted Live Captions.
- Typed `I feel tired` selects the fixed recovery scenario.
- Schedule Adjustment Preview highlights the experiment at 09:00–11:00 and recovery at 08:00–09:00.
- Keep Original restores experiment 08:00–10:00; Accept retains experiment 09:00–11:00 locally.
- Changing to Day 4 shows its untouched 08:00 experiment. Returning to Day 3 retains the accepted 09:00 experiment until refresh.
- Refresh restores Day 3, 08:00 selection, original schedule and the initial chat.
- Selecting 14:00 changes the sample fatigue from 30% Low to 48% Moderate.
- Phone viewport 390 × 844: panels stack, particle canvas renders and no horizontal overflow occurs. Temporary viewport override was reset.
- Project-path HTML, JS, CSS and send icon use relative paths and render on direct load and refresh.
- Browser warning/error log was empty on the successful static preview.

This record verifies local production behavior. Public deployment is verified separately only after the GitHub workflow returns a deployed URL and that URL is opened successfully. No public URL is assumed from a repository name.
