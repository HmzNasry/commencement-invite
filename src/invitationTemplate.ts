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

export type InvitationTemplate = {
  defaultLanguage: InvitationLanguage
  pages: TemplatePage[]
}

export const invitationTemplate: InvitationTemplate = {
  defaultLanguage: 'en',
  pages: [
    {
      id: 'cover',
      icon: Heart,
      theme: 'soft',
      accent: '#d8bfa6',
      align: 'center',
      content: {
        en: {
          eyebrow: 'Invitation Template',
          title: 'Main Title',
          subtitle: 'Short line for the first page.',
          body: ['Replace this with the opening invitation copy.'],
          actionLabel: 'Continue',
        },
        fa: {
          eyebrow: 'قالب دعوت‌نامه',
          title: 'عنوان اصلی',
          subtitle: 'جمله کوتاه برای صفحه اول.',
          body: ['متن شروع دعوت‌نامه را اینجا جایگزین کنید.'],
          actionLabel: 'ادامه',
        },
      },
    },
    {
      id: 'details',
      icon: CalendarDays,
      theme: 'warm',
      accent: '#c9976b',
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
      accent: '#9fb37f',
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
      accent: '#b9c7d1',
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
      accent: '#d6a8b0',
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
