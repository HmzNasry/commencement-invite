import { CalendarDays, Heart, MapPin, Sparkles, type LucideIcon } from 'lucide-react'

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
  logoSrc?: string
  monogram: string
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
    durationMs: 5200,
    logoSrc: '/uw-block-w.png',
    monogram: 'W',
    name: {
      en: 'University of Washington',
      fa: 'دانشگاه واشنگتن',
    },
    label: {
      en: 'Class of 2026',
      fa: 'فارغ‌التحصیلان ۲۰۲۶',
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
      id: 'cover',
      icon: Heart,
      theme: 'soft',
      accent: '#b7a57a',
      align: 'center',
      content: {
        en: {
          eyebrow: 'University of Washington',
          title: 'Graduation 2026',
          subtitle: 'A celebration in purple and gold.',
          body: ['Replace this with the graduate name, ceremony line, or opening invitation copy.'],
          actionLabel: 'Continue',
        },
        fa: {
          eyebrow: 'دانشگاه واشنگتن',
          title: 'فراغت ۲۰۲۶',
          subtitle: 'جشنی با رنگ‌های بنفش و طلایی.',
          body: ['نام فارغ‌التحصیل، متن مراسم یا دعوت‌نامه را اینجا جایگزین کنید.'],
          actionLabel: 'ادامه',
        },
      },
    },
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
      id: 'story',
      icon: Sparkles,
      theme: 'fresh',
      accent: '#b7a57a',
      align: 'center',
      content: {
        en: {
          eyebrow: 'Page Section',
          title: 'Content Page',
          subtitle: 'Use this page for a note, schedule, story, or custom section.',
          body: ['Add one or more paragraphs in the template file.'],
          actionLabel: 'Continue',
        },
        fa: {
          eyebrow: 'بخش صفحه',
          title: 'صفحه محتوا',
          subtitle: 'از این صفحه برای یادداشت، برنامه، داستان یا بخش دلخواه استفاده کنید.',
          body: ['یک یا چند پاراگراف را در فایل قالب اضافه کنید.'],
          actionLabel: 'ادامه',
        },
      },
    },
    {
      id: 'notes',
      icon: MapPin,
      theme: 'ink',
      accent: '#e8e3d3',
      align: 'top',
      content: {
        en: {
          eyebrow: 'Notes',
          title: 'Helpful Information',
          body: ['Add reminders, directions, dress code, gift note, or anything else.'],
          actionLabel: 'Next',
        },
        fa: {
          eyebrow: 'یادداشت‌ها',
          title: 'اطلاعات مفید',
          body: ['یادآوری‌ها، مسیر، پوشش، هدیه یا هر نکته دیگر را اضافه کنید.'],
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
          eyebrow: 'Closing Page',
          title: 'Final Message',
          subtitle: 'Place the closing note or call to action here.',
          body: ['This template is frontend-only. Add any link or button behavior inside the page renderer when needed.'],
        },
        fa: {
          eyebrow: 'صفحه پایانی',
          title: 'پیام پایانی',
          subtitle: 'متن پایانی یا دعوت به اقدام را اینجا قرار دهید.',
          body: ['این قالب فقط فرانت‌اند است. هر لینک یا رفتار دکمه را هنگام نیاز در رندر صفحه اضافه کنید.'],
        },
      },
    },
  ],
}
