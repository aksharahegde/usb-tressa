import type { MaybeRefOrGetter } from 'vue'
import { useTransition, TransitionPresets } from '@vueuse/core'

export function useExplodeAnimation(target: MaybeRefOrGetter<number>) {
  return useTransition(target, {
    duration: 700,
    transition: TransitionPresets.easeOutCubic
  })
}
