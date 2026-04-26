<template>
  <div ref="wrap" class="usb-section-canvas">
    <TresCanvas :clear-color="clearColor" @render="onCanvasRender">
      <TresOrthographicCamera
        ref="cameraRef"
        :args="orthoArgs"
      />
      <OrbitControls
        :enable-damping="true"
        :damping-factor="0.08"
        :min-distance="40"
        :max-distance="220"
        :min-polar-angle="0.01"
        :max-polar-angle="3.13"
      />
      <TresAmbientLight :intensity="0.48" />
      <TresDirectionalLight :position="[26, 30, 40]" :intensity="1" />
      <TresDirectionalLight :position="[-20, 14, -34]" :intensity="0.33" />
      <TresGroup :rotation="[ISO_ROT_X, ISO_ROT_Y, 0]">
        <slot />
      </TresGroup>
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { Vector3 } from 'three'
import type { Object3D } from 'three'
import type { UsbCameraPreset } from '~/utils/usbIsometric'
import { ISO_ROT_X, ISO_ROT_Y, USB_CAMERA_PRESETS } from '~/utils/usbIsometric'

const props = withDefaults(
  defineProps<{
    clearColor?: string
    preset?: UsbCameraPreset
    anchorObjects?: Record<string, Object3D>
  }>(),
  { clearColor: '#d6d1cb', preset: 'isometric', anchorObjects: () => ({}) }
)

const emit = defineEmits<{
  (e: 'anchors-update', value: Record<string, { x: number; y: number; visible: boolean }>): void
}>()

const wrap = ref<HTMLDivElement | null>(null)
const { width, height } = useElementSize(wrap)
const cameraRef = shallowRef<any>(null)

const orthoArgs = computed(() => {
  const w = width.value || 480
  const h = Math.max(height.value || 400, 1)
  const aspect = w / h
  const view = 26
  return [-view * aspect, view * aspect, view, -view, 0.1, 500] as [number, number, number, number, number, number]
})

const work = new Vector3()

function resolveCamera(ctx: any) {
  const fromRef = cameraRef.value
  if (fromRef?.isCamera) {
    return fromRef
  }
  if (fromRef?.value?.isCamera) {
    return fromRef.value
  }

  const fromCtx = ctx?.camera?.value ?? ctx?.camera
  if (fromCtx?.isCamera) {
    return fromCtx
  }
  if (fromCtx?.value?.isCamera) {
    return fromCtx.value
  }

  return null
}

function applyPreset(preset: UsbCameraPreset) {
  const camera = cameraRef.value
  if (!camera) {
    return
  }
  const [x, y, z] = USB_CAMERA_PRESETS[preset]
  camera.position.set(x, y, z)
  camera.lookAt(0, 0, 0)
  if (typeof camera.updateProjectionMatrix === 'function') {
    camera.updateProjectionMatrix()
  }
}

watch(
  () => props.preset,
  (preset) => {
    applyPreset(preset)
  },
  { immediate: true }
)

function onCanvasRender(ctx: any) {
  const camera = resolveCamera(ctx)
  if (!camera || !props.anchorObjects) {
    return
  }
  if (!camera.matrixWorldInverse || !camera.projectionMatrix) {
    return
  }
  if (typeof camera.updateMatrixWorld === 'function') {
    camera.updateMatrixWorld()
  }

  const projected: Record<string, { x: number; y: number; visible: boolean }> = {}
  for (const [key, anchor] of Object.entries(props.anchorObjects)) {
    anchor.getWorldPosition(work)
    work.project(camera)
    projected[key] = {
      x: (work.x * 0.5 + 0.5) * 100,
      y: (-work.y * 0.5 + 0.5) * 100,
      visible: work.z > -1 && work.z < 1
    }
  }

  emit('anchors-update', projected)
}
</script>

<style scoped>
.usb-section-canvas {
  position: relative;
  width: 100%;
  min-height: 20rem;
  height: min(52vh, 36rem);
  border-radius: 4px;
  overflow: hidden;
  outline: 1px solid rgba(30, 30, 34, 0.12);
}

.usb-section-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
