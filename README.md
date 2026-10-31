# Space Max · V4 Showcase Demo

An independent static frontend showcase of the existing V4 workbench. This repository contains only allowlisted UI and particle animation code plus newly authored fictional Demo data. The full local V4 project, shared Agent, backend, databases and voice runtime remain separate and unchanged.

## What visitors can try

- Three-column schedule, particle character and chat workbench. Small screens stack the same panels.
- Idle, Listening, Thinking and Speaking particle states. State changes are simulated; Listening does not record and Speaking does not play sound.
- A scrollable 24-hour schedule with a 12-hour viewport, seven-day selector and selectable hours.
- **Synthetic Demo** fatigue indicator. It is not a personal or clinical reading, and it does not recalculate after adjustments.
- Live Captions with progressive **scripted text** playback.
- Three explicitly labeled preset conversations. Typed text selects a fixed preset using simple keywords; unknown input plays the briefing preset. It is never sent anywhere or treated as a live AI request.
- Schedule Adjustment Preview, Accept Change and Keep Original. The preview swaps a fictional recovery break with the experiment. Accept affects the current browser session only; other days stay unchanged. Reset Demo or refresh restores all originals.

There is no AI provider connection, API key, server, microphone access, telemetry, account integration or persistent storage. The HTML Content Security Policy blocks outgoing connections and media. Source and fonts are bundled locally.

## Run and verify

Node.js 24 and npm are required.

```sh
npm ci
npm run verify
npm run dev
```

For a production preview:

```sh
npm run build
npm run preview
```

`verify` runs schedule/data/isolation tests, TypeScript, the production build, and an audit of source and built files. The audit prints filenames and issue categories only, never matched secrets. Review any new data manually as well; a pattern scanner cannot prove the absence of all possible private content.

## GitHub Pages deployment

The included `.github/workflows/pages.yml` builds and deploys on pushes to `main`, and can also run manually. It uses GitHub's official pinned Pages actions. It uploads **only `dist/`**, not the repository or any local backend.

1. Create a new public repository for this sanitized showcase only.
2. Push these files to its `main` branch. Do not upload the original V4 folder or Git history.
3. Open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Check the **Deploy Showcase to GitHub Pages** workflow. Its deployment environment returns the actual published URL.
5. Open that returned URL, refresh the page and exercise the Demo controls before sharing it.

Vite uses `base: './'`, and UI asset URLs use `import.meta.env.BASE_URL`. This supports a GitHub project subdirectory without a hardcoded account or repository name. No client-side path routing is used, so the site entry URL and its refresh work on static hosting. Arbitrary invented subpages are not supported.

Official references: [Vite static deployment](https://vite.dev/guide/static-deploy), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Public-content boundary

Included: V4 visual components, particle renderer, styles, self-hosted font packages, synthetic `src/demo/demo-data.json`, local demo controller, build configuration, tests and documentation.

Excluded: original data records, source record identifiers, Agent core, backend and API handlers, voice services and models, original build output, caches, recordings, launchers, runtime binaries, environment files, secrets, credentials, personal contacts and filesystem paths. No original database JSON was copied. Dependencies and `dist/` are ignored by Git.

See `AUDIT.md` and `VALIDATION.md` for the completed review and checks. The repository does not declare a new license for the original project code.
