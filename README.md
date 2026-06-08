# Invitation Template

Frontend-only invitation template built with React, TypeScript, Vite, Framer Motion, GSAP, and Lucide icons.

## Local development

```bash
npm install
npm run dev
```

The app is static and has no backend/API dependency.

## Template editing

All editable invitation copy and page structure lives in `src/invitationTemplate.ts`. Add, remove, or reorder items in the `pages` array to build a new card.

Reusable transition helpers live in `src/components/animation/`:

- `BlurFade` for reveal animations.
- `AnimatedSwap` for animated content changes.
- `motionPresets.ts` for shared Framer Motion variants and stagger helpers.

## Language

The template only uses the `lang` query parameter:

- `?lang=en` shows the English copy.
- `?lang=fa` switches to the Farsi copy.
