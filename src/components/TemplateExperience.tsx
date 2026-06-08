import { type CSSProperties, type TouchEvent, type WheelEvent, useRef, useState } from 'react'
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
      <div className="page-progress-pill is-visible" dir="ltr" aria-label={`Page ${currentPage + 1} of ${pageCount}`}>
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

      <nav className="template-page-nav" aria-label="Invitation pages" dir="ltr">
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
