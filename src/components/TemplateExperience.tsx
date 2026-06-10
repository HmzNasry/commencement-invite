import { type ComponentType, type CSSProperties, type TouchEvent, type WheelEvent, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, Copy, GraduationCap, MapPin, Utensils } from 'lucide-react'
import { LiaMosqueSolid } from 'react-icons/lia'
import ConfettiField from './animation/ConfettiField'
import GraduationIntro from './animation/GraduationIntro'
import TimelineReveal from './animation/TimelineReveal'
import { pageTransition } from './animation/motionPresets'
import useAnimatedFill from '../hooks/useAnimatedFill'
import { invitationTemplate, type InvitationLanguage, type TemplatePage } from '../invitationTemplate'

const eventDetails = {
  date: {
    en: 'June 12, 2026',
    fa: 'June 12, 2026',
  },
  time: {
    en: 'Ceremony Time:',
    fa: 'زمان مراسم:',
  },
  duration: {
    en: 'Estimated Duration: 2 hours, 30 minutes',
    fa: 'ورود مهمانان ساعت ۹ صبح است',
  },
  location: {
    en: 'Tacoma Dome',
    fa: 'Tacoma Dome',
  },
  address: {
    en: '2727 E D St, Tacoma, WA 98421',
    fa: '2727 E D St, Tacoma, WA 98421',
  },
  intro: {
    en: 'Get Ready Class of 2026!',
    fa: 'فارغ‌التحصیلان ۲۰۲۶ آماده باشید!',
  },
  note: {
    en: 'We will be back at the Tacoma Dome to celebrate the 36th Commencement Ceremony of UW Tacoma.',
    fa: 'برای برگزاری 36th Commencement Ceremony دانشگاه UW Tacoma به Tacoma Dome بازمی‌گردیم.',
  },
  live: {
    en: 'The ceremony will be broadcasted live on June 12, 2026',
    fa: 'مراسم در تاریخ June 12, 2026 به صورت زنده پخش خواهد شد.',
  },
  mapQuery: 'Tacoma Dome 2727 E D St Tacoma WA 98421',
  locations: [
    {
      iconKey: 'cap',
      name: { en: 'Tacoma Dome', fa: 'Tacoma Dome' },
      address: { en: '2727 E D St, Tacoma, WA 98421', fa: '2727 E D St, Tacoma, WA 98421' },
      mapQuery: 'Tacoma Dome 2727 E D St Tacoma WA 98421',
    },
    {
      iconKey: 'mosque',
      name: { en: 'Islamic Center of Tacoma', fa: 'مرکز اسلامی تاکوما' },
      address: {
        en: '1 Montana Ave, Tacoma, WA 98409',
        fa: '1 Montana Ave, Tacoma, WA 98409',
      },
      mapQuery: 'Islamic Center of Tacoma 1 Montana Ave Tacoma WA 98409',
    },
    {
      iconKey: 'lunch',
      name: { en: 'Lunch Together', fa: 'صرف طعام' },
      address: { en: '1814 S G St, Tacoma, WA 98405', fa: '1814 S G St, Tacoma, WA 98405' },
      mapQuery: '1814 S G St Tacoma WA 98405',
    },
  ],
}

const contactPhone = '+1 (253) 335-4033'
const contactPhoneHref = 'tel:+12533354033'

const LOCATION_ICONS: Record<string, ComponentType> = {
  cap: GraduationCap,
  mosque: LiaMosqueSolid,
  lunch: Utensils,
}

function getLanguage(): InvitationLanguage {
  const lang = new URLSearchParams(window.location.search).get('lang')
  return lang === 'fa' ? 'fa' : 'en'
}

