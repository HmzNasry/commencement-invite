import { useEffect } from 'react'

export default function useAnimatedFill() {
  useEffect(() => {
    const update = (target: HTMLElement, event?: PointerEvent | FocusEvent) => {
      const rect = target.getBoundingClientRect()
      const clientX = event && 'clientX' in event && typeof event.clientX === 'number' ? event.clientX : rect.left + rect.width / 2
      const clientY = event && 'clientY' in event && typeof event.clientY === 'number' ? event.clientY : rect.top + rect.height / 2
      const localX = clientX - rect.left
      const localY = clientY - rect.top

      const distances = [
        Math.hypot(localX, localY),
        Math.hypot(rect.width - localX, localY),
        Math.hypot(localX, rect.height - localY),
        Math.hypot(rect.width - localX, rect.height - localY),
      ]

      const maxDistance = Math.max(...distances)
      const baseRadius = 18
      const scale = Math.max((maxDistance / baseRadius) * 1.1, 1)

      target.style.setProperty('--fill-x', `${localX}px`)
      target.style.setProperty('--fill-y', `${localY}px`)
      target.style.setProperty('--fill-scale', `${scale}`)
    }

    const handlePointer = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.('.animated-fill') as HTMLElement | null
      if (!target) return

      if ((event.type === 'pointerover' || event.type === 'pointerleave') && event.target !== target) {
        return
      }

      update(target, event)
    }

    const handleFocus = (event: FocusEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.('.animated-fill') as HTMLElement | null
      if (target) {
        update(target, event)
      }
    }

    document.addEventListener('pointerover', handlePointer, true)
    document.addEventListener('pointerdown', handlePointer, true)
    document.addEventListener('pointerleave', handlePointer, true)
    document.addEventListener('focusin', handleFocus, true)

    return () => {
      document.removeEventListener('pointerover', handlePointer, true)
      document.removeEventListener('pointerdown', handlePointer, true)
      document.removeEventListener('pointerleave', handlePointer, true)
      document.removeEventListener('focusin', handleFocus, true)
    }
  }, [])
}
