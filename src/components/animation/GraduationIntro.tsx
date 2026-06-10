import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import * as THREE from 'three'
import AshText from './AshText'
import ConfettiField from './ConfettiField'
import WriteOn from './WriteOn'
import { invitationTemplate, type InvitationLanguage } from '../../invitationTemplate'

// When the cap + reveal text begin, after the invite logo has slowly grown and ashed away.
const REVEAL_AT_MS = 6800
const INVITE_WRITE_START = 1.42
const INVITE_WRITE_DURATION = 1.55
const INVITE_ASH_START = 4.9
const FARSI_INVITE_ASH_START = 10
const INVITE_ASH_DURATION = 1.7
const EASE = [0.19, 1, 0.22, 1] as const

// Hand-drawn education sketches (viewBox ~200) painted onto the inside of the globe.
const MOTIF_PATHS: Record<string, string[]> = {
  cap: [
    'M100 34 L182 70 L100 106 L18 70 Z',
    'M58 88 L58 124 Q100 146 142 124 L142 88',
    'M100 70 L160 78 L160 138',
    'M160 138 q-9 16 0 26 q9 -10 0 -26',
  ],
  book: [
    'M22 58 Q60 42 100 60 Q140 42 178 58 L178 138 Q140 122 100 140 Q60 122 22 138 Z',
    'M100 60 L100 140',
    'M40 78 Q70 68 90 78 M40 98 Q70 88 90 98 M110 78 Q140 68 160 78 M110 98 Q140 88 160 98',
  ],
  scroll: [
    'M56 40 Q40 40 40 56 L40 150 Q40 166 56 166 L150 166 Q166 166 166 150 L166 56 Q166 40 150 40 Z',
    'M40 56 Q40 40 24 40 Q40 40 40 56 M166 150 Q166 166 182 166 Q166 166 166 150',
    'M64 74 L142 74 M64 96 L142 96 M64 118 L120 118',
  ],
  diploma: [
    'M30 86 Q30 70 46 70 L154 70 Q170 70 170 86 L170 100 Q170 116 154 116 L46 116 Q30 116 30 100 Z',
    'M30 86 q-12 0 -16 -8 q4 14 16 14 M170 100 q12 0 16 8 q-4 -14 -16 -14',
    'M92 105 L86 132 L100 122 L114 132 L108 105',
  ],
  laurel: [
    'M100 168 Q56 140 52 92 Q50 62 70 40',
    'M100 168 Q144 140 148 92 Q150 62 130 40',
    'M64 64 q-18 -4 -22 -20 q16 2 24 16 M70 92 q-20 0 -26 -16 q18 0 26 14 M82 124 q-18 4 -26 -10 q16 -4 26 8',
    'M136 64 q18 -4 22 -20 q-16 2 -24 16 M130 92 q20 0 26 -16 q-18 0 -26 14 M118 124 q18 4 26 -10 q-16 -4 -26 8',
  ],
}

type IntroColors = typeof invitationTemplate.universityIntro.colors

