# Public release audit

Reviewed 2026-10-31.

The showcase was assembled from an explicit UI/animation allowlist into a separate directory. The original project was read only. A before/after SHA-256 comparison of 51 original UI, server and data files found no content changes. No original Git history was imported.

## Included content

- Existing visual components, particle renderer and styling, with a new local Demo controller.
- Newly authored synthetic seven-day schedules and 168 fictional hourly fatigue values. These are not extracted or anonymized user records.
- Three fixed Demo dialogues, labels, tests and static build/deployment configuration.
- Self-hosted Inter and Roboto Mono font assets and their unmodified SIL OFL notices under `public/licenses/`.

## Excluded content

The original backend, shared Agent controller, provider adapters, original database JSON, active schedule, source record IDs, voice models and recordings, runtime executables, old builds, launch scripts, caches, development reports, credentials and environment files were not copied. Original source was checked for credential-like strings, private filesystem paths and contact strings without printing matched values. The original project tree was also checked for sensitive filenames outside dependency/runtime folders.

The completed public source and built assets pass `npm run audit`: no credential, private-key, private-path, email, assigned-secret, environment-file, backend-directory, unexpected-symlink or outgoing-call findings. A negative-fixture test verifies that the scanner rejects example credentials, contacts, private paths, environment files and outgoing calls without echoing matched content.

## Runtime boundary

There are no chat, schedule, fatigue or voice API clients in the app, no AI provider requests, no microphone access, no analytics and no storage persistence. Text input chooses a static preset; it is not uploaded. The HTML CSP uses `connect-src 'none'`, `media-src 'none'`, `frame-src 'none'`, `object-src 'none'` and `form-action 'none'`. All changes remain in React memory and disappear after refresh.

The retained particle adapter contains generic audio-adapter methods inherited from V4, but the showcase never invokes them. Its Speaking state receives only a local synthetic visual envelope. No audio context, media source or device is connected by the showcase.

Only `dist/` is uploaded by the Pages workflow. Git ignores `node_modules`, `dist`, environment files and key files. Distribution archives exclude dependencies and Git metadata.

Pattern scanning has limits; the strongest privacy boundary here is the small allowlist and newly authored data. Re-run the audit and manually review all added content before future public releases.
