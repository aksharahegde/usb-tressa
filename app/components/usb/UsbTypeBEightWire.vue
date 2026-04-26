<template>
  <TresGroup>
    <TresMesh :position="[0, 6, Z(1.8, -0.38)]">
      <TresBoxGeometry :args="[12.5, 0.95, 8.5]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, -6, Z(1.8, -0.38)]">
      <TresBoxGeometry :args="[12.5, 0.95, 8.5]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[-5.85, 0, Z(1.8, -0.38)]">
      <TresBoxGeometry :args="[0.95, 11.1, 8.5]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[5.85, 0, Z(1.8, -0.38)]">
      <TresBoxGeometry :args="[0.95, 11.1, 8.5]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, 0, Z(-2.5, -1.12)]">
      <TresBoxGeometry :args="[12.5, 12.5, 0.95]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, 0, Z(4.2, 0.52)]">
      <TresBoxGeometry :args="[7.5, 7, 7]" />
      <TresMeshStandardMaterial v-bind="mat('insulator', 'insulator')" />
    </TresMesh>
    <TresMesh
      v-for="(p, i) in mainPins"
      :key="'m' + i"
      :position="[p[0], p[1], Z(6.2, 1.05)]"
    >
      <TresBoxGeometry :args="[1.1, 0.14, 2.2]" />
      <TresMeshStandardMaterial v-bind="mat('contact', 'contact')" />
    </TresMesh>
    <TresMesh
      v-for="(x, i) in ssRow"
      :key="'s' + i"
      :position="[x, -2.2, Z(4.5, 0.28)]"
    >
      <TresBoxGeometry :args="[0.6, 0.12, 1.6]" />
      <TresMeshStandardMaterial v-bind="mat('contact', 'contact')" />
    </TresMesh>
    <TresMesh :position="[0, 2.8, Z(6.8, 0.78)]">
      <TresBoxGeometry :args="[9, 0.55, 3.5]" />
      <TresMeshStandardMaterial v-bind="mat('mold', 'mold')" />
    </TresMesh>
    <TresGroup :ref="setAnchorRef('b8_legacy')" :position="[-2.4, 2, Z(6.2, 1.05)]" />
    <TresGroup :ref="setAnchorRef('b8_sstx')" :position="[-3.6, -2.2, Z(4.5, 0.28)]" />
    <TresGroup :ref="setAnchorRef('b8_ssrx')" :position="[3.6, -2.2, Z(4.5, 0.28)]" />
    <TresGroup :ref="setAnchorRef('b8_gnd_drain')" :position="[0, 0, Z(-2.5, -1.12)]" />
    <TresGroup :ref="setAnchorRef('b8_9pin')" :position="[0, 2.8, Z(6.8, 0.78)]" />
  </TresGroup>
</template>

<script setup lang="ts">
import type { UsbPartTone, UsbRenderMode } from '~/utils/usbMaterials'
import { usbMaterial } from '~/utils/usbMaterials'

const props = withDefaults(
  defineProps<{
    mode?: UsbRenderMode
    explodeProgress?: number
    explodeDistance?: number
    highlightPart?: string
    collectAnchor?: (key: string, obj: object | null) => void
  }>(),
  { mode: 'product', explodeProgress: 0, explodeDistance: 3.6, highlightPart: '', collectAnchor: undefined }
)

const mainPins: [number, number][] = [
  [-2.4, 2],
  [2.4, 2],
  [-2.4, -2],
  [2.4, -2]
]
const ssRow = [-3.6, -1.8, 0, 1.8, 3.6]

function Z(base: number, spread: number) {
  return base + spread * props.explodeDistance * props.explodeProgress
}

function mat(part: string, tone: UsbPartTone) {
  return usbMaterial(props.mode, tone, props.highlightPart === part)
}

const anchorKeys = ['b8_legacy', 'b8_sstx', 'b8_ssrx', 'b8_gnd_drain', 'b8_9pin'] as const

function setAnchorRef(key: (typeof anchorKeys)[number]) {
  return (obj: object | null) => {
    props.collectAnchor?.(key, obj)
  }
}

onBeforeUnmount(() => {
  for (const key of anchorKeys) {
    props.collectAnchor?.(key, null)
  }
})
</script>
