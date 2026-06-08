import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import TemplateExperience from './TemplateExperience'
import NoticeScreen from './NoticeScreen'

export default function InviteApp() {
  const [bypassed, setBypassed] = useState(() => localStorage.getItem('desktopWarningBypassed') === 'true')
  const [isLargeScreen, setIsLargeScreen] = useState(() => window.innerWidth >= 1024)

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleProceed = () => {
    localStorage.setItem('desktopWarningBypassed', 'true')
    setBypassed(true)
    window.location.reload()
  }

  return (
    <>
      <TemplateExperience />
      {!bypassed && isLargeScreen && (
        <NoticeScreen
          icon={AlertTriangle}
          title="Not optimized for computer screens"
          actionLabel="Proceed anyways"
          onAction={handleProceed}
        />
      )}
    </>
  )
}
