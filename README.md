# Commencement Invite

UW Tacoma commencement invitation for Asadullah Nasry.

## Local development

```bash
npm install
npm run dev
```

The app is static and has no backend/API dependency.

## Content Editing

Editable invitation copy and page structure lives in `src/invitationTemplate.ts`.

Reusable transition helpers live in `src/components/animation/`:

- `BlurFade` for reveal animations.
- `AnimatedSwap` for animated content changes.
- `motionPresets.ts` for shared Framer Motion variants and stagger helpers.

## Language

The template only uses the `lang` query parameter:

- `?lang=en` shows the English copy.
- `?lang=fa` switches to the Farsi copy.
