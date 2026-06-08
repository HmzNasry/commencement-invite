import { type CSSProperties, type TouchEvent, type WheelEvent, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import { BlurFade } from './animation/InvitationMotion'
import { pageTransition, revealTransition } from './animation/motionPresets'
import useAnimatedFill from '../hooks/useAnimatedFill'
import { invitationTemplate, type InvitationLanguage, type TemplatePage } from '../invitationTemplate'

function getLanguage(): InvitationLanguage {
  const lang = new URLSearchParams(window.location.search).get('lang')
  return lang === 'fa' ? 'fa' : 'en'
}

export default function TemplateExperience() {
  useAnimatedFill()

  const language = getLanguage()
  const isRtl = language === 'fa'
  const pageCount = invitationTemplate.pages.length
  const intro = invitationTemplate.universityIntro
  const [introComplete, setIntroComplete] = useState(!intro.enabled)
  const [currentPage, setCurrentPage] = useState(0)
  const touchStartRef = useRef<number | null>(null)
  const snapLockRef = useRef(false)
  const currentTemplatePage = invitationTemplate.pages[currentPage] ?? invitationTemplate.pages[0]

  function lockSnap() {
    snapLockRef.current = true
    window.setTimeout(() => {
      snapLockRef.current = false
    }, 760)
  }

  function goToPage(nextPage: number) {
    if (snapLockRef.current) return
    const clampedPage = Math.min(pageCount - 1, Math.max(0, nextPage))
    if (clampedPage === currentPage) return
    lockSnap()
    setCurrentPage(clampedPage)
  }

  function goToNextPage() {
    goToPage(currentPage + 1)
  }

  function goToPreviousPage() {
    goToPage(currentPage - 1)
  }

  function handleWheel(event: WheelEvent<HTMLElement>) {
    if (Math.abs(event.deltaY) < 42) return
    event.preventDefault()
    if (event.deltaY > 0) {
      goToNextPage()
    } else {
      goToPreviousPage()
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartRef.current = event.touches[0]?.clientY ?? null
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartRef.current === null) return
    const endY = event.changedTouches[0]?.clientY ?? touchStartRef.current
    const distance = touchStartRef.current - endY
    touchStartRef.current = null

    if (Math.abs(distance) < 48) return
    if (distance > 0) {
      goToNextPage()
    } else {
      goToPreviousPage()
    }
  }

  return (
    <main
      className={`template-experience${isRtl ? ' is-rtl' : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {!introComplete && (
          <GraduationIntro
            language={language}
            onComplete={() => setIntroComplete(true)}
          />
        )}
      </AnimatePresence>

      <div className={`page-progress-pill ${introComplete ? 'is-visible' : ''}`} dir="ltr" aria-label={`Page ${currentPage + 1} of ${pageCount}`}>
        <span>{currentPage + 1}</span>
        <span aria-hidden="true">/</span>
        <span>{pageCount}</span>
      </div>

      <AnimatePresence mode="wait">
        <TemplatePageView
          key={currentTemplatePage.id}
          page={currentTemplatePage}
          language={language}
          pageNumber={currentPage + 1}
          onNext={goToNextPage}
          isLastPage={currentPage === pageCount - 1}
        />
      </AnimatePresence>

      <nav className={`template-page-nav ${introComplete ? 'is-visible' : ''}`} aria-label="Invitation pages" dir="ltr">
        <button type="button" onClick={goToPreviousPage} disabled={currentPage === 0} aria-label="Previous page">
          <ArrowLeft aria-hidden="true" />
        </button>
        <div className="template-page-dots">
          {invitationTemplate.pages.map((page, index) => (
            <button
              type="button"
              key={page.id}
              className={index === currentPage ? 'is-active' : ''}
              onClick={() => goToPage(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
        <button type="button" onClick={goToNextPage} disabled={currentPage === pageCount - 1} aria-label="Next page">
          <ArrowRight aria-hidden="true" />
        </button>
      </nav>
    </main>
  )
}

function GraduationIntro({ language, onComplete }: { language: InvitationLanguage; onComplete: () => void }) {
  const intro = invitationTemplate.universityIntro
  const colors = intro.colors

  useEffect(() => {
    const timer = window.setTimeout(onComplete, intro.durationMs)
    return () => window.clearTimeout(timer)
  }, [intro.durationMs, onComplete])

  return (
    <motion.div
      className="graduation-intro"
      style={
        {
          '--university-primary': colors.primary,
          '--university-secondary': colors.secondary,
          '--university-accent': colors.accent,
          '--university-ink': colors.ink,
        } as CSSProperties
      }
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        filter: 'blur(18px)',
        scale: 1.035,
        transition: { duration: 0.86, ease: [0.19, 1, 0.22, 1] },
      }}
    >
      <motion.div
        className="graduation-intro-backdrop"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
      />
      <motion.div
        className="graduation-intro-year"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.28, y: 60, filter: 'blur(28px)' }}
        animate={{
          opacity: [0, 0.22, 0.16],
          scale: [1.28, 1, 0.96],
          y: [60, 0, -18],
          filter: ['blur(28px)', 'blur(0px)', 'blur(6px)'],
        }}
        transition={{ duration: 2.7, delay: 0.16, ease: [0.19, 1, 0.22, 1] }}
      >
        2026
      </motion.div>
      <motion.div
        className="graduation-intro-year-foreground"
        aria-hidden="true"
        initial={{ opacity: 0, letterSpacing: '0.32em', y: 24 }}
        animate={{ opacity: [0, 1, 1, 0], letterSpacing: ['0.32em', '0.08em', '0.08em', '0.18em'], y: [24, 0, 0, -18] }}
        transition={{ duration: 2.7, delay: 2.06, ease: [0.19, 1, 0.22, 1] }}
      >
        2026
      </motion.div>
      <div className="graduation-intro-aurora" aria-hidden="true">
        <motion.span
          initial={{ x: '-30%', opacity: 0, rotate: -8 }}
          animate={{ x: '28%', opacity: [0, 0.8, 0.24], rotate: 4 }}
          transition={{ duration: 3.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
        />
        <motion.span
          initial={{ x: '24%', opacity: 0, rotate: 9 }}
          animate={{ x: '-22%', opacity: [0, 0.52, 0.2], rotate: -5 }}
          transition={{ duration: 3.4, delay: 0.54, ease: [0.19, 1, 0.22, 1] }}
        />
      </div>
      <div className="graduation-intro-particles" aria-hidden="true">
        {Array.from({ length: 30 }, (_, index) => (
          <motion.span
            key={index}
            style={
              {
                '--particle-x': `${((index * 47) % 100) - 50}vw`,
                '--particle-y': `${((index * 29) % 100) - 50}svh`,
                '--particle-delay': `${index * 0.045}s`,
              } as CSSProperties
            }
            initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
            animate={{
              opacity: [0, 0.68, 0],
              scale: [0.2, 1, 0.4],
              x: `var(--particle-x)`,
              y: `var(--particle-y)`,
            }}
            transition={{ duration: 3.1, delay: 0.18 + index * 0.026, ease: [0.19, 1, 0.22, 1] }}
          />
        ))}
      </div>
      <motion.div
        className="graduation-intro-mark-stage"
        initial={{ opacity: 0, scale: 0.84, rotateX: 18 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1.05, delay: 0.22, ease: [0.19, 1, 0.22, 1] }}
      >
        <motion.svg className="graduation-intro-ring" viewBox="0 0 240 240" aria-hidden="true">
          <motion.circle
            cx="120"
            cy="120"
            r="96"
            pathLength="1"
            initial={{ pathLength: 0, rotate: -90 }}
            animate={{ pathLength: 1, rotate: 270 }}
            transition={{ duration: 1.5, delay: 0.32, ease: [0.19, 1, 0.22, 1] }}
          />
          <motion.circle
            cx="120"
            cy="120"
            r="74"
            pathLength="1"
            initial={{ pathLength: 0, rotate: 90 }}
            animate={{ pathLength: 1, rotate: -210 }}
            transition={{ duration: 1.35, delay: 0.48, ease: [0.19, 1, 0.22, 1] }}
          />
        </motion.svg>
        <motion.div
          className="graduation-intro-logo"
          initial={{ clipPath: 'inset(50% 50% 50% 50%)', filter: 'blur(18px)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)' }}
          transition={{ duration: 0.95, delay: 0.7, ease: [0.19, 1, 0.22, 1] }}
        >
          {intro.logoSrc ? (
            <img src={intro.logoSrc} alt={intro.name[language]} />
          ) : (
            <span>{intro.monogram}</span>
          )}
        </motion.div>
        <motion.div
          className="graduation-intro-light-sweep"
          initial={{ x: '-140%', opacity: 0 }}
          animate={{ x: '145%', opacity: [0, 1, 0] }}
          transition={{ duration: 1.05, delay: 1.08, ease: [0.19, 1, 0.22, 1] }}
        />
      </motion.div>
      <motion.div
        className="graduation-intro-copy"
        initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.85, delay: 1.34, ease: [0.19, 1, 0.22, 1] }}
      >
        <p>{intro.label[language]}</p>
        <h1>{intro.name[language]}</h1>
      </motion.div>
      <motion.div
        className="graduation-intro-caps"
        aria-hidden="true"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: [0, 1, 0.76], y: [32, 0, -12] }}
        transition={{ duration: 2.1, delay: 1.52, ease: [0.19, 1, 0.22, 1] }}
      >
        {Array.from({ length: 7 }, (_, index) => (
          <motion.span
            key={index}
            initial={{ y: 0, rotate: -8 + index * 3 }}
            animate={{ y: [-2, -18 - index * 3, -4], rotate: [-8 + index * 3, 8 - index * 2, -4 + index] }}
            transition={{ duration: 2.8, delay: 1.55 + index * 0.07, repeat: Infinity, repeatType: 'mirror', ease: [0.45, 0, 0.2, 1] }}
          />
        ))}
      </motion.div>
      <motion.div
        className="graduation-intro-reveal-bar"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: Math.max(0.9, intro.durationMs / 1000 - 2.2), delay: 1.72, ease: [0.19, 1, 0.22, 1] }}
      />
      <button className="graduation-intro-skip" type="button" onClick={onComplete}>
        {language === 'fa' ? 'رد کردن' : 'Skip'}
      </button>
    </motion.div>
  )
}

function TemplatePageView({
  page,
  language,
  pageNumber,
  onNext,
  isLastPage,
}: {
  page: TemplatePage
  language: InvitationLanguage
  pageNumber: number
  onNext: () => void
  isLastPage: boolean
}) {
  const content = page.content[language]
  const Icon = page.icon

  return (
    <motion.section
      className={`template-page template-page-${page.align ?? 'center'} template-page-theme-${page.theme ?? 'soft'}`}
      aria-label={content.title}
      style={{ '--template-accent': page.accent ?? '#d6c0a1' } as CSSProperties}
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="template-page-scrim" aria-hidden="true" />
      <div className="template-page-shell">
        <BlurFade className="template-page-content">
          {Icon && (
            <span className="template-page-icon" aria-hidden="true">
              <Icon />
            </span>
          )}
          {content.eyebrow && <p className="template-page-eyebrow">{content.eyebrow}</p>}
          <h1>{content.title}</h1>
          {content.subtitle && <p className="template-page-subtitle">{content.subtitle}</p>}
          {content.body?.map((line) => <p key={line}>{line}</p>)}
          {content.meta && (
            <div className="template-page-meta">
              {content.meta.map((item) => <span key={item}>{item}</span>)}
            </div>
          )}
          {content.actionLabel && !isLastPage && (
            <motion.button
              className="template-page-action animated-fill"
              type="button"
              onClick={onNext}
              variants={revealTransition}
            >
              <span>{content.actionLabel}</span>
              <ArrowDown aria-hidden="true" />
            </motion.button>
          )}
          <span className="template-page-number" aria-hidden="true">{String(pageNumber).padStart(2, '0')}</span>
        </BlurFade>
      </div>
    </motion.section>
  )
}
