# Tonarium — Roadmap

## Monetization strategy
Ko-fi donation button on the free web app (hosted on GitHub Pages). No backend, no paywall.
Target audience: synth nerds, beatmakers, teachers, and people who love music but don't read sheet music.

---

## Phase 1 — Public readiness

Get the app in shape before sharing it publicly and adding the Ko-fi link.

- [x] Change license from CC BY-NC 4.0 → MIT (`LICENSE`)
- [x] Fix MIDI stuck-note bug when navigating away from Claves Mode (`ClavesMode.vue`)
- [x] Update hero copy for target audience (`StartPage.vue`)
- [x] Add About section (`StartPage.vue`)
- [ ] Fix header cramping when MIDI is active (`App.vue`)
- [ ] Fill in About section: real name, one-sentence bio, Ko-fi URL
- [ ] Create Ko-fi page and replace placeholder URL in `StartPage.vue`

---

## Phase 2 — Growth & polish

Nice-to-haves once the app is public.

- [ ] Convert to PWA (installable, offline) — add `vite-plugin-pwa`, manifest, service worker
- [ ] MIDI status indicator in header (small dot when connected) — currently only visible in Settings
- [ ] `<meta>` tags for social sharing (og:title, og:description, og:image)
- [ ] Favicon / app icon that isn't the Vite default

---

## Phase 3 — Paid features (future)

Only worth building once there's an audience. All client-side, no backend.

- [ ] MIDI file export — record a progression or jam session and export as `.mid`
- [ ] Additional sound packs — more drum kits and instrument timbres bundled as assets
- [ ] Custom sample upload — File API + IndexedDB, files stay local (no server needed)
