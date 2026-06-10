import { CalendarDays, Heart, type LucideIcon } from 'lucide-react'

export type InvitationLanguage = 'en' | 'fa'

export type TemplatePage = {
  id: string
  icon?: LucideIcon
  theme?: 'soft' | 'ink' | 'warm' | 'fresh'
  accent?: string
  align?: 'center' | 'top' | 'bottom'
  content: Record<InvitationLanguage, {
    eyebrow?: string
    title: string
    subtitle?: string
    body?: string[]
    meta?: string[]
    actionLabel?: string
  }>
}

export type UniversityIntro = {
  enabled: boolean
  durationMs: number
  inviteDurationMs: number
  logoSrc?: string
  inviteLogoSrc?: string
  monogram: string
  invite: Record<InvitationLanguage, string>
  occasion: Record<InvitationLanguage, string>
  graduate: Record<InvitationLanguage, string>
  name: Record<InvitationLanguage, string>
  label: Record<InvitationLanguage, string>
  colors: {
    primary: string
    secondary: string
    accent: string
    ink: string
  }
}

export type InvitationTemplate = {
  defaultLanguage: InvitationLanguage
  universityIntro: UniversityIntro
  pages: TemplatePage[]
}

export const invitationTemplate: InvitationTemplate = {
  defaultLanguage: 'en',
  universityIntro: {
    enabled: true,
    durationMs: 15400,
    inviteDurationMs: 3100,
    logoSrc: '/uw-block-w.png',
    inviteLogoSrc: '/w-gold.png',
    monogram: 'W',
    invite: {
      en: "You're Invited",
      fa: 'از جناب شما احترامانه دعوت می نماییم تا در محفل فراغت اسدالله نصری تشریف آورده ممنون فرمایید.',
    },
    occasion: {
      en: 'Commencement\nCeremony',
      fa: 'محفل فراغت',
    },
    graduate: {
      en: 'Asadullah Nasry',
      fa: 'اسدالله نصری',
    },
    name: {
      en: 'University of Washington Tacoma',
      fa: 'University of Washington Tacoma',
    },
    label: {
      en: 'Class of 2026',
      fa: 'صنف ‎2026',
    },
    colors: {
      primary: '#32006e',
      secondary: '#ffffff',
      accent: '#b7a57a',
      ink: '#1e1238',
    },
  },
  pages: [
    {
      id: 'details',
      icon: CalendarDays,
      theme: 'warm',
      accent: '#ffc700',
      align: 'bottom',
      content: {
        en: {
          eyebrow: 'Details',
          title: 'Date, Time, and Place',
          body: ['Put the important event details here.'],
          meta: ['Date placeholder', 'Time placeholder', 'Location placeholder'],
          actionLabel: 'Next',
        },
        fa: {
          eyebrow: 'جزئیات',
          title: 'تاریخ، زمان و مکان',
          body: ['جزئیات مهم مراسم را اینجا قرار دهید.'],
          meta: ['جای تاریخ', 'جای زمان', 'جای مکان'],
          actionLabel: 'بعدی',
        },
      },
    },
    {
      id: 'closing',
      icon: Heart,
      theme: 'soft',
      accent: '#b7a57a',
      align: 'center',
      content: {
        en: {
          eyebrow: 'Timeline',
          title: 'Ceremony Schedule',
          subtitle: 'A simple guide for the day.',
          body: ['Ceremony, greetings, prayer, and meal details are listed in order.'],
        },
        fa: {
          eyebrow: 'برنامه',
          title: 'برنامه مراسم',
          subtitle: 'راهنمای کوتاه برای روز محفل.',
          body: ['مراسم، تبریکی، نماز و صرف طعام به ترتیب درج شده است.'],
        },
      },
    },
  ],
}
