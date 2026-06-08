import { type Variants } from 'framer-motion'

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 34, filter: 'blur(16px)', scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: { duration: 1.05, ease: [0.19, 1, 0.22, 1], staggerChildren: 0.09 },
  },
  exit: {
    opacity: 0,
    y: -28,
    filter: 'blur(18px)',
    scale: 0.97,
    transition: { duration: 0.72, ease: [0.55, 0.06, 0.68, 0.19] },
  },
}

export const revealTransition: Variants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.82, ease: [0.19, 1, 0.22, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: 'blur(10px)',
    transition: { duration: 0.32, ease: 'easeOut' },
  },
}

export const softScaleTransition: Variants = {
  hidden: { opacity: 0, scale: 0.94, filter: 'blur(14px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.92, ease: [0.19, 1, 0.22, 1] },
  },
  exit: { opacity: 0, scale: 0.98, filter: 'blur(10px)', transition: { duration: 0.34 } },
}

export function revealList(index: number) {
  return {
    animationDelay: `${180 + index * 120}ms`,
  }
}
