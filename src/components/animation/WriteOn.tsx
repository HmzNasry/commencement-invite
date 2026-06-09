import { type CSSProperties, type ElementType } from 'react'

const NBSP = ' '
const RTL_RE = /[\u0600-\u06ff]/

function tokenize(text: string) {
  if (!RTL_RE.test(text)) return Array.from(text)
  return text.split(/(\n|\s+)/u).filter(Boolean)
}

// Reveals text one character at a time with a soft blur/fade — a "write-out".
export default function WriteOn({
  text,
  as: Tag = 'span',
  className,
  delay = 0,
  stagger = 0.05,
  duration = 0.55,
  reduced = false,
}: {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
  duration?: number
  reduced?: boolean
}) {
  const chars = tokenize(text)
  return (
    <Tag className={className} aria-label={text}>
      {chars.map((char, i) => (
        char === '\n' ? (
          <br key={i} aria-hidden="true" />
        ) : (
          <span
            key={i}
            className={reduced ? undefined : 'write-on-char'}
            aria-hidden="true"
            style={
              {
                display: 'inline-block',
                whiteSpace: 'pre',
                '--glow-delay': `${i * 80}ms`,
                '--write-delay': `${delay + i * stagger}s`,
                '--write-duration': `${duration}s`,
              } as CSSProperties
            }
          >
            {char.trim() === '' ? NBSP : char}
          </span>
        )
      ))}
    </Tag>
  )
}
