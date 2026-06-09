import { type Variants } from 'framer-motion'

export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.68, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export const revealTransition: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.92, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    filter: 'blur(3px)',
    transition: { duration: 0.36, ease: [0.16, 1, 0.3, 1] },
  },
}

export const softScaleTransition: Variants = {
  hidden: { opacity: 0, scale: 0.96, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.82, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.99, filter: 'blur(3px)', transition: { duration: 0.3 } },
}

export function revealList(index: number) {
  return {
    animationDelay: `${180 + index * 120}ms`,
  }
}
