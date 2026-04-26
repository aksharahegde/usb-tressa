import type { UsbCameraPreset } from '~/utils/usbIsometric'

export interface UsbAnnotation {
  anchorKey: string
  label: string
  detail: string
  side: 'left' | 'right'
  part: string
  preset?: UsbCameraPreset
  primary: boolean
}

export interface UsbCheatConnector {
  id: string
  title: string
  wires: 4 | 8 | 12
  note: string
  annotations: UsbAnnotation[]
}

export const usbCheatConnectors: UsbCheatConnector[] = [
  {
    id: 'a4',
    title: 'Type-A (USB 2)',
    wires: 4,
    note: 'Classic Type-A with four-wire USB 2.0 contact set.',
    annotations: [
      { anchorKey: 'a4_vbus', label: 'VBUS', detail: '+5V power rail', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'a4_dpdm', label: 'D+ / D-', detail: 'USB 2.0 differential data pair', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'a4_gnd', label: 'GND', detail: 'Power/signal return', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'a4_cable', label: '4-wire cable', detail: 'VBUS, D+, D-, GND only', side: 'right', part: 'mold', primary: true },
      { anchorKey: 'a4_no_ss', label: 'No SS lanes', detail: 'No SuperSpeed TX/RX pins', side: 'right', part: 'insulator', primary: true }
    ]
  },
  {
    id: 'a8',
    title: 'Type-A (SuperSpeed)',
    wires: 8,
    note: 'SuperSpeed Type-A adds extra lane contacts while preserving legacy row.',
    annotations: [
      { anchorKey: 'a8_legacy', label: 'VBUS / D+ / D- / GND', detail: 'Legacy USB 2.0 pins retained', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'a8_sstx', label: 'StdA_SSTX+/-', detail: 'SuperSpeed transmit differential pair', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'a8_ssrx', label: 'StdA_SSRX+/-', detail: 'SuperSpeed receive differential pair', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'a8_gnd_drain', label: 'GND_DRAIN', detail: 'Signal return / EMI drain', side: 'right', part: 'shell', primary: true },
      { anchorKey: 'a8_9pin', label: '9-pin interface', detail: '4 legacy + 5 SuperSpeed pins', side: 'right', part: 'mold', primary: true }
    ]
  },
  {
    id: 'b4',
    title: 'Type-B (USB 2)',
    wires: 4,
    note: 'Square peripheral plug with four-pin USB 2.0 interior.',
    annotations: [
      { anchorKey: 'b4_vbus', label: 'VBUS', detail: '+5V downstream power', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'b4_dpdm', label: 'D+ / D-', detail: 'USB 2.0 differential data', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'b4_gnd', label: 'GND', detail: 'Ground return', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'b4_4pin', label: '4-pin Type-B', detail: 'Peripheral-side square connector', side: 'right', part: 'shell', primary: true },
      { anchorKey: 'b4_usb2_only', label: 'USB 2 only', detail: 'No SuperSpeed contacts', side: 'right', part: 'insulator', primary: true }
    ]
  },
  {
    id: 'b8',
    title: 'Type-B (SuperSpeed)',
    wires: 8,
    note: 'Extended Type-B geometry with SuperSpeed contact additions.',
    annotations: [
      { anchorKey: 'b8_legacy', label: 'VBUS / D+ / D- / GND', detail: 'Legacy USB 2.0 set', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'b8_sstx', label: 'StdB_SSTX+/-', detail: 'SuperSpeed transmit pair (B side)', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'b8_ssrx', label: 'StdB_SSRX+/-', detail: 'SuperSpeed receive pair (B side)', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'b8_gnd_drain', label: 'GND_DRAIN', detail: 'High-speed signal return', side: 'right', part: 'shell', primary: true },
      { anchorKey: 'b8_9pin', label: '9-pin Type-B', detail: 'SuperSpeed extended housing', side: 'right', part: 'mold', primary: true }
    ]
  },
  {
    id: 'c',
    title: 'Type-C',
    wires: 12,
    note: 'Reversible Type-C cable plug with 24 contacts in dual rows.',
    annotations: [
      { anchorKey: 'c_vbus', label: 'VBUS (A4/A9/B4/B9)', detail: 'Main bus power pins', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'c_gnd', label: 'GND (A1/A12/B1/B12)', detail: 'Ground return network', side: 'left', part: 'shell', primary: true, preset: 'detail' },
      { anchorKey: 'c_dpdm', label: 'D+ / D-', detail: 'USB 2.0 pair for backward compatibility', side: 'left', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'c_ss', label: 'SSTX / SSRX lanes', detail: 'SuperSpeed TX/RX differential pairs', side: 'right', part: 'contact', primary: true, preset: 'detail' },
      { anchorKey: 'c_cc', label: 'CC1 / CC2', detail: 'Cable orientation + USB PD negotiation', side: 'right', part: 'insulator', primary: true },
      { anchorKey: 'c_sbu', label: 'SBU1 / SBU2', detail: 'Sideband lines for Alternate Modes', side: 'right', part: 'insulator', primary: true }
    ]
  }
]
