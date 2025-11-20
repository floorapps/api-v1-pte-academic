import { GalleryVerticalEnd } from 'lucide-react'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          PTE Learning LMS
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
export const metadata = {
  title: "Sign In | Pedagogist's PTE",
  description: 'Access your dashboard and continue your practice.',
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sign In | Pedagogist's PTE",
    description: 'Access your dashboard and continue your practice.',
    url: '/sign-in',
    siteName: "Pedagogist's PTE",
    type: 'website',
  },
}
