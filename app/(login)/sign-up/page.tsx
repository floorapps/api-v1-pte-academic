import { SignupForm } from '@/components/signup-form'

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  )
}
export const metadata = {
  title: "Sign Up | Pedagogist's PTE",
  description: 'Create your account and start practicing with AI scoring.',
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sign Up | Pedagogist's PTE",
    description: 'Create your account and start practicing with AI scoring.',
    url: '/sign-up',
    siteName: "Pedagogist's PTE",
    type: 'website',
  },
}