function makeWallpaper(): THREE.CanvasTexture {
  const W = 2048
  const H = 1024
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const kinds = Object.keys(MOTIF_PATHS)
  // Deterministic PRNG so the wallpaper is stable across renders.
  let seed = 9
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }

  // Sparse, hand-drawn feel: fewer motifs, each stroked twice with jitter.
  const cols = 7
  const rows = 4
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.filter = 'blur(2.5px)' // slight softness so the sketches sit behind the cap
  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      if (rnd() < 0.16) continue // leave breathing room
      const kind = kinds[Math.floor(rnd() * kinds.length)]
      const cx = ((i + 0.5 + (rnd() - 0.5) * 0.6) / cols) * W
      const cy = ((j + 0.5 + (rnd() - 0.5) * 0.6) / rows) * H
      const scale = 0.5 + rnd() * 0.55
      const rot = (rnd() - 0.5) * 0.9
      const alpha = 0.1 + rnd() * 0.14
      const paths = MOTIF_PATHS[kind].map((d) => new Path2D(d))
      // Two slightly offset passes read as a loose pencil sketch.
      for (let pass = 0; pass < 2; pass += 1) {
        ctx.save()
        ctx.translate(cx + (rnd() - 0.5) * 3, cy + (rnd() - 0.5) * 3)
        ctx.rotate(rot + (rnd() - 0.5) * 0.04)
        ctx.scale(scale, scale)
        ctx.translate(-100, -100)
        ctx.strokeStyle = `rgba(210, 196, 158, ${(alpha * (pass ? 0.62 : 1)).toFixed(3)})`
        ctx.lineWidth = 1.7 + rnd() * 0.6
        for (const p of paths) ctx.stroke(p)
        ctx.restore()
      }
    }
  }

  ctx.filter = 'none'

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function buildCap(colors: IntroColors): THREE.Group {
  const group = new THREE.Group()

  // Matte black cloth so it reads as a real graduation cap.
  const cloth = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0c0c11'),
    metalness: 0,
    roughness: 0.92,
  })
  const gold = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.accent),
    metalness: 0.5,
    roughness: 0.45,
  })

  // Head band (the rounded cap that sits on the head) — visible below the board.
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.6, 0.5, 44), cloth)
  head.position.y = -0.05
  group.add(head)

  // Mortarboard — square plate rotated 45° so a corner points forward (classic diamond).
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 2.3), cloth)
  board.position.y = 0.26
  board.rotation.y = Math.PI / 4
  group.add(board)

  // Button on top centre.
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20), gold)
  button.position.y = 0.32
  group.add(button)

  // Tassel — rides clearly above the board from the button, then drapes off
  // just past the front corner tip so it never intersects the board.
  const cornerZ = (2.3 / 2) * Math.SQRT2 // forward corner after 45° rotation
  const boardTop = 0.29 // board centre 0.26 + half thickness
  const restY = boardTop + 0.06 // sit above the surface, clear of the tube radius
  const hangZ = cornerZ * 1.06 // beyond the corner tip
  const endY = -0.62
  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, restY, 0),
      new THREE.Vector3(0, restY, cornerZ * 0.45),
      new THREE.Vector3(0, restY - 0.01, cornerZ * 0.82),
      new THREE.Vector3(0, restY - 0.02, cornerZ * 0.98),
      new THREE.Vector3(0, 0.18, hangZ),
      new THREE.Vector3(0, -0.22, hangZ),
      new THREE.Vector3(0, endY, hangZ),
    ],
    false,
    'centripetal',
  )
  const tassel = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, 0.017, 8), gold)
  group.add(tassel)

  // Tassel knot + hanging bullion at the end of the string.
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), gold)
  knot.position.set(0, endY, hangZ)
  group.add(knot)
  const bell = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 18), gold)
  bell.position.set(0, endY - 0.16, hangZ)
  group.add(bell)

  group.rotation.x = 0.3 // angle so both the board top and the head band read
  return group
}

