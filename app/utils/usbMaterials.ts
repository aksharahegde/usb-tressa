export type UsbRenderMode = 'product' | 'exploded' | 'wireframe'
export type UsbPartTone = 'shell' | 'insulator' | 'contact' | 'mold'

interface UsbMaterialPreset {
  color: string
  metalness: number
  roughness: number
  wireframe: boolean
  transparent?: boolean
  opacity?: number
}

const productTones: Record<UsbPartTone, UsbMaterialPreset> = {
  shell: { color: '#979da6', metalness: 0.86, roughness: 0.3, wireframe: false },
  insulator: { color: '#d4d9e3', metalness: 0.08, roughness: 0.65, wireframe: false },
  contact: { color: '#c79c2f', metalness: 0.76, roughness: 0.32, wireframe: false },
  mold: { color: '#4b5568', metalness: 0.28, roughness: 0.6, wireframe: false }
}

const explodedTones: Record<UsbPartTone, UsbMaterialPreset> = {
  shell: { color: '#a7aeb8', metalness: 0.82, roughness: 0.34, wireframe: false },
  insulator: { color: '#e2e6ef', metalness: 0.05, roughness: 0.68, wireframe: false },
  contact: { color: '#d9ad45', metalness: 0.78, roughness: 0.3, wireframe: false },
  mold: { color: '#636c7a', metalness: 0.2, roughness: 0.68, wireframe: false }
}

const wireframeTones: Record<UsbPartTone, UsbMaterialPreset> = {
  shell: { color: '#25252a', metalness: 0, roughness: 1, wireframe: true },
  insulator: { color: '#25252a', metalness: 0, roughness: 1, wireframe: true },
  contact: { color: '#25252a', metalness: 0, roughness: 1, wireframe: true },
  mold: { color: '#25252a', metalness: 0, roughness: 1, wireframe: true }
}

const modeMap = {
  product: productTones,
  exploded: explodedTones,
  wireframe: wireframeTones
}

export function usbMaterial(mode: UsbRenderMode, tone: UsbPartTone, highlighted = false): UsbMaterialPreset {
  const base = modeMap[mode][tone]
  if (!highlighted || mode === 'wireframe') {
    return { ...base }
  }

  return {
    ...base,
    color: tone === 'contact' ? '#ffc861' : '#f1f5ff',
    metalness: Math.min(1, base.metalness + 0.08),
    roughness: Math.max(0.1, base.roughness - 0.12)
  }
}
