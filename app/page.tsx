'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // If user has already completed profile, skip to check
    const profileComplete =
      localStorage.getItem('rentedge_profile_complete') === 'true'

    if (profileComplete) {
      router.replace('/check')
    }
  }, [router])

  if (!mounted) return null

  return (
    <div className="flex min-h-[calc(100dvh-80px)] flex-col px-2">

      {/* WORDMARK */}
      <div className="pt-8 pb-2">
        <span className="app-eyebrow tracking-[0.28em]">
          RENTEDGE
        </span>
      </div>

      {/* HERO AREA */}
      <div className="flex flex-1 flex-col justify-center gap-6 py-8">

        {/* MAIN CARD */}
        <div className="card-hero">
          <div className="app-badge badge-accent mb-5">
            For renters
          </div>

          <h1
            className="text-[26px] font-semibold leading-[1.2] tracking-[-0.03em]"
            style={{ color: 'var(--text-primary)' }}
          >
            Know what an agent
            might ask before
            you apply.
          </h1>

          <p className="mt-4 text-[14px] leading-[1.7]"
            style={{ color: 'var(--text-secondary)' }}>
            RentEdge helps you understand how your
            situation may be viewed — and what you
            can do to strengthen your position.
          </p>

          <div
            className="mt-6 h-px w-full"
            style={{ background: 'var(--accent-border)' }}
          />

          {/* WHAT IT DOES — 3 lines */}
          <div className="mt-5 flex flex-col gap-4">
            {[
              {
                icon: '○',
                text: 'Understand your rental picture',
              },
              {
                icon: '○',
                text: 'See what questions might come up',
              },
              {
                icon: '○',
                text: 'Get a strategy before you apply',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="mt-[3px] flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px]"
                  style={{
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-border)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  ✓
                </div>
                <span
                  className="text-[13px] leading-[1.5]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* WHAT TO EXPECT */}
        <div className="card">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.14em]"
            style={{ color: 'var(--text-muted)' }}
          >
            What to expect
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {[
              {
                step: '01',
                label: 'Tell us about your situation',
                sub: 'A few simple questions — no forms',
              },
              {
                step: '02',
                label: 'Add a property you\'re looking at',
                sub: 'Paste a link or enter the details',
              },
              {
                step: '03',
                label: 'Get your rental strategy',
                sub: 'Personalised to your situation',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl text-[11px] font-600"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-soft)',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <p
                    className="text-[13px] font-medium leading-[1.4]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BOTTOM CTA — stays near the bottom */}
      <div className="flex flex-col gap-3 pb-6">
        <button
          className="btn-primary"
          onClick={() => router.push('/profile')}
        >
          Get Started
        </button>

        <p
          className="text-center text-[11px]"
          style={{ color: 'var(--text-muted)' }}
        >
          Free to use · No account required · South Africa
        </p>
      </div>

    </div>
  )
}
