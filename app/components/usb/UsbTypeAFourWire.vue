<template>
  <TresGroup>
    <TresMesh :position="[0, 3.2, Z(2, -0.38)]">
      <TresBoxGeometry :args="[16, 0.8, 8]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, -3.2, Z(2, -0.38)]">
      <TresBoxGeometry :args="[16, 0.8, 8]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[-7.2, 0, Z(2, -0.38)]">
      <TresBoxGeometry :args="[1.2, 6.4, 8]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[7.2, 0, Z(2, -0.38)]">
      <TresBoxGeometry :args="[1.2, 6.4, 8]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, 0, Z(-2, -1.15)]">
      <TresBoxGeometry :args="[16, 8, 0.8]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, 0, Z(4.2, 0.52)]">
      <TresBoxGeometry :args="[9.5, 1.8, 7.2]" />
      <TresMeshStandardMaterial v-bind="mat('insulator', 'insulator')" />
    </TresMesh>
    <TresMesh
      v-for="(x, i) in pinXs"
      :key="i"
      :position="[x, 0.95, Z(5.2, 1.05)]"
    >
      <TresBoxGeometry :args="[1.1, 0.15, 2.2]" />
      <TresMeshStandardMaterial v-bind="mat('contact', 'contact')" />
    </TresMesh>
    <TresGroup :ref="setAnchorRef('a4_vbus')" :position="[-3.2, 0.95, Z(5.2, 1.05)]" />
    <TresGroup :ref="setAnchorRef('a4_dpdm')" :position="[-1.05, 0.95, Z(5.2, 1.05)]" />
    <TresGroup :ref="setAnchorRef('a4_gnd')" :position="[3.2, 0.95, Z(5.2, 1.05)]" />
    <TresGroup :ref="setAnchorRef('a4_cable')" :position="[0, 0, Z(-2, -1.15)]" />
    <TresGroup :ref="setAnchorRef('a4_no_ss')" :position="[0, 0, Z(4.2, 0.52)]" />
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

const pinXs = [-3.2, -1.05, 1.05, 3.2]

function Z(base: number, spread: number) {
  return base + spread * props.explodeDistance * props.explodeProgress
}

function mat(part: string, tone: UsbPartTone) {
  return usbMaterial(props.mode, tone, props.highlightPart === part)
}

const anchorKeys = ['a4_vbus', 'a4_dpdm', 'a4_gnd', 'a4_cable', 'a4_no_ss'] as const

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
