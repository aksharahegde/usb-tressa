# USB Pin-Anchor Tracking Plan

## Goal

Make every callout arrow stay attached to the exact pin/component it represents while users rotate or zoom the model.

## Problem Summary

Current callouts use static/approximate anchor coordinates. Even with camera projection updates, arrows can drift because anchor sources are not tied to exact geometry points in the component tree.

## Target Behavior

- Each label points to a specific physical pin/component.
- Arrow endpoints update every render frame based on current camera and object transform.
- Works across all modes (`product`, `exploded`, `wireframe`) and all camera presets.
- Keeps working during interactive `OrbitControls` rotation/zoom/pan.

## Architecture

1. **Component-local anchor objects**
   - Each USB component exposes named anchor points (`Object3D`) placed at exact target locations.
   - Anchor names align with annotation labels/keys.

2. **Section-level anchor registry**
   - Parent section collects anchors for the active connector instance.
   - Registry maps `anchorKey -> Object3D`.

3. **Frame projection pipeline**
   - On each render tick:
     - get anchor world position
     - project to NDC via active camera
     - convert to overlay percentage coordinates
     - update arrow endpoints and optional label y-clamp

4. **Overlay rendering**
   - SVG polyline uses dynamic projected endpoint.
   - HTML rails remain bounded; leader lines point to projected endpoints.

## Data Model Changes

### Annotation schema extension

In `app/data/usb-cheat-connectors.ts`, extend `UsbAnnotation`:

- `anchorKey: string` (stable technical key, not label text)
- keep `label`, `detail`, `side`, `preset`, `primary`, etc.

Example:

```ts
{
  anchorKey: 'a4_vbus',
  label: 'VBUS',
  detail: '+5V power rail',
  side: 'left',
  primary: true,
  preset: 'detail'
}
```

### Anchor map contract

Each connector component must define:

```ts
type AnchorMap = Record<string, Object3D>
```

Anchor keys must match `anchorKey` values in the data file.

## Component API Strategy

Use a lightweight anchor callback prop from page -> component:

- prop: `collectAnchor?: (key: string, obj: Object3D | null) => void`

Each component registers anchors on mount and unregisters on unmount.

Why this approach:
- avoids deep ref traversal
- works with remounts when mode changes
- avoids exposing entire scene graph

## Implementation Steps

### Phase 1: Data + types

1. Update `UsbAnnotation` with `anchorKey`.
2. Replace label-based matching with `anchorKey` matching.
3. Verify all annotations in all connector sections have unique, valid keys.

### Phase 2: Anchor registration plumbing

1. In page state, create per-section anchor registry:
   - `anchorRegistry[id]: Record<string, Object3D>`
2. Add `collectAnchor` callback per section and pass to active connector component.
3. Handle cleanup on remount/mode switch.

### Phase 3: Add anchors in each USB component

For each component file:
- `UsbTypeAFourWire.vue`
- `UsbTypeAEightWire.vue`
- `UsbTypeBFourWire.vue`
- `UsbTypeBEightWire.vue`
- `UsbTypeC.vue`

Tasks:
1. Add hidden/neutral anchor nodes at exact pin/component points:
   - power pin group
   - data pin group
   - SS TX/RX groups where relevant
   - CC/SBU for Type-C
2. Register each node with `collectAnchor(anchorKey, object)`.

Note:
- anchors should be children of the same moving group as the meshes
- this ensures explode transforms are naturally inherited

### Phase 4: Projection engine

1. In `UsbSectionCanvas.vue`, keep render callback.
2. Pass current camera to parent render projection helper or emit update event.
3. For each registered anchor:
   - `obj.getWorldPosition(v)`
   - `v.project(camera)`
   - `x = (v.x * 0.5 + 0.5) * 100`
   - `y = (-v.y * 0.5 + 0.5) * 100`
4. Store `visible` state from clip range check.

### Phase 5: Overlay binding

1. `diagramItems()` reads projected endpoint by `anchorKey` (not label).
2. If anchor unavailable, fallback to safe default endpoint.
3. Optionally hide line/label when `visible === false`.

### Phase 6: Robustness + UX polish

1. Clamp rail label slots so they don't overflow frame.
2. Keep leader endpoints dynamic but labels in bounded rails.
3. Ensure no duplicate marker ids across repeated sections.

## Validation Plan

### Functional checks

For each connector:
1. Enter `Product` mode, rotate 360°, zoom in/out:
   - arrows remain attached to intended target
2. Switch to `Exploded`:
   - anchors move with exploded parts
3. Switch to `Wireframe` and back:
   - attachments remain stable
4. Change camera preset:
   - endpoints update instantly, no stale lines

### Edge cases

- rapid mode toggling
- fast orbit drag + zoom wheel
- small viewport where rails hide
- section rerender/remount

### Build checks

- `npx nuxt build`
- no runtime warnings about unresolved refs

## Acceptance Criteria

- No visible arrow drift during interaction.
- Every annotation corresponds to one stable anchor key.
- Type-C callouts attach to intended pin groups (VBUS/GND/D+/D-/SS/CC/SBU).
- Works consistently across all 5 connector sections and all 3 render modes.

## Out of Scope (this pass)

- Occlusion-aware hiding when anchor is behind solid geometry.
- Automatic label collision solver library integration.
- Full 3D text labels inside scene.

## Risks and Mitigations

1. **Risk:** anchor keys mismatch data.
   - **Mitigation:** centralize key constants or strict naming table.

2. **Risk:** remount clears anchors unexpectedly.
   - **Mitigation:** unregister on unmount and re-register on mount via callback.

3. **Risk:** performance drop from per-frame projection.
   - **Mitigation:** only project visible section anchors; anchor count is small.

## Execution Order

1. Data schema + anchor keys
2. Parent anchor registry + callback plumbing
3. Component anchor insertion (A4, A8, B4, B8, C)
4. Projection update + overlay binding
5. QA and build verification

