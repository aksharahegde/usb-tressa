# USB Connector Isometric Demo (Nuxt + TresJS)

Interactive USB connector showcase built with Nuxt and TresJS, based on the USB reference details from [USB Cheat Sheet](https://fabiensanglard.net/usbcheat/index.html).

## What this project includes

- 5 connector sections:
  - Type-A (USB 2, 4-wire)
  - Type-A (SuperSpeed, 8-wire)
  - Type-B (USB 2, 4-wire)
  - Type-B (SuperSpeed, 8-wire)
  - Type-C
- Three render modes per section:
  - `Product`
  - `Exploded`
  - `Wireframe`
- Camera presets:
  - `Isometric`
  - `Front`
  - `Detail`
- Interactive callouts with arrows that stay attached to model parts during rotate/zoom.

## Tech stack

- [Nuxt 4](https://nuxt.com/)
- [TresJS](https://tresjs.org/) (`@tresjs/nuxt`, `@tresjs/core`, `@tresjs/cientos`)
- [Three.js](https://threejs.org/) (via TresJS)
- Vue 3 Composition API

## Getting started

### Install

```bash
npm install
```

### Run development server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## User interaction

- Drag to orbit around the connector.
- Scroll / trackpad pinch to zoom.
- Use mode pills to switch between product, exploded, and wireframe views.
- Use preset pills to jump to camera framing modes.
- Click callouts to focus/highlight connector parts.

## Project structure

```text
app/
  components/usb/
    UsbSectionCanvas.vue
    UsbTypeAFourWire.vue
    UsbTypeAEightWire.vue
    UsbTypeBFourWire.vue
    UsbTypeBEightWire.vue
    UsbTypeC.vue
  composables/
    useExplodeAnimation.ts
  data/
    usb-cheat-connectors.ts
  pages/
    index.vue
  utils/
    usbIsometric.ts
    usbMaterials.ts
```

## Connector modeling approach

- Each USB type is an isolated component in `app/components/usb/`.
- Models use TresJS primitives (`TresMesh`, `TresBoxGeometry`, etc.).
- Materials are controlled by `app/utils/usbMaterials.ts`.
- Exploded transitions are controlled with `useExplodeAnimation`.

## Pin-locked callout system

This app uses live anchor projection to keep arrow endpoints attached to real connector geometry:

1. Each connector component registers named anchor `Object3D` nodes.
2. `UsbSectionCanvas` projects anchor world positions every render frame.
3. `index.vue` maps projected points to SVG leader lines and HTML callout rails.
4. Callouts bind to stable `anchorKey` values from `usb-cheat-connectors.ts`.

Result: arrows track correctly during orbit, zoom, and mode switches.

## Notes

- This is a stylized educational visualization, not CAD-accurate manufacturing geometry.
- Source reference for terminology and pin families: [USB Cheat Sheet](https://fabiensanglard.net/usbcheat/index.html).
- Footer attribution is included in the app UI for Cursor CLI and TresJS.

## Known issues / future improvements

- Add occlusion-aware callout behavior so hidden/back-facing anchors can fade or hide.
- Add smarter callout collision handling for very small viewports.
- Improve code-splitting for large client bundle warnings in production builds.
- Add automated visual regression tests for callout attachment stability.
- Add optional connector dimension overlays and mode-specific legends.
