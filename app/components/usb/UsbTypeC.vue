<template>
  <TresGroup>
    <TresMesh :position="[0, shellTopY, Z(shellZ, -0.42)]">
      <TresBoxGeometry :args="[OUTER_W, SHELL_T, shellDepth]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, shellBotY, Z(shellZ, -0.42)]">
      <TresBoxGeometry :args="[OUTER_W, SHELL_T, shellDepth]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[shellLeftX, 0, Z(shellZ, -0.42)]">
      <TresBoxGeometry :args="[SHELL_T, OUTER_H, shellDepth]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[shellRightX, 0, Z(shellZ, -0.42)]">
      <TresBoxGeometry :args="[SHELL_T, OUTER_H, shellDepth]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, 0, Z(bezelZ, -0.08)]">
      <TresBoxGeometry :args="[OUTER_W + 0.2, OUTER_H + 0.15, SHELL_T]" />
      <TresMeshStandardMaterial v-bind="mat('shell', 'shell')" />
    </TresMesh>
    <TresMesh :position="[0, 0, Z(cavityZ, 0.18)]">
      <TresBoxGeometry :args="[OPENING_W * 0.94, OPENING_H * 0.28, MATING_DEPTH * 0.8]" />
      <TresMeshStandardMaterial v-bind="mat('insulator', 'insulator')" />
    </TresMesh>
    <TresMesh
      v-for="(x, i) in contactXs"
      :key="'a' + i"
      :position="[x, contactTopY, Z(contactZ, 0.55)]"
    >
      <TresBoxGeometry :args="[PAD_W, PAD_H, PAD_D]" />
      <TresMeshStandardMaterial v-bind="mat('contact', 'contact')" />
    </TresMesh>
    <TresMesh
      v-for="(x, i) in contactXs"
      :key="'b' + i"
      :position="[x, contactBotY, Z(contactZ, 0.38)]"
    >
      <TresBoxGeometry :args="[PAD_W, PAD_H, PAD_D]" />
      <TresMeshStandardMaterial v-bind="mat('contact', 'contact')" />
    </TresMesh>
    <TresMesh :position="[0, 0, Z(moldZ, -1.05)]">
      <TresBoxGeometry :args="[OUTER_W + 1.2, OUTER_H + 1.4, moldDepth]" />
      <TresMeshStandardMaterial v-bind="mat('mold', 'mold')" />
    </TresMesh>
    <TresGroup :ref="setAnchorRef('c_vbus')" :position="[-1.25, contactTopY, Z(contactZ, 0.55)]" />
    <TresGroup :ref="setAnchorRef('c_gnd')" :position="[shellLeftX, 0, Z(shellZ, -0.42)]" />
    <TresGroup :ref="setAnchorRef('c_dpdm')" :position="[0, contactTopY, Z(contactZ, 0.55)]" />
    <TresGroup :ref="setAnchorRef('c_ss')" :position="[2.25, contactBotY, Z(contactZ, 0.38)]" />
    <TresGroup :ref="setAnchorRef('c_cc')" :position="[1.4, contactBotY, Z(contactZ, 0.38)]" />
    <TresGroup :ref="setAnchorRef('c_sbu')" :position="[3.1, contactBotY, Z(contactZ, 0.38)]" />
  </TresGroup>
</template>

<script setup lang="ts">
import type { UsbPartTone, UsbRenderMode } from '~/utils/usbMaterials'
import { usbMaterial } from '~/utils/usbMaterials'

const OPENING_W = 8.34
const OPENING_H = 2.56
const MATING_DEPTH = 4.7
const PITCH = 0.5
const N_POS = 12

const SHELL_MARGIN = 1.05
const OUTER_W = OPENING_W + 2 * SHELL_MARGIN
const OUTER_H = OPENING_H + 2 * SHELL_MARGIN
const SHELL_T = 0.42

const shellDepth = 11.5
const shellZ = -4.2
const shellTopY = OUTER_H / 2 - SHELL_T / 2
const shellBotY = -OUTER_H / 2 + SHELL_T / 2
const shellLeftX = -OUTER_W / 2 + SHELL_T / 2
const shellRightX = OUTER_W / 2 - SHELL_T / 2

const bezelZ = 0.35
const cavityZ = -MATING_DEPTH / 2 + 0.35

const contactXs = Array.from({ length: N_POS }, (_, i) => -(N_POS - 1) * 0.5 * PITCH + i * PITCH)

const contactTopY = OPENING_H * 0.5 - 0.16
const contactBotY = -OPENING_H * 0.5 + 0.16
const contactZ = -MATING_DEPTH * 0.22

const PAD_W = PITCH * 0.62
const PAD_H = 0.08
const PAD_D = 0.74

const moldDepth = 4.2
const moldZ = shellZ - shellDepth * 0.5 - moldDepth * 0.5 - 0.35

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

const anchorKeys = ['c_vbus', 'c_gnd', 'c_dpdm', 'c_ss', 'c_cc', 'c_sbu'] as const

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
