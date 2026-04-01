# Tonarium

A free web toolkit for people who love music but never learned to read it. Explore scales, chords, and progressions visually - then jam over a beat you built yourself. Works with synths, guitars, and MIDI controllers.

**[Live demo →](https://ammul.github.io/tonarium/)**

Built by [ammul](https://github.com/ammul) - lazy music fan.

---

## Tools

- **Learn** - interactive lessons on intervals, scales, chord progressions, improvising, and building beats; each step is hands-on with audio playback
- **Jam Mode** - pick a key and scale to see safe notes highlighted; anchor notes (root, 3rd, 5th) are marked; tap pads to hear notes and layer melodies over a running drum beat; includes Chromatic mode for free play
- **Drum Computer** - 8-instrument, 16-step sequencer (kick, snare, hi-hats, toms, crash); synthesised sounds, no samples; loop continues playing when you switch to other tools
- **Chord Progressions** - browse classic progressions (I–V–vi–IV, ii–V–I, Canon in D, …) in any root key; tap a chord card to preview it, or loop the progression via MIDI while you improvise
- **Scale Visualizer** - see any scale across all 12 notes at a glance
- **Chord Detector** - select a set of notes and instantly identify the chord
- **Progression Builder** - arrange your own chord sequence and see it mapped out across your instrument

## Audio

All sound is synthesised in the browser via the Web Audio API - no samples or downloads required. The sound style for note playback (Synth, Piano, Bell, Pluck) is configurable in Settings, and persists across sessions.

The Drum Computer runs independently in the background: start a loop, switch to Jam Mode or any other tool, and the beat keeps going.

## Web MIDI

Connect a USB MIDI device and open **Settings → MIDI** to connect it. Once connected:

- Notes and chords from all tools are sent to the device
- MIDI note numbers are shown on pads for easy patch mapping
- Octave control in Settings lets you match your device's tuning

Requires Chrome or any browser with Web MIDI API support.

## Display Modes

All tools adapt to four layouts, selectable via Settings:

| Mode | Description |
|------|-------------|
| Pad | Chromatic pad grid (4x3 or 4x4, configurable in Settings) |
| Guitar | 6-string fretboard in standard tuning |
| Piano | Keyboard layout |
| Notes | Plain chromatic note names |

## Development

Clone the repository - it's a plain Vite / Vue 3 app.

```bash
npm install && npm run dev
```

Tests:

```bash
npm test          # unit + component tests (Vitest)
npm run test:e2e  # end-to-end tests (Playwright)
```

## License

MIT - see [LICENSE](LICENSE).
