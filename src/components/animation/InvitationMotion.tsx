import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { type ReactNode } from 'react'
import { pageTransition, revealTransition } from './motionPresets'

type RevealProps = HTMLMotionProps<'div'> & {
  children: ReactNode
  delay?: number
}

export function MotionStage({ children, className, ...props }: RevealProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={prefersReducedMotion ? undefined : pageTransition}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      exit={prefersReducedMotion ? undefined : 'exit'}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function BlurFade({ children, className, delay = 0, ...props }: RevealProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={prefersReducedMotion ? undefined : revealTransition}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      exit={prefersReducedMotion ? undefined : 'exit'}
      transition={prefersReducedMotion ? undefined : { delay, duration: 0.82, ease: [0.19, 1, 0.22, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedSwap({ children, value }: { children: ReactNode; value: string | number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={value}
        variants={revealTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