export default function GraduationIntro({
  language,
  onComplete,
  onReveal,
  initialRevealed = false,
}: {
  language: InvitationLanguage
  onComplete: () => void
  onReveal?: () => void
  initialRevealed?: boolean
}) {
  const intro = invitationTemplate.universityIntro
  const colors = intro.colors
  const isFarsi = language === 'fa'
  const prefersReducedMotion = useReducedMotion()
  const mountRef = useRef<HTMLDivElement | null>(null)
  const didRevealRef = useRef(initialRevealed)
  const autoAshStart = isFarsi ? FARSI_INVITE_ASH_START : INVITE_ASH_START
  const autoRevealAtMs = isFarsi ? (FARSI_INVITE_ASH_START + INVITE_ASH_DURATION) * 1000 + 250 : REVEAL_AT_MS
  const [overtureReleased, setOvertureReleased] = useState(false)
  const [ashNowSignal, setAshNowSignal] = useState(0)
  const revealDelay = initialRevealed
    ? 0
    : prefersReducedMotion
      ? 600
      : overtureReleased
        ? INVITE_ASH_DURATION * 1000 + 250
        : autoRevealAtMs
  const [revealed, setRevealed] = useState(initialRevealed)

  useEffect(() => {
    void onComplete
  }, [onComplete])

  useEffect(() => {
    if (revealed || didRevealRef.current) return
    const timer = window.setTimeout(() => {
      didRevealRef.current = true
      setRevealed(true)
      onReveal?.()
    }, revealDelay)
    return () => window.clearTimeout(timer)
  }, [onReveal, revealDelay, revealed])

  function releaseFarsiOverture() {
    if (!isFarsi || revealed || overtureReleased || prefersReducedMotion) return
    setOvertureReleased(true)
    setAshNowSignal((value) => value + 1)
  }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    // Wide FOV gives the "inside a globe" bulge / fisheye at the edges.
    const camera = new THREE.PerspectiveCamera(86, 1, 0.1, 100)
    camera.position.set(0, 0, 5.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    // Globe — spinning sketches behind the invite overture; fades out at reveal.
    const wallpaper = makeWallpaper()
    const globeMat = new THREE.MeshBasicMaterial({ map: wallpaper, side: THREE.BackSide, transparent: true, opacity: 1 })
    const globe = new THREE.Mesh(new THREE.SphereGeometry(18, 64, 48), globeMat)
    scene.add(globe)

    // Central graduation cap.
    const cap = buildCap(colors)
    scene.add(cap)

    // Collect the cap's materials so we can fade it in.
    const capMaterials: THREE.Material[] = []
    cap.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        for (const m of mats) {
          m.transparent = true
          m.opacity = prefersReducedMotion ? 1 : 0
          if (!capMaterials.includes(m)) capMaterials.push(m)
        }
      }
    })

    // Lighting for the cap.
    scene.add(new THREE.AmbientLight(0xffffff, 0.75))
    const key = new THREE.DirectionalLight(0xfff2d6, 1.15)
    key.position.set(4, 7, 6)
    scene.add(key)
    const rim = new THREE.PointLight(new THREE.Color(colors.accent), 0.7, 40)
    rim.position.set(-5, -2, 4)
    scene.add(rim)

    const resize = () => {
      const w = mount.clientWidth || window.innerWidth
      const h = mount.clientHeight || window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    const clock = new THREE.Clock()
    let frame = 0
    // Let the ceremony title start first, then bring the cap in cleanly.
    const capStart = initialRevealed || prefersReducedMotion || revealed ? -10 : autoRevealAtMs / 1000 + 0.82

    const renderFrame = () => {
      const t = clock.getElapsedTime()
      // Spinning sketch globe behind the overture, then fade it out as the cap reveals.
      globe.rotation.y += 0.00345
      globe.rotation.x = -0.04 + Math.sin(t * 0.13) * 0.06
      const globeFade = 1 - Math.min(1, Math.max(0, (t - (capStart - 0.4)) / 1.0))
      globeMat.opacity = globeFade
      globe.visible = globeFade > 0.001
      // Cap spins slowly on its own axis and gently floats.
      cap.rotation.y += 0.0044
      // Smooth spring entrance: scale overshoots gently, opacity fades in.
      const capT = Math.min(1, Math.max(0, (t - capStart) / 1.4))
      const c1 = 1.70158
      const c3 = c1 + 1
      const spring = 1 + c3 * Math.pow(capT - 1, 3) + c1 * Math.pow(capT - 1, 2) // easeOutBack
      cap.scale.setScalar(Math.max(0.0001, spring))
      const fade = Math.min(1, capT * 1.7)
      for (const m of capMaterials) m.opacity = fade
      cap.position.y = Math.sin(t * 0.8) * 0.06 + (1 - capT) * 0.25 // settles down as it arrives
      renderer.render(scene, camera)
    }

    if (prefersReducedMotion) {
      cap.scale.setScalar(1)
      renderFrame()
    } else {
      const loop = () => {
        renderFrame()
        frame = requestAnimationFrame(loop)
      }
      frame = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      wallpaper.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mat = obj.material
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat.dispose()
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [autoRevealAtMs, colors, initialRevealed, prefersReducedMotion, revealed])

  const styleVars = {
    '--university-primary': colors.primary,
    '--university-secondary': colors.secondary,
    '--university-accent': colors.accent,
    '--university-ink': colors.ink,
  } as CSSProperties

  return (
    <motion.div
      className={`grad-intro${revealed ? ' is-revealed' : ''}${overtureReleased ? ' is-overture-released' : ''}`}
      style={{ ...styleVars, '--intro-logo-duration': `${autoRevealAtMs / 1000}s` } as CSSProperties}
      onPointerDown={releaseFarsiOverture}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.04,
        transition: { duration: 0.9, ease: EASE },
      }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className={`grad-intro-stage ${!revealed ? 'is-pre-reveal' : 'is-revealing'}`} ref={mountRef} aria-hidden="true" />
      <div className="grad-intro-vignette" aria-hidden="true" />
      {revealed && (
        <motion.div
          className="grad-intro-spotlight"
          aria-hidden="true"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: EASE }}
        />
      )}
      {revealed && <ConfettiField />}

      {/* Phase 1 — the invite: logo fades in and grows while the line writes
          out, then both grow + dissolve into ash. */}
      {!revealed && !prefersReducedMotion && (
        <div className="grad-intro-overture">
          <motion.div
            className="grad-intro-overture-sweep"
            initial={{ opacity: 0, x: '-46cqw', rotate: -17 }}
            animate={{ opacity: [0, 0.58, 0.42, 0], x: ['-46cqw', '18cqw', '70cqw', '122cqw'], rotate: [-17, -15, -13, -12] }}
            transition={{ duration: 5.2, delay: 0.35, times: [0, 0.26, 0.72, 1], ease: EASE }}
          />
          <div className="grad-intro-overture-logo">
            {intro.inviteLogoSrc && <img src={intro.inviteLogoSrc} alt="" aria-hidden="true" />}
          </div>
          <AshText
            className="grad-intro-overture-text"
            text={intro.invite[language]}
            direction={language === 'fa' ? 'rtl' : 'ltr'}
            fontFamily={language === 'fa' ? "'Noto Naskh Arabic', 'Mirza', serif" : "'Cormorant Garamond', Georgia, serif"}
            fontStyle={language === 'fa' ? 'normal' : 'italic'}
            writeStart={INVITE_WRITE_START}
            writeDur={INVITE_WRITE_DURATION}
            ashStart={autoAshStart}
            ashDur={INVITE_ASH_DURATION}
            ashNowSignal={ashNowSignal}
            windScale={0.7}
            maxSize={92}
            minSize={36}
            widthRatio={0.92}
          />
        </div>
      )}

      {/* Phase 2 — the reveal: cap grows in (WebGL) with the titles. */}
      {revealed && (
        <>
          <div className="grad-intro-header">
            <motion.p
              className="grad-intro-ordinal"
              aria-label="36th"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -10, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <span aria-hidden="true">
                36<sup>th</sup>
              </span>
            </motion.p>
            <WriteOn
              as="p"
              className="grad-intro-occasion"
              text={intro.occasion[language]}
              delay={0.2}
              stagger={0.052}
              duration={0.62}
              reduced={!!prefersReducedMotion}
            />
          </div>
          <div className="grad-intro-core">
            <WriteOn
              as="h1"
              className="grad-intro-graduate"
              text={intro.graduate[language]}
              delay={1.72}
              stagger={0.052}
              duration={0.7}
              reduced={!!prefersReducedMotion}
            />
            <WriteOn
              as="p"
              className="grad-intro-name"
              text={intro.name[language]}
              delay={2.72}
              stagger={0.026}
              duration={0.56}
              reduced={!!prefersReducedMotion}
            />
            <WriteOn
              as="p"
              className="grad-intro-eyebrow"
              text={intro.label[language]}
              delay={3.45}
              stagger={0.035}
              duration={0.58}
              reduced={!!prefersReducedMotion}
            />
            <motion.div
              className="grad-intro-underline"
              initial={prefersReducedMotion ? false : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.95, delay: 4.18, ease: EASE }}
            >
              <motion.span
                className="grad-intro-underline-glint"
                aria-hidden="true"
                initial={{ x: '-130%' }}
                animate={{ x: '130%' }}
                transition={{ duration: 1.35, delay: 5.05, ease: 'easeInOut', repeat: 1, repeatDelay: 0.62 }}
              />
            </motion.div>
          </div>
        </>
      )}

    </motion.div>
  )
}
