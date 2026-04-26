export type UsbCameraPreset = 'isometric' | 'front' | 'detail'

export const ISO_ROT_X = Math.atan(1 / Math.SQRT2)
export const ISO_ROT_Y = Math.PI / 4

export const USB_CAMERA_PRESETS: Record<UsbCameraPreset, [number, number, number]> = {
  isometric: [0, 0, 88],
  front: [0, 0, 98],
  detail: [24, 10, 64]
}

export function qualityForWidth(width: number) {
  return width < 760 ? 'mobile' : 'desktop'
}
