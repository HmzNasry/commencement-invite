import { useEffect, useRef } from 'react'

type Particle = {
  hx: number
  hy: number
  windX: number
  windY: number
  seed: number
  size: number
  sparkle: boolean
}

// Draws crisp text, reveals it left-to-right (the "write"), then lets a wind
// erode it from the left so it blows off to the right as sparkling ash.
export default function AshText({
  text,
  className,
  color = '#f3ead6',
  fontFamily = "'Cormorant Garamond', Georgia, serif",
  fontStyle = 'italic',
  fontWeight = 600,
  direction = 'ltr',
  maxSize = 72,
  minSize = 26,
  widthRatio = 0.82,
  writeStart = 0.9,
  writeDur = 1.0,
  ashStart = 2.1,
  ashDur = 1.3,
  ashNowSignal = 0,
  windScale = 1,
}: {
  text: string
  className?: string
  color?: string
  fontFamily?: string
  fontStyle?: string
  fontWeight?: number
  direction?: 'ltr' | 'rtl'
  maxSize?: number
  minSize?: number
  widthRatio?: number
  writeStart?: number
  writeDur?: number
  ashStart?: number
  ashDur?: number
  ashNowSignal?: number
  windScale?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const elapsedRef = useRef(0)
  const manualAshStartRef = useRef<number | null>(null)

  useEffect(() => {
    if (ashNowSignal > 0) manualAshStartRef.current = elapsedRef.current
  }, [ashNowSignal])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let cancelled = false
    let raf = 0
    let particles: Particle[] = []
    let textCanvas: HTMLCanvasElement | null = null
    let W = 0
    let H = 0
    const ASH_BAND = 0.2 // how wide the erosion front is (fraction of width)

    const build = () => {
      W = canvas.clientWidth || window.innerWidth
      H = canvas.clientHeight || 120
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const off = document.createElement('canvas')
      off.width = canvas.width
      off.height = canvas.height
      const octx = off.getContext('2d')
      if (!octx) return
      octx.scale(dpr, dpr)

      let size = maxSize
      octx.font = `${fontStyle} ${fontWeight} ${size}px ${fontFamily}`
      const measured = octx.measureText(text).width
      if (measured > W * widthRatio) size = Math.max(minSize, (size * W * widthRatio) / measured)
      octx.font = `${fontStyle} ${fontWeight} ${size}px ${fontFamily}`
      octx.direction = direction
      octx.textAlign = 'center'
      octx.textBaseline = 'middle'
      octx.fillStyle = color
      octx.fillText(text, W / 2, H / 2)
      textCanvas = off

      const img = octx.getImageData(0, 0, off.width, off.height).data
      const step = Math.max(2, Math.round(2 * dpr))
      const next: Particle[] = []
      for (let py = 0; py < off.height; py += step) {
        for (let px = 0; px < off.width; px += step) {
          if (img[(py * off.width + px) * 4 + 3] > 130) {
            next.push({
              hx: px / dpr,
              hy: py / dpr,
              windX: (70 + Math.random() * 150) * windScale, // blown to the right
              windY: (-(Math.random() * 20) - 4 + (Math.random() - 0.5) * 10) * windScale, // gentle, stays in frame
              seed: Math.random() * Math.PI * 2,
              size: 1 + Math.random() * (1.3 * dpr),
              sparkle: Math.random() < 0.32,
            })
          }
        }
      }
      particles = next
    }

    let start = 0
    const frame = (now: number) => {
      if (cancelled) return
      if (!start) start = now
      const t = (now - start) / 1000
      elapsedRef.current = t
      const writeP = Math.max(0, Math.min(1, (t - writeStart) / writeDur))
      const effectiveAshStart = manualAshStartRef.current ?? ashStart
      const ashP = reduce ? 0 : Math.max(0, Math.min(1, (t - effectiveAshStart) / ashDur))
      const frontN = ashP * (1 + ASH_BAND)
      const revealEdge = t < effectiveAshStart || reduce ? writeP : 1

      ctx.clearRect(0, 0, W, H)

      // Crisp text: reveal and erosion respect the text direction.
      if (textCanvas) {
        const leftX = direction === 'rtl' ? (1 - revealEdge) * W : frontN * W
        const rightX = direction === 'rtl' ? (1 - frontN) * W : revealEdge * W
        if (rightX > leftX) {
          ctx.save()
          ctx.beginPath()
          ctx.rect(leftX, 0, rightX - leftX, H)
          ctx.clip()
          ctx.drawImage(textCanvas, 0, 0, textCanvas.width, textCanvas.height, 0, 0, W, H)
          ctx.restore()
        }
      }

      // Ash: particles behind the erosion front blow outward, sparkle, fade.
      if (ashP > 0) {
        for (const p of particles) {
          const positionN = direction === 'rtl' ? 1 - p.hx / W : p.hx / W
          const localAsh = Math.max(0, Math.min(1, (frontN - positionN) / ASH_BAND))
          if (localAsh <= 0) continue
          const e = 1 - (1 - localAsh) * (1 - localAsh)
          const x = p.hx + p.windX * (direction === 'rtl' ? -1 : 1) * e + Math.sin(t * 6 + p.seed) * 3 * e
          const y = p.hy + p.windY * e + Math.sin(t * 4 + p.seed) * 2 * e
          let alpha = 1 - localAsh
          if (alpha <= 0.02) continue
          if (p.sparkle) {
            const tw = 0.5 + 0.5 * Math.sin(t * 16 + p.seed)
            alpha = Math.min(1, alpha * (0.7 + 0.7 * tw))
            ctx.fillStyle = tw > 0.6 ? '#ffffff' : color
          } else {
            ctx.fillStyle = color
          }
          ctx.globalAlpha = alpha
          ctx.fillRect(x, y, p.size, p.size)
        }
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(frame)
    }

    const go = () => {
      if (cancelled) return
      build()
      raf = requestAnimationFrame(frame)
    }
    const fontStr = `${fontStyle} ${fontWeight} ${maxSize}px ${fontFamily}`
    if (document.fonts?.load) document.fonts.load(fontStr).then(go, go)
    else go()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [text, color, direction, fontFamily, fontStyle, fontWeight, maxSize, minSize, widthRatio, writeStart, writeDur, ashStart, ashDur, windScale])

  return <canvas ref={canvasRef} className={className} aria-label={text} role="img" />
}
