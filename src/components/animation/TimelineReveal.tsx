import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Award, GraduationCap, Sparkles, type LucideIcon } from 'lucide-react'
import type { InvitationLanguage } from '../../invitationTemplate'

const EASE = [0.19, 1, 0.22, 1] as const
const NODE_GAP = 330 // px between node centres (stage coordinates)
const OVERVIEW_NODE_GAP = 276
const ZOOM = 1.48 // focused-node scale
const STEP_MS = 3800 // time spent on each node before moving on
const NODE_RADIUS = 29
const OVERVIEW_TOP_PAD = 78
const OVERVIEW_BOTTOM_PAD = 22

type TimelineNode = {
  icon: LucideIcon
  caption: string
  time: string
  title: string
  description: string
}

const NODES: TimelineNode[] = [
  {
    icon: GraduationCap,
    caption: 'Ceremony Time',
    time: '10:00 AM',
    title: 'Commencement Ceremony',
    description: 'Estimated duration: 2 hours, 30 minutes.',
  },
  {
    icon: Award,
    caption: 'Lorem ipsum',
    time: '5:00 PM',
    title: 'Dolor Sit Amet',
    description: 'Sed do eiusmod tempor incididunt ut labore et dolore.',
  },
  {
    icon: Sparkles,
    caption: 'Lorem ipsum',
    time: '7:30 PM',
    title: 'Consectetur Elit',
    description: 'Ut enim ad minim veniam, quis nostrud exercitation.',
  },
]

const NODES_FA: TimelineNode[] = [
  {
    icon: GraduationCap,
    caption: 'زمان مراسم',
    time: '10:00 AM',
    title: 'مراسم فارغ‌التحصیلی',
    description: 'مدت زمان تقریبی: 2 ساعت و 30 دقیقه.',
  },
  {
    icon: Award,
    caption: 'برنامه',
    time: '5:00 PM',
    title: 'خوش‌آمدگویی و عکس‌ها',
    description: 'فرصتی برای سلام، دیدار، و ثبت عکس‌های یادگاری.',
  },
  {
    icon: Sparkles,
    caption: 'پایان',
    time: '7:30 PM',
    title: 'جشن و خداحافظی',
    description: 'پایان مراسم و لحظه‌های آخر کنار خانواده و دوستان.',
  },
]

const MIDPOINT_LABEL: Record<InvitationLanguage, string> = {
  en: '- Greetings + Pictures',
  fa: '- خوش‌آمدگویی + عکس‌ها',
}

const TIMELINE_TITLE: Record<InvitationLanguage, string> = {
  en: 'Timeline',
  fa: 'برنامه مراسم',
}

export default function TimelineReveal({ language = 'en' }: { language?: InvitationLanguage }) {
  const reduce = useReducedMotion()
  const isRtl = language === 'fa'
  const nodes = isRtl ? NODES_FA : NODES
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  // step 0..N-1 focuses a node; step === N is the zoomed-out overview.
  const [step, setStep] = useState(reduce ? nodes.length : 0)

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const update = () => setViewportSize({ width: el.clientWidth, height: el.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reduce || step >= nodes.length) return
    const timer = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? STEP_MS + 400 : STEP_MS)
    return () => window.clearTimeout(timer)
  }, [nodes.length, step, reduce])

  const zoomedOut = step >= nodes.length
  const activeGap = zoomedOut ? OVERVIEW_NODE_GAP : NODE_GAP
  const span = (nodes.length - 1) * activeGap

  let scale = ZOOM
  let y = 0
  if (viewportSize.height > 0) {
    if (zoomedOut) {
      const timelineHeight = span + NODE_RADIUS * 2
      scale = Math.min(1, (viewportSize.height - OVERVIEW_TOP_PAD - OVERVIEW_BOTTOM_PAD) / timelineHeight)
      y = OVERVIEW_TOP_PAD + NODE_RADIUS * scale
    } else {
      y = viewportSize.height / 2 - scale * (step * activeGap)
    }
  }
  const fillH = zoomedOut ? span : Math.min(step, nodes.length - 1) * activeGap

  return (
    <div className={`timeline-reveal${isRtl ? ' is-timeline-rtl' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.h2
        className="timeline-reveal-title"
        initial={reduce ? false : { opacity: 0, y: -14, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {TIMELINE_TITLE[language]}
      </motion.h2>

      <div className="timeline-viewport" ref={viewportRef}>
        {viewportSize.height > 0 && (
          <motion.div
            className="timeline-stage"
            style={{ transformOrigin: '50% 0' }}
            animate={{ y, scale }}
            transition={{ duration: reduce ? 0 : 1.85, ease: EASE }}
          >
            <div className="timeline-track" style={{ height: span }} />
            <motion.div
              className="timeline-track-fill"
              animate={{ height: fillH }}
              transition={{ duration: reduce ? 0 : 1.85, ease: EASE }}
            />
            <motion.div
              className="timeline-midpoint-label"
              style={{ top: activeGap / 2 }}
              initial={false}
              animate={{ opacity: zoomedOut ? 1 : 0, x: zoomedOut ? 0 : 10, y: '-50%' }}
              transition={{ duration: reduce ? 0 : 0.7, delay: zoomedOut && !reduce ? 1.05 : 0, ease: EASE }}
            >
              {MIDPOINT_LABEL[language]}
            </motion.div>

            {nodes.map((node, i) => {
              const Icon = node.icon
              const reached = zoomedOut || step >= i
              const active = !zoomedOut && step === i
              const visible = active || zoomedOut
              return (
                <div key={i} className={`timeline-node-wrap${active ? ' is-active-wrap' : ''}${zoomedOut ? ' is-overview-wrap' : ''}`} style={{ top: i * activeGap }}>
                  <div className={`timeline-node${reached ? ' is-reached' : ''}${active ? ' is-active' : ''}`}>
                    <Icon aria-hidden="true" />
                  </div>
                  <motion.div
                    className="timeline-node-info"
                    animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 12, y: '-50%' }}
                    transition={{ duration: 0.72, ease: EASE }}
                  >
                    {active ? (
                      <>
                        <motion.span
                          className="timeline-node-time"
                          dir="ltr"
                          initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          transition={{ duration: 0.58, delay: 0.08, ease: EASE }}
                        >
                          {node.time}
                        </motion.span>
                      </>
                    ) : (
                      <>
                        <span className="timeline-node-time" dir="ltr">{node.time}</span>
                      </>
                    )}
                    {active ? (
                      <>
                        <motion.h3
                          className="timeline-node-title"
                          initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          transition={{ duration: 0.72, delay: 0.2, ease: EASE }}
                        >
                          {node.title}
                        </motion.h3>
                        <motion.p
                          className="timeline-node-desc"
                          initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          transition={{ duration: 0.72, delay: 0.42, ease: EASE }}
                        >
                          {node.description}
                        </motion.p>
                      </>
                    ) : (
                      <>
                        <h3 className="timeline-node-title">{node.title}</h3>
                        {!zoomedOut && <p className="timeline-node-desc">{node.description}</p>}
                      </>
                    )}
                  </motion.div>
                </div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
