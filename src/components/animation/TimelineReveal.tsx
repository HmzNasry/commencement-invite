import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Camera, GraduationCap, MoonStar, Utensils, type LucideIcon } from 'lucide-react'
import type { InvitationLanguage } from '../../invitationTemplate'

const EASE = [0.19, 1, 0.22, 1] as const
const NODE_GAP = 330 // px between node centres (stage coordinates)
const OVERVIEW_NODE_GAP = 276
const ZOOM = 1.48 // focused-node scale
const STEP_MS = 3800 // time spent on each node before moving on
const NODE_RADIUS = 29
const OVERVIEW_TOP_PAD = 78
const OVERVIEW_BOTTOM_PAD = 22

const mapsUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

type TimelineNode = {
  icon: LucideIcon
  caption: string
  time: string
  title: string
  description: string
  address?: string
}

const NODES: TimelineNode[] = [
  {
    icon: GraduationCap,
    caption: 'Ceremony',
    time: '9:30 AM – 12:30 PM',
    title: 'UW Tacoma Commencement Ceremony',
    description: 'Tacoma Dome',
    address: '2727 E D St, Tacoma, WA 98421',
  },
  {
    icon: Camera,
    caption: 'Reception',
    time: '12:30 PM – 1:30 PM',
    title: 'Greetings & Photos',
    description: 'With friends & family · Around Tacoma Dome',
  },
  {
    icon: MoonStar,
    caption: 'Prayer',
    time: '1:30 PM – 2:30 PM',
    title: 'Jummah Prayer',
    description: 'Islamic Center of Tacoma',
    address: '1 Montana Ave, Tacoma, WA 98409',
  },
  {
    icon: Utensils,
    caption: 'Meal',
    time: '3:00 PM – onward',
    title: 'Lunch Together',
    description: '',
    address: '1814 S G St, Tacoma, WA 98405',
  },
]

const NODES_FA: TimelineNode[] = [
  {
    icon: GraduationCap,
    caption: 'مراسم',
    time: '9:30 AM – 12:30 PM',
    title: 'محفل فراغت',
    description: 'Tacoma Dome',
    address: '2727 E D St, Tacoma, WA 98421',
  },
  {
    icon: Camera,
    caption: 'پذیرایی',
    time: '12:30 PM – 1:30 PM',
    title: 'سلام و عکس‌ها',
    description: 'همراه دوستان و خانواده · اطراف Tacoma Dome',
  },
  {
    icon: MoonStar,
    caption: 'نماز',
    time: '1:30 PM – 2:30 PM',
    title: 'نماز جمعه',
    description: 'مرکز اسلامی تاکوما',
    address: '1 Montana Ave, Tacoma, WA 98409',
  },
  {
    icon: Utensils,
    caption: 'ناهار',
    time: '3:00 PM – onward',
    title: 'ناهار دسته‌جمعی',
    description: '',
    address: '1814 S G St, Tacoma, WA 98405',
  },
]

const TIMELINE_TITLE: Record<InvitationLanguage, string> = {
  en: 'Timeline',
  fa: 'برنامه مراسم',
}

const HINT: Record<InvitationLanguage, string> = {
  en: 'Tap a step for details',
  fa: 'برای جزئیات روی هر مرحله بزنید',
}

export default function TimelineReveal({ language = 'en' }: { language?: InvitationLanguage }) {
  const reduce = useReducedMotion()
  const isRtl = language === 'fa'
  const nodes = isRtl ? NODES_FA : NODES
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  // step 0..N-1 focuses a node; step === N is the zoomed-out overview.
  const [step, setStep] = useState(reduce ? nodes.length : 0)
  const [interacted, setInteracted] = useState(false)

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
    // Auto-play stops as soon as the user takes control.
    if (reduce || interacted || step >= nodes.length) return
    const timer = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? STEP_MS + 400 : STEP_MS)
    return () => window.clearTimeout(timer)
  }, [nodes.length, step, reduce, interacted])

  const zoomedOut = step >= nodes.length

  function zoomInto(i: number) {
    setInteracted(true)
    setStep(i)
  }

  function zoomOut() {
    setInteracted(true)
    setStep(nodes.length)
  }

  // Tap a node row to zoom in; tap anywhere while zoomed in to zoom back out.
  function handleViewportClick() {
    if (!zoomedOut) zoomOut()
  }

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
    <div className={`timeline-reveal${isRtl ? ' is-timeline-rtl' : ''}${zoomedOut ? '' : ' is-zoomed-in'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.h2
        className="timeline-reveal-title"
        initial={reduce ? false : { opacity: 0, y: -14, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {TIMELINE_TITLE[language]}
      </motion.h2>

      <div className="timeline-viewport" ref={viewportRef} onClick={handleViewportClick}>
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
            {nodes.map((node, i) => {
              const Icon = node.icon
              const reached = zoomedOut || step >= i
              const active = !zoomedOut && step === i
              const visible = active || zoomedOut
              return (
                <div
                  key={i}
                  className={`timeline-node-wrap${active ? ' is-active-wrap' : ''}${zoomedOut ? ' is-overview-wrap' : ''}`}
                  style={{ top: i * activeGap }}
                  onClick={() => {
                    if (zoomedOut) zoomInto(i)
                  }}
                >
                  {/* wide transparent hit area so the whole row is tappable */}
                  <span className="timeline-node-hit" aria-hidden="true" />
                  <div className={`timeline-node${reached ? ' is-reached' : ''}${active ? ' is-active' : ''}`}>
                    <Icon aria-hidden="true" />
                  </div>
                  <motion.div
                    className="timeline-node-info"
                    animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 12, y: '-50%' }}
                    transition={{ duration: 0.72, ease: EASE }}
                  >
                    {active ? (
                      <motion.span
                        className="timeline-node-time"
                        dir="ltr"
                        initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.58, delay: 0.08, ease: EASE }}
                      >
                        {node.time}
                      </motion.span>
                    ) : (
                      <span className="timeline-node-time" dir="ltr">{node.time}</span>
                    )}

                    {active ? (
                      <motion.h3
                        className="timeline-node-title"
                        initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.72, delay: 0.2, ease: EASE }}
                      >
                        {node.title}
                      </motion.h3>
                    ) : (
                      <h3 className="timeline-node-title">{node.title}</h3>
                    )}

                    {node.description && (active || !zoomedOut) && (
                      active ? (
                        <motion.p
                          className="timeline-node-desc"
                          initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          transition={{ duration: 0.72, delay: 0.42, ease: EASE }}
                        >
                          {node.description}
                        </motion.p>
                      ) : (
                        <p className="timeline-node-desc">{node.description}</p>
                      )
                    )}

                    {active && node.address && (
                      <motion.a
                        className="timeline-node-address-link"
                        dir="ltr"
                        href={mapsUrl(node.address)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.72, delay: 0.56, ease: EASE }}
                      >
                        {node.address}
                      </motion.a>
                    )}
                  </motion.div>
                </div>
              )
            })}
          </motion.div>
        )}
      </div>

      <motion.p
        className="timeline-hint"
        aria-hidden="true"
        animate={{ opacity: zoomedOut ? 1 : 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {HINT[language]}
      </motion.p>
    </div>
  )
}
