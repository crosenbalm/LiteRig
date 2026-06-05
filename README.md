# LiteRig
A lightweight desktop app for simplified vtuber models. Import a PSD file to create a LiteRig model,
then use simplified tracking to animate your PNG model. Designed for vtubers with lower PC specs in mind.

Built with Tauri + React + TypeScript.

## Running the project
Prerequisites: [Node.js](https://nodejs.org/), [Rust](https://rustup.rs/), and the [Tauri prerequisites for your OS](https://v2.tauri.app/start/prerequisites/).

```bash
npm install
npm run tauri dev
```

For a production build: `npm run tauri build`

## Features
- Import a PSD file — visible layers are extracted and normalized automatically
- Built-in test avatar for trying the app without a PSD file
- Per-layer controls: X/Y offset, rotation, scale, and opacity sliders
- Reset button to restore a layer to its default state
- Model auto-fits and re-centers in the preview area on window resize

## Project structure
```
src/
  types.ts                  — shared types (Layer, Bounds, ViewMode)
  psdUtils.ts               — PSD parsing: walks the layer tree and converts pixels to data URLs
  layerUtils.ts             — pure layout utilities: fit transform, bounding box, dimension loading
  components/
    ChooseScreen.tsx         — landing screen for picking a source (PSD or test avatar)
    LayerControls.tsx        — sliders and reset button for the selected layer
    LayerPicker.tsx          — button list for switching the active layer
    PreviewCanvas.tsx        — renders all layers as positioned images in the preview area
  App.tsx                   — root component: manages state and wires everything together
```

## TODO
- Center layer rotation & scaling
- Add clipping layers
- Resize & fullscreen preview window