export default function TemplateExperience() {
  useAnimatedFill()

  const language = getLanguage()
  const isRtl = language === 'fa'
  const detailsPage = invitationTemplate.pages.find((page) => page.id === 'details')
  const templatePages = detailsPage
    ? [detailsPage, ...invitationTemplate.pages.filter((page) => page.id !== 'details')]
    : invitationTemplate.pages
  const pageCount = templatePages.length
  const totalPageCount = pageCount + 1
  const intro = invitationTemplate.universityIntro
  const [introComplete, setIntroComplete] = useState(!intro.enabled)
  const [introRevealed, setIntroRevealed] = useState(!intro.enabled)
  const [currentPage, setCurrentPage] = useState(0)
  const touchStartRef = useRef<number | null>(null)
  const snapLockRef = useRef(false)
  const currentTemplatePage = templatePages[currentPage - 1] ?? templatePages[0]
  const navVisible = introComplete || introRevealed

  function lockSnap() {
    snapLockRef.current = true
    window.setTimeout(() => {
      snapLockRef.current = false
    }, 760)
  }

  function goToPage(nextPage: number) {
    if (snapLockRef.current) return
    const clampedPage = Math.min(totalPageCount - 1, Math.max(0, nextPage))
    if (clampedPage === currentPage) return
    lockSnap()
    setIntroComplete(clampedPage > 0)
    setCurrentPage(clampedPage)
  }

  function goToNextPage() {
    goToPage(currentPage + 1)
  }

  function goToPreviousPage() {
    goToPage(currentPage - 1)
  }

  function handleWheel(event: WheelEvent<HTMLElement>) {
    // Lock scrolling/navigation while the intro animation is playing.
    if (!introComplete) {
      event.preventDefault()
      return
    }
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
    if (!introComplete) {
      touchStartRef.current = null
      return
    }
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
            key="reveal"
            language={language}
            onComplete={() => goToPage(1)}
            onReveal={() => setIntroRevealed(true)}
            initialRevealed={introRevealed}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {introComplete && (
          <TemplatePageView
            key={currentTemplatePage.id}
            page={currentTemplatePage}
            language={language}
            pageNumber={currentPage}
            onNext={goToNextPage}
            isLastPage={currentPage === totalPageCount - 1}
          />
        )}
      </AnimatePresence>
      {introComplete && (
        <div className={`template-confetti-layer ${currentTemplatePage.id === 'details' ? 'is-details-page' : ''}`} aria-hidden="true">
          <ConfettiField />
        </div>
      )}

      {introComplete && <div className="template-bottom-blur" aria-hidden="true" />}

      <nav className={`template-page-nav ${navVisible ? 'is-visible' : ''}`} aria-label="Invitation pages" dir="ltr">
        <button className="animated-fill" type="button" onClick={goToPreviousPage} disabled={currentPage === 0} aria-label="Previous page">
          <ArrowLeft aria-hidden="true" />
        </button>
        <div className="template-page-dots">
          {Array.from({ length: totalPageCount }, (_, index) => (
            <button
              type="button"
              key={index === 0 ? 'commencement-intro' : templatePages[index - 1]?.id}
              className={index === currentPage ? 'is-active' : ''}
              onClick={() => goToPage(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
        <button className="animated-fill" type="button" onClick={goToNextPage} disabled={currentPage === totalPageCount - 1} aria-label="Next page">
          <ArrowRight aria-hidden="true" />
        </button>
      </nav>
      <div className={`template-bottom-progress ${navVisible ? 'is-visible' : ''}`} aria-hidden="true" />
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
  const revealStyle = (index: number) => ({ '--reveal-delay': `${180 + index * 130}ms` } as CSSProperties)

  return (
    <motion.section
      className={`template-page template-page-${page.id} template-page-${page.align ?? 'center'} template-page-theme-${page.theme ?? 'soft'}`}
      aria-label={content.title}
      style={{ '--template-accent': page.accent ?? '#d6c0a1' } as CSSProperties}
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="template-page-scrim" aria-hidden="true" />
      {page.id === 'closing' ? (
        <TimelineReveal language={language} />
      ) : (
      <div className="template-page-shell">
        <div className="template-page-content">
          {page.id === 'details' ? (
            <EventDetailsCard language={language} />
          ) : page.id === 'contact' ? (
            <ContactPage content={content} language={language} />
          ) : (
            <>
          {Icon && (
            <span
              className="template-page-icon template-reveal-item"
              aria-hidden="true"
                  style={revealStyle(0)}
            >
              <Icon />
            </span>
          )}
          {content.eyebrow && (
            <p className="template-page-eyebrow template-reveal-item" style={revealStyle(1)}>
              {content.eyebrow}
            </p>
          )}
          <h1 className="template-reveal-item" style={revealStyle(2)}>
            {content.title}
          </h1>
          {content.subtitle && (
            <p className="template-page-subtitle template-reveal-item" style={revealStyle(3)}>
              {content.subtitle}
            </p>
          )}
          {content.body?.map((line, index) => (
            <p key={line} className="template-reveal-item" style={revealStyle(4 + index)}>
              {line}
            </p>
          ))}
          {content.meta && (
            <div className="template-page-meta template-reveal-item" style={revealStyle(4 + (content.body?.length ?? 0))}>
              {content.meta.map((item) => <span key={item}>{item}</span>)}
            </div>
          )}
          {content.actionLabel && !isLastPage && (
            <motion.button
              className="template-page-action animated-fill template-reveal-item"
              type="button"
              onClick={onNext}
              style={revealStyle(5 + (content.body?.length ?? 0) + (content.meta ? 1 : 0))}
            >
              <span>{content.actionLabel}</span>
              <ArrowDown aria-hidden="true" />
            </motion.button>
          )}
          <span
            className="template-page-number template-reveal-item"
            aria-hidden="true"
            style={revealStyle(6 + (content.body?.length ?? 0) + (content.meta ? 1 : 0) + (content.actionLabel && !isLastPage ? 1 : 0))}
          >
            {String(pageNumber).padStart(2, '0')}
          </span>
            </>
          )}
        </div>
      </div>
      )}
    </motion.section>
  )
}

function ContactPage({
  content,
  language,
}: {
  content: TemplatePage['content'][InvitationLanguage]
  language: InvitationLanguage
}) {
  const [copied, setCopied] = useState(false)
  const resetRef = useRef<number | null>(null)

  async function copyPhone() {
    await navigator.clipboard?.writeText(contactPhone)
    setCopied(true)
    if (resetRef.current) window.clearTimeout(resetRef.current)
    resetRef.current = window.setTimeout(() => setCopied(false), 1300)
  }

  return (
    <div className="contact-page-card" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <h1 className="contact-page-title template-reveal-item" style={{ '--reveal-delay': '180ms' } as CSSProperties}>
        {content.title}
      </h1>
      <div className="contact-page-actions template-reveal-item" dir="ltr" style={{ '--reveal-delay': '330ms' } as CSSProperties}>
        <a className="contact-page-phone" href={contactPhoneHref} dir="ltr">
          {contactPhone}
        </a>
        <button className="contact-page-copy" type="button" onClick={copyPhone} aria-label={language === 'fa' ? 'کپی شماره' : 'Copy phone number'}>
          <span className="event-details-copy-icon" aria-hidden="true">
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, scale: 0.55, rotate: -42 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.55, rotate: 42 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Check />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.65, rotate: 36 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.65, rotate: -36 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Copy />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <span dir={language === 'fa' ? 'rtl' : 'ltr'}>{language === 'fa' ? 'کپی' : 'Copy'}</span>
        </button>
      </div>
    </div>
  )
}

function EventDetailsCard({
  language,
}: {
  language: InvitationLanguage
}) {
  const date = eventDetails.date[language]

  const sectionReveal = (order: number) => ({ '--reveal-delay': `${180 + order * 130}ms` } as CSSProperties)
  const textReveal = (order: number) => ({ '--reveal-delay': `${360 + order * 120}ms` } as CSSProperties)

  return (
    <div className="event-details-card">
      <div className="event-details-border-beam-mask" aria-hidden="true">
        <div className="event-details-rotating-beam" />
      </div>
      <section className="event-details-date event-details-reveal" style={sectionReveal(0)} aria-label={language === 'fa' ? 'تاریخ' : 'Date'}>
        <div>
          <span className="event-details-label event-details-text-reveal" style={textReveal(0)}>
            <CalendarDays aria-hidden="true" />
            <span>{language === 'fa' ? 'تاریخ' : 'Date'}</span>
          </span>
          <strong className="event-details-text-reveal" dir="ltr" style={textReveal(1)}>{date}</strong>
          <p className="event-details-text-reveal" style={textReveal(2)}>
            {eventDetails.time[language]} <bdi dir="ltr">9:30 AM</bdi>
          </p>
        </div>
      </section>

      <section className="event-details-locations-card event-details-reveal" style={sectionReveal(1)} aria-label={language === 'fa' ? 'مکان‌ها' : 'Locations'}>
        <span className="event-details-label event-details-text-reveal" style={textReveal(5)}>
          <MapPin aria-hidden="true" />
          <span>{language === 'fa' ? 'مکان‌ها' : 'Locations'}</span>
        </span>
        <div className="event-details-locations">
          {eventDetails.locations.map((loc, i) => {
            const LocIcon = LOCATION_ICONS[loc.iconKey]
            const hasMap = loc.mapQuery.length > 0
            const inner = (
              <>
                <span className="event-details-loc-icon" aria-hidden="true">
                  <LocIcon />
                </span>
                <span className="event-details-loc-text">
                  <strong>{loc.name[language]}</strong>
                  <span dir="ltr">{loc.address[language]}</span>
                </span>
                {hasMap && (
                  <span className="event-details-loc-go" aria-hidden="true">
                    <ArrowUpRight />
                  </span>
                )}
              </>
            )
            return hasMap ? (
              <a
                key={loc.iconKey}
                className="event-details-loc event-details-text-reveal"
                style={textReveal(6 + i)}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapQuery)}`}
                target="_blank"
                rel="noreferrer"
              >
                {inner}
              </a>
            ) : (
              <div key={loc.iconKey} className="event-details-loc is-tba event-details-text-reveal" style={textReveal(6 + i)}>
                {inner}
              </div>
            )
          })}
        </div>
      </section>

      <div className="event-details-actions event-details-reveal" style={sectionReveal(2)}>
        <a className="event-details-button animated-fill" href="https://www.tacoma.uw.edu/commencement/livestream" target="_blank" rel="noreferrer">
          <span>{language === 'fa' ? 'پخش زنده' : 'Watch Live'}</span>
        </a>
      </div>
    </div>
  )
}
