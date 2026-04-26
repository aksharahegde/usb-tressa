<template>
  <TresGroup>
    <TresMesh :position="[0, 5.2, Z(1.5, -0.36)]">
      <TresBoxGeometry :args="[11, 0.9, 7]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, -5.2, Z(1.5, -0.36)]">
      <TresBoxGeometry :args="[11, 0.9, 7]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[-5.2, 0, Z(1.5, -0.36)]">
      <TresBoxGeometry :args="[0.9, 9.4, 7]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[5.2, 0, Z(1.5, -0.36)]">
      <TresBoxGeometry :args="[0.9, 9.4, 7]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, 0, Z(-2, -1.05)]">
      <TresBoxGeometry :args="[11, 11, 0.9]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, 0, Z(3.8, 0.48)]">
      <TresBoxGeometry :args="[6.5, 5.5, 5.5]" />
      <TresMeshStandardMaterial v-bind="mat('insulator', 'insulator')" />
    </TresMesh>
    <TresMesh :position="[-2.2, 1.4, Z(5.6, 1)]">
      <TresBoxGeometry :args="[1.3, 0.18, 2]" />
      <TresMeshStandardMaterial v-bind="mat('contact', 'contact')" />
    </TresMesh>
    <TresMesh :position="[2.2, 1.4, Z(5.6, 1)]">
      <TresBoxGeometry :args="[1.3, 0.18, 2]" />
      <TresMeshStandardMaterial v-bind="mat('contact', 'contact')" />
    </TresMesh>
    <TresMesh :position="[-2.2, -1.4, Z(5.6, 1)]">
      <TresBoxGeometry :args="[1.3, 0.18, 2]" />
      <TresMeshStandardMaterial v-bind="mat('contact', 'contact')" />
    </TresMesh>
    <TresMesh :position="[2.2, -1.4, Z(5.6, 1)]">
      <TresBoxGeometry :args="[1.3, 0.18, 2]" />
      <TresMeshStandardMaterial v-bind="mat('contact', 'contact')" />
    </TresMesh>
    <TresGroup :ref="setAnchorRef('b4_vbus')" :position="[-2.2, 1.4, Z(5.6, 1)]" />
    <TresGroup :ref="setAnchorRef('b4_dpdm')" :position="[0, 0, Z(5.6, 1)]" />
    <TresGroup :ref="setAnchorRef('b4_gnd')" :position="[2.2, -1.4, Z(5.6, 1)]" />
    <TresGroup :ref="setAnchorRef('b4_4pin')" :position="[0, 0, Z(1.5, -0.36)]" />
    <TresGroup :ref="setAnchorRef('b4_usb2_only')" :position="[0, 0, Z(3.8, 0.48)]" />
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

function Z(base: number, spread: number) {
  return base + spread * props.explodeDistance * props.explodeProgress
}

function mat(part: string, tone: UsbPartTone) {
  return usbMaterial(props.mode, tone, props.highlightPart === part)
}

const anchorKeys = ['b4_vbus', 'b4_dpdm', 'b4_gnd', 'b4_4pin', 'b4_usb2_only'] as const

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
