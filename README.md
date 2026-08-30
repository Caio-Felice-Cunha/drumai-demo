# DrumAI — inspect a drum transcription in your browser

![DrumAI interactive demo](./site/social-card.svg)

**A zero-backend interactive demo of the notation player produced by a private, CPU-only drum transcription pipeline.**

[Try the demo](https://caio-felice-cunha.github.io/drumai-demo/) · [Engineering case](https://caio-felice-cunha.github.io/drumai-demo/#case-study) · [View source](https://github.com/Caio-Felice-Cunha/drumai-demo) · [Run locally](#run-locally)

## What you can test

- Start a synthesized four-bar drum groove with no audio file or external request.
- Change tempo, toggle the metronome and loop, and edit individual notation steps.
- Switch arrangement emphasis and export the edited chart as JSON.

## Case study

The working private product is a local, CPU-only CLI that turns a song into an
interactive drum chart and MIDI output through a seven-stage pipeline. The
private pipeline runs locally and downloads its model on first use. This public repository deliberately demonstrates the
observable result rather than pretending to run that model in a browser.

The fixture and sound are original and deterministic. No commercial recording,
lyrics, private pipeline source, model, API key, or user upload is included.

## Architecture

```text
Original rhythm fixture → editable grid → Web Audio synthesizer
                                └──────→ JSON arrangement export
```

The browser demo is static HTML, CSS, and JavaScript. It performs no fetch/XHR,
has no account system, and writes nothing to a server.

### Input and output contract

The private CLI accepts an operator-owned audio file and emits a versioned drum
chart plus MIDI. The public demo starts from an original, precomputed chart and
exports only the edited arrangement JSON. This keeps the product interaction
testable without exposing private model code or accepting uploads.

### Conceptual transcription pipeline

The engineering case documents the private flow as explicitly labelled
pseudocode: decode → normalize → separate stems → detect onsets → classify drum
events → quantize → publish chart/MIDI. It describes the contract and design
decisions, not the proprietary implementation.

The public player's real code uses an immutable score model. Edits return a new
chart, while the Web Audio scheduler derives event times from tempo and step
position. That separation keeps playback, visual state, and JSON export aligned.

## Quality and privacy

- Model tests cover tempo bounds, immutable edits, deterministic fixtures, and
  the public export contract.
- Browser tests cover playback controls, editing, export, technical content,
  no external requests, and no console errors.
- Audio is synthesized only after a user gesture; no recording or chart leaves
  the browser.

## Run locally

```bash
npm install
npm run serve
```

Open `http://localhost:4173`. Run `npm run test:all` for unit and browser tests.

## Limitations

- This is a deterministic product demo, not the transcription engine.
- Browser audio starts only after a user gesture.
- Export produces the edited demo arrangement, not MIDI.

## Security and licensing

The code is MIT licensed. Brand and authored case-study assets have separate
rights described in [BRAND-LICENSE.md](./BRAND-LICENSE.md).
