import { useEffect, useRef } from 'react'

// UW-flavoured confetti palette: spirit gold, metallic gold, gold-light, white, purple.
const COLORS = ['#ffc700', '#b7a57a', '#e8e3d3', '#ffffff', '#6f51b8']
const GRAVITY = 340 // px/s²

type Piece = {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  fall: number // gentle terminal fall speed
  color: [number, number, number]
  rot: number
  rotSpeed: number
  sway: number
  swaySpeed: number
  swayAmp: number
  flip: number
  flipSpeed: number
  sparkle: number
  sparkleSpeed: number
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// Mix a colour toward white by `amt` (0..1) for the lit-face highlight.
function lit([r, g, b]: [number, number, number], amt: number, alpha: number): string {
  const m = (c: number) => Math.round(c + (255 - c) * amt)
  return `rgba(${m(r)}, ${m(g)}, ${m(b)}, ${alpha})`
}

export default function ConfettiField({ burst = false }: { burst?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = canvas.clientWidth || window.innerWidth
    let height = canvas.clientHeight || window.innerHeight

    const resize = () => {
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const rnd = (a: number, b: number) => a + Math.random() * (b - a)
    const make = (far: boolean): Piece => {
      const fall = far ? rnd(28, 50) : rnd(46, 82)
      const piece: Piece = {
        x: rnd(0, width),
        y: rnd(-height * 0.25, height),
        vx: 0,
        vy: fall,
        w: far ? rnd(11, 19) : rnd(5, 10),
        h: far ? rnd(7, 13) : rnd(4, 8),
        fall,
        color: hexToRgb(COLORS[Math.floor(Math.random() * COLORS.length)]),
        rot: rnd(0, Math.PI * 2),
        rotSpeed: rnd(-0.7, 0.7),
        sway: rnd(0, Math.PI * 2),
        swaySpeed: rnd(0.4, 1.1),
        swayAmp: far ? rnd(12, 24) : rnd(7, 14),
        flip: rnd(0, Math.PI * 2),
        flipSpeed: rnd(1.3, 2.8),
        sparkle: rnd(0, Math.PI * 2),
        sparkleSpeed: rnd(2.4, 5.2),
      }
      if (burst && !reduce) {
        // Pop from the top edge, then cascade down into the cap reveal.
        const angle = rnd(Math.PI * 0.18, Math.PI * 0.82)
        const speed = rnd(240, 620) * (far ? 0.82 : 1)
        piece.x = width / 2 + rnd(-width * 0.28, width * 0.28)
        piece.y = rnd(-42, 20)
        piece.vx = Math.cos(angle) * speed
        piece.vy = Math.sin(angle) * speed + rnd(30, 120)
      }
      return piece
    }

    const far = Array.from({ length: reduce ? 8 : 13 }, () => make(true))
    const near = Array.from({ length: reduce ? 6 : 9 }, () => make(false))

    const drawPiece = (p: Piece, dt: number, animate: boolean) => {
      if (animate) {
        p.vy += GRAVITY * dt
        if (p.vy > p.fall) p.vy = p.fall // settle to a gentle terminal fall
        p.vx *= Math.max(0, 1 - 2.1 * dt) // air drag on the burst
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.sway += p.swaySpeed * dt
        p.rot += p.rotSpeed * dt
        p.flip += p.flipSpeed * dt
        p.sparkle += p.sparkleSpeed * dt
        if (p.y - 24 > height) {
          p.y = -24
          p.x = rnd(0, width)
          p.vx = 0
          p.vy = p.fall
        }
        if (p.x < -60) p.x = width + 60
        else if (p.x > width + 60) p.x = -60
      }
      const x = p.x + Math.sin(p.sway) * p.swayAmp
      const flipScale = Math.cos(p.flip) // -1..1
      const face = Math.abs(flipScale) // 0 = edge-on, 1 = face-on toward light
      const sparkle = Math.max(0, Math.sin(p.sparkle))

      ctx.save()
      ctx.translate(x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(1, Math.max(0.08, face)) // foreshorten as it flips
      ctx.shadowColor = lit(p.color, 0.82, 0.6)
      ctx.shadowBlur = 4 + sparkle * 8

      const grad = ctx.createLinearGradient(-p.w / 2, -p.h / 2, p.w / 2, p.h / 2)
      grad.addColorStop(0, lit(p.color, 0.1, 0.28 + 0.3 * face))
      grad.addColorStop(0.46, lit(p.color, 0.72 * face + sparkle * 0.22, 0.38 + 0.36 * face))
      grad.addColorStop(1, lit(p.color, 0.05, 0.24 + 0.28 * face))
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 1.6)
      ctx.fill()

      // Specular glint as the piece turns face-on to the light.
      if (face > 0.88 || sparkle > 0.92) {
        const intensity = Math.min(1, ((face - 0.88) / 0.12) * 0.68 + sparkle * 0.24)
        ctx.globalAlpha = intensity
        ctx.fillStyle = 'rgba(255,255,255,0.95)'
        ctx.shadowColor = 'rgba(255,255,255,0.9)'
        ctx.shadowBlur = 12
        const s = Math.min(p.w, p.h) * 0.22
        ctx.beginPath()
        ctx.roundRect(-s, -s * 0.28, s * 2, s * 0.56, s)
        ctx.roundRect(-s * 0.28, -s, s * 0.56, s * 2, s)
        ctx.fill()
      }
      ctx.restore()
    }

    let last = performance.now()
    let raf = 0

    const render = (animate: boolean, dt: number) => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'
      ctx.filter = 'blur(4.4px)'
      for (const p of far) drawPiece(p, dt, animate)
      ctx.filter = 'blur(1.45px)'
      for (const p of near) drawPiece(p, dt, animate)
      ctx.filter = 'none'
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
    }

    if (reduce) {
      render(false, 0)
    } else {
      const loop = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        render(true, dt)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [burst])

  return <canvas ref={canvasRef} className="confetti-field" aria-hidden="true" />
}
