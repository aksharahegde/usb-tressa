<template>
  <TresGroup>
    <TresMesh :position="[0, 3.4, Z(2, -0.4)]">
      <TresBoxGeometry :args="[16.5, 0.8, 9]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, -3.4, Z(2, -0.4)]">
      <TresBoxGeometry :args="[16.5, 0.8, 9]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[-7.55, 0, Z(2, -0.4)]">
      <TresBoxGeometry :args="[1.2, 6.8, 9]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[7.55, 0, Z(2, -0.4)]">
      <TresBoxGeometry :args="[1.2, 6.8, 9]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, 0, Z(-2.5, -1.2)]">
      <TresBoxGeometry :args="[16.5, 8.5, 0.8]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, 0, Z(4.5, 0.55)]">
      <TresBoxGeometry :args="[11.5, 2.2, 8.5]" />
      <TresMeshStandardMaterial v-bind="mat('insulator', 'insulator')" />
    </TresMesh>
    <TresMesh
      v-for="(x, i) in mainPins"
      :key="'m' + i"
      :position="[x, 1.05, Z(5.5, 1.08)]"
    >
      <TresBoxGeometry :args="[1, 0.12, 2.4]" />
      <TresMeshStandardMaterial v-bind="mat('contact', 'contact')" />
    </TresMesh>
    <TresMesh
      v-for="(x, i) in ssPins"
      :key="'s' + i"
      :position="[x, -0.85, Z(3.8, 0.22)]"
    >
      <TresBoxGeometry :args="[0.65, 0.12, 1.8]" />
      <TresMeshStandardMaterial v-bind="mat('contact', 'contact')" />
    </TresMesh>
    <TresMesh :position="[0, -1.4, Z(6.2, 0.82)]">
      <TresBoxGeometry :args="[12, 0.5, 3.2]" />
      <TresMeshStandardMaterial v-bind="mat('mold', 'mold')" />
    </TresMesh>
    <TresGroup :ref="setAnchorRef('a8_legacy')" :position="[-1.15, 1.05, Z(5.5, 1.08)]" />
    <TresGroup :ref="setAnchorRef('a8_sstx')" :position="[4.2, -0.85, Z(3.8, 0.22)]" />
    <TresGroup :ref="setAnchorRef('a8_ssrx')" :position="[-4.2, -0.85, Z(3.8, 0.22)]" />
    <TresGroup :ref="setAnchorRef('a8_gnd_drain')" :position="[0, 0, Z(-2.5, -1.2)]" />
    <TresGroup :ref="setAnchorRef('a8_9pin')" :position="[0, -1.4, Z(6.2, 0.82)]" />
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

const mainPins = [-3.4, -1.15, 1.15, 3.4]
const ssPins = [-4.2, -2.1, 0, 2.1, 4.2]

function Z(base: number, spread: number) {
  return base + spread * props.explodeDistance * props.explodeProgress
}

function mat(part: string, tone: UsbPartTone) {
  return usbMaterial(props.mode, tone, props.highlightPart === part)
}

const anchorKeys = ['a8_legacy', 'a8_sstx', 'a8_ssrx', 'a8_gnd_drain', 'a8_9pin'] as const

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
