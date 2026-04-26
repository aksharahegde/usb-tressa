<template>
  <div class="blueprint">
    <header class="hero">
      <h1 class="hero-title">USB connector presentation</h1>
      <p class="hero-lede">
        User-facing product views with guided camera states and optional exploded analysis,
        based on the
        <a href="https://fabiensanglard.net/usbcheat/index.html" target="_blank" rel="noopener noreferrer">USB Cheat Sheet</a>.
      </p>
    </header>

    <main>
      <section
        v-for="item in usbCheatConnectors"
        :id="`usb-${item.id}`"
        :key="item.id"
        class="usb-section"
      >
        <div class="section-grid">
          <div class="section-copy">
            <p class="section-kicker">{{ item.wires }}-wire cable</p>
            <h2 class="section-title">{{ item.title }}</h2>
            <p class="section-note">{{ item.note }}</p>

            <div class="control-row" role="group" aria-label="Render mode">
              <button
                v-for="mode in modes"
                :key="mode"
                class="control-btn"
                :class="{ active: ui[item.id].mode === mode }"
                @click="setMode(item.id, mode)"
              >
                {{ modeLabels[mode] }}
              </button>
            </div>

            <div class="control-row" role="group" aria-label="Camera preset">
              <button
                v-for="preset in presets"
                :key="preset"
                class="control-btn"
                :class="{ active: ui[item.id].preset === preset }"
                @click="ui[item.id].preset = preset"
              >
                {{ presetLabels[preset] }}
              </button>
            </div>

            <ul class="callouts" aria-label="Part callouts">
              <li
                v-for="(ann, j) in visibleAnnotations(item.id, item.annotations)"
                :key="`${item.id}-${j}-${ann.label}`"
                :class="['callout', ann.side === 'left' ? 'callout-left' : 'callout-right', { active: ui[item.id].activePart === ann.part }]"
                @click="focusAnnotation(item.id, ann.part, ann.preset)"
              >
                <span class="callout-label">{{ ann.label }}</span>
                <span class="callout-detail">{{ ann.detail }}</span>
              </li>
            </ul>
          </div>

          <div class="section-visual">
            <div class="visual-frame">
              <UsbSectionCanvas
                :preset="ui[item.id].preset"
                :anchor-objects="anchorObjects[item.id] ?? {}"
                @anchors-update="updateProjected(item.id, $event)"
              >
                <component
                  :key="`${item.id}-${ui[item.id].mode}-${ui[item.id].activePart}`"
                  :is="connectorById[item.id]"
                  :mode="ui[item.id].mode"
                  :explode-progress="explodeProgress[item.id].value"
                  :highlight-part="ui[item.id].activePart"
                  :collect-anchor="(key, obj) => collectAnchor(item.id, key, obj)"
                />
              </UsbSectionCanvas>
              <svg class="diagram-overlay" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <defs>
                  <marker :id="`arrowHead-${item.id}`" markerWidth="6" markerHeight="6" refX="5.2" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 z" fill="rgba(30, 30, 34, 0.7)" />
                  </marker>
                </defs>
                <g v-for="(line, i) in diagramItems(item.id, item.annotations)" :key="`${item.id}-line-${i}`">
                  <polyline
                    :points="`${line.x1},${line.y} ${line.x2},${line.y} ${line.x3},${line.yEnd}`"
                    class="diagram-stroke"
                    :marker-end="`url(#arrowHead-${item.id})`"
                  />
                </g>
              </svg>
              <div class="diagram-rail diagram-rail-left">
                <div
                  v-for="(line, i) in diagramItems(item.id, item.annotations).filter(x => x.side === 'left')"
                  :key="`${item.id}-left-label-${i}`"
                  class="diagram-chip"
                  :style="{ top: `${line.y}%` }"
                >
                  <span class="diagram-label">{{ line.label }}</span>
                  <span class="diagram-detail">{{ line.detail }}</span>
                </div>
              </div>
              <div class="diagram-rail diagram-rail-right">
                <div
                  v-for="(line, i) in diagramItems(item.id, item.annotations).filter(x => x.side === 'right')"
                  :key="`${item.id}-right-label-${i}`"
                  class="diagram-chip"
                  :style="{ top: `${line.y}%` }"
                >
                  <span class="diagram-label">{{ line.label }}</span>
                  <span class="diagram-detail">{{ line.detail }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div class="scroll-rail" aria-hidden="true">
      <div class="scroll-rail-track" />
      <div class="scroll-rail-fill" :style="{ height: scrollPct + '%' }" />
    </div>

    <footer class="site-footer">
      <p>
        Built with Cursor CLI by
        <a href="https://www.aksharahegde.xyz" target="_blank" rel="noopener noreferrer">Akshara Hegde</a>
        · Built using
        <a href="https://tresjs.org/" target="_blank" rel="noopener noreferrer">TresJS</a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { Object3D } from 'three'
import type { Component, Ref } from 'vue'
import { useWindowScroll, useWindowSize } from '@vueuse/core'
import UsbSectionCanvas from '~/components/usb/UsbSectionCanvas.vue'
import UsbTypeAEightWire from '~/components/usb/UsbTypeAEightWire.vue'
import UsbTypeAFourWire from '~/components/usb/UsbTypeAFourWire.vue'
import UsbTypeBEightWire from '~/components/usb/UsbTypeBEightWire.vue'
import UsbTypeBFourWire from '~/components/usb/UsbTypeBFourWire.vue'
import UsbTypeC from '~/components/usb/UsbTypeC.vue'
import { useExplodeAnimation } from '~/composables/useExplodeAnimation'
import { usbCheatConnectors, type UsbAnnotation } from '~/data/usb-cheat-connectors'
import type { UsbRenderMode } from '~/utils/usbMaterials'
import type { UsbCameraPreset } from '~/utils/usbIsometric'

const connectorById: Record<string, Component> = {
  a4: UsbTypeAFourWire,
  a8: UsbTypeAEightWire,
  b4: UsbTypeBFourWire,
  b8: UsbTypeBEightWire,
  c: UsbTypeC
}

const modes: UsbRenderMode[] = ['product', 'exploded', 'wireframe']
const presets: UsbCameraPreset[] = ['isometric', 'front', 'detail']

const modeLabels: Record<UsbRenderMode, string> = {
  product: 'Product',
  exploded: 'Exploded',
  wireframe: 'Wireframe'
}

const presetLabels: Record<UsbCameraPreset, string> = {
  isometric: 'Isometric',
  front: 'Front',
  detail: 'Detail'
}

const anchorObjects = reactive(
  Object.fromEntries(usbCheatConnectors.map(item => [item.id, {}])) as Record<string, Record<string, Object3D>>
)

const projectedAnchors = reactive(
  Object.fromEntries(usbCheatConnectors.map(item => [item.id, {}])) as Record<string, Record<string, { x: number; y: number; visible: boolean }>>
)

const ui = reactive(
  Object.fromEntries(
    usbCheatConnectors.map(item => [item.id, {
      mode: 'product' as UsbRenderMode,
      preset: 'isometric' as UsbCameraPreset,
      activePart: ''
    }])
  ) as Record<string, { mode: UsbRenderMode; preset: UsbCameraPreset; activePart: string }>
)

const explodeTargets = reactive(
  Object.fromEntries(usbCheatConnectors.map(item => [item.id, 0])) as Record<string, number>
)

const explodeProgress = Object.fromEntries(
  usbCheatConnectors.map(item => [item.id, useExplodeAnimation(toRef(explodeTargets, item.id))])
) as Record<string, Ref<number>>

function setMode(id: string, mode: UsbRenderMode) {
  ui[id].mode = mode
  explodeTargets[id] = mode === 'exploded' ? 1 : 0
  if (mode === 'wireframe') {
    ui[id].preset = 'isometric'
  }
}

function focusAnnotation(id: string, part: string, preset?: UsbCameraPreset) {
  ui[id].activePart = ui[id].activePart === part ? '' : part
  if (preset) {
    ui[id].preset = preset
  }
}

function visibleAnnotations(id: string, annotations: UsbAnnotation[]) {
  const active = ui[id].activePart
  if (!active) {
    return annotations.filter(ann => ann.primary)
  }
  return annotations
}

function diagramItems(id: string, annotations: UsbAnnotation[]) {
  const lines = visibleAnnotations(id, annotations)
  const left = lines.filter(ann => ann.side === 'left')
  const right = lines.filter(ann => ann.side === 'right')
  const pack = (items: UsbAnnotation[], side: 'left' | 'right') => items.map((ann, idx) => {
    const yStart = 14
    const yEnd = 82
    const step = items.length > 1 ? (yEnd - yStart) / (items.length - 1) : 0
    const y = yStart + idx * step
    const leftSide = side === 'left'
    return {
      ...ann,
      side,
      y,
      yEnd: projectedAnchors[id]?.[ann.anchorKey]?.y ?? (36 + idx * (28 / Math.max(1, items.length - 1))),
      x1: leftSide ? 7 : 93,
      x2: leftSide ? 24 : 76,
      x3: projectedAnchors[id]?.[ann.anchorKey]?.x ?? (leftSide ? 44 : 56)
    }
  })

  return [...pack(left, 'left'), ...pack(right, 'right')]
}

function updateProjected(id: string, projected: Record<string, { x: number; y: number; visible: boolean }>) {
  projectedAnchors[id] = projected
}

function collectAnchor(id: string, key: string, obj: Object3D | null) {
  if (!obj) {
    delete anchorObjects[id][key]
    return
  }
  anchorObjects[id][key] = obj
}

const { y: scrollY } = useWindowScroll()
const { height: winH } = useWindowSize()

const scrollPct = computed(() => {
  if (!import.meta.client) {
    return 0
  }
  const doc = document.documentElement
  const max = Math.max(1, doc.scrollHeight - winH.value)
  return Math.min(100, Math.round((scrollY.value / max) * 100))
})
</script>

<style scoped>
.blueprint {
  min-height: 100vh;
  background: #d6d1cb;
  color: #1e1e22;
  position: relative;
  padding-bottom: 4rem;
}

.hero {
  max-width: 46rem;
  padding: 2.25rem 1.75rem 1.5rem;
  margin: 0 auto;
}

.hero-title {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 750;
  letter-spacing: -0.03em;
}

.hero-lede {
  margin: 0.75rem 0 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #3a3a40;
}

.hero-lede a {
  color: #1e1e22;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.usb-section {
  scroll-margin-top: 1.25rem;
  padding: 2.5rem 1.25rem;
  border-top: 1px solid rgba(30, 30, 34, 0.14);
}

.section-grid {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  gap: 1.75rem;
  align-items: start;
}

@media (min-width: 900px) {
  .section-grid {
    grid-template-columns: minmax(18rem, 1fr) minmax(0, 1.45fr);
    gap: 2.5rem;
  }
}

.section-kicker {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5a564f;
}

.section-title {
  margin: 0.35rem 0 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.section-note {
  margin: 0.6rem 0 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #3a3a40;
}

.control-row {
  margin-top: 0.8rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.control-btn {
  border: 1px solid rgba(30, 30, 34, 0.25);
  background: rgba(255, 255, 255, 0.45);
  color: #1e1e22;
  border-radius: 999px;
  padding: 0.32rem 0.66rem;
  font-size: 0.73rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
}

.control-btn.active {
  background: #1e1e22;
  color: #eef0f5;
  border-color: #1e1e22;
}

.callouts {
  list-style: none;
  margin: 1.15rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.callout {
  padding: 0.45rem 0 0.45rem 1.05rem;
  border-left: 1px solid rgba(30, 30, 34, 0.45);
  cursor: pointer;
}

.callout-right {
  border-left: none;
  border-right: 1px solid rgba(30, 30, 34, 0.45);
  padding-left: 0;
  padding-right: 1.05rem;
  text-align: right;
}

.callout.active {
  border-color: #1e1e22;
  background: rgba(255, 255, 255, 0.32);
}

.callout-label {
  display: block;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.callout-detail {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.79rem;
  line-height: 1.32;
  color: #4a4742;
}

@media (max-width: 899px) {
  .callout-right {
    border-right: none;
    border-left: 1px solid rgba(30, 30, 34, 0.45);
    padding-right: 0;
    padding-left: 1.05rem;
    text-align: left;
  }
}

.scroll-rail {
  position: fixed;
  right: 1rem;
  bottom: 1.25rem;
  width: 6px;
  height: 4.5rem;
  z-index: 10;
  border-radius: 999px;
  background: rgba(30, 30, 34, 0.12);
  overflow: hidden;
}

.scroll-rail-track {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(to bottom, transparent 0, transparent 5px, rgba(30, 30, 34, 0.08) 5px, rgba(30, 30, 34, 0.08) 6px);
}

.scroll-rail-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1e1e22;
  border-radius: 999px;
  transition: height 0.12s ease-out;
}

.visual-frame {
  position: relative;
  overflow: hidden;
}

.diagram-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.diagram-stroke {
  fill: none;
  stroke: rgba(30, 30, 34, 0.32);
  stroke-width: 0.34;
  vector-effect: non-scaling-stroke;
}

.diagram-rail {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 22%;
  pointer-events: none;
  z-index: 2;
}

.diagram-rail-left {
  left: 0.7%;
}

.diagram-rail-right {
  right: 0.7%;
}

.diagram-chip {
  position: absolute;
  transform: translateY(-50%);
  max-width: 100%;
}

.diagram-rail-right .diagram-chip {
  text-align: right;
}

.diagram-label {
  display: block;
  color: rgba(30, 30, 34, 0.96);
  font-size: clamp(9px, 0.62vw, 11px);
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.05;
  text-transform: uppercase;
  white-space: normal;
  word-break: break-word;
}

.diagram-detail {
  display: block;
  margin-top: 1px;
  color: rgba(58, 56, 53, 0.92);
  font-size: clamp(8px, 0.56vw, 10px);
  line-height: 1.12;
  white-space: normal;
  word-break: break-word;
}

@media (max-width: 899px) {
  .diagram-overlay,
  .diagram-rail {
    display: none;
  }
}

.site-footer {
  padding: 1rem 1.25rem 1.5rem;
  text-align: center;
  font-size: 0.78rem;
  color: #4a4742;
}

.site-footer a {
  color: #1e1e22;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
