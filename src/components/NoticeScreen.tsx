import { useState, type ReactNode } from 'react'
import { AlertTriangle, type LucideIcon } from 'lucide-react'

export type NoticeTone = 'error' | 'success' | 'warning'

type NoticeScreenProps = {
  actionLabel?: string
  detail?: ReactNode
  fullScreen?: boolean
  icon?: LucideIcon
  onAction?: () => void
  secondaryIcon?: LucideIcon
  tone?: NoticeTone
  title: string
}

export default function NoticeScreen({ actionLabel, detail, fullScreen = true, icon: Icon, onAction, secondaryIcon: SecondaryIcon, title, tone = 'warning' }: NoticeScreenProps) {
  const noticeKey = `${title}-${tone}-${fullScreen}`
  const [closingNoticeKey, setClosingNoticeKey] = useState('')
  const isClosing = closingNoticeKey === noticeKey

  function handleAction() {
    if (!onAction || isClosing) return
    setClosingNoticeKey(noticeKey)
    window.setTimeout(() => {
      void Promise.resolve(onAction()).catch(() => {})
    }, 240)
  }

  return (
    <div className={`notice-screen notice-screen-${tone} ${fullScreen ? 'is-fullscreen' : 'is-modal'} ${isClosing ? 'is-closing' : ''}`}>
      <div className="notice-screen-panel">
        <div className="notice-screen-icon-wrap">
          {Icon ? (
            <>
              <Icon className="notice-screen-icon" aria-hidden="true" />
              {SecondaryIcon && <SecondaryIcon className="notice-screen-icon notice-screen-icon-secondary" aria-hidden="true" />}
            </>
          ) : (
            <StatusIcon tone={tone} />
          )}
        </div>
        <h2 className="notice-screen-title">{title}</h2>
        {detail && <div className="notice-screen-detail">{detail}</div>}
        {actionLabel && onAction && (
          <button className="notice-screen-button" type="button" onClick={handleAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

function StatusIcon({ tone }: { tone: NoticeTone }) {
  if (tone === 'success') {
    return (
      <svg className="notice-status-icon is-success" viewBox="0 0 64 64" aria-hidden="true">
        <path className="notice-status-mark" d="M20 33.5 28.5 42 45 25.5" />
      </svg>
    )
  }

  return (
    <AlertTriangle className={`notice-screen-icon notice-screen-icon-alert is-${tone}`} aria-hidden="true" />
  )
}
