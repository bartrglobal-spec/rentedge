'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// ─── Icons ───────────────────────────────────────────────

function IconHome({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

function IconSearch({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <path d="M16.5 16.5L21 21"/>
    </svg>
  )
}

function IconUser({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
}

function IconUnlock({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0110 0"/>
    </svg>
  )
}

function IconGrid({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )
}

// ─── Onboarding progress bar ─────────────────────────────

// Pages that are part of the onboarding funnel, in order
const ONBOARDING_PAGES = [
  '/check',
  '/adaptive-profile',
  '/preview',
]

const ONBOARDING_LABELS = [
  'Properties',
  'Profile',
  'Preview',
]

function OnboardingBar({ pathname }: { pathname: string }) {
  const currentIndex = ONBOARDING_PAGES.indexOf(pathname)
  if (currentIndex === -1) return null

  return (
    <div className="onboarding-bar">
      <div className="onboarding-steps">
        {ONBOARDING_PAGES.map((_, i) => (
          <div
            key={i}
            className={
              'onboarding-step ' +
              (i < currentIndex
                ? 'onboarding-step-done'
                : i === currentIndex
                ? 'onboarding-step-active'
                : '')
            }
          />
        ))}
      </div>
      <span className="onboarding-label">
        {ONBOARDING_LABELS[currentIndex]}
      </span>
    </div>
  )
}

// ─── Nav items ───────────────────────────────────────────

const NAV_ITEMS = [
  { name: 'Home',      path: '/',          icon: <IconHome /> },
  { name: 'Check',     path: '/check',     icon: <IconSearch /> },
  { name: 'Profile',   path: '/adaptive-profile', icon: <IconUser /> },
  { name: 'Unlock',    path: '/unlock',    icon: <IconUnlock /> },
  { name: 'Dashboard', path: '/dashboard', icon: <IconGrid /> },
]

// Pages where the bottom nav is always hidden (onboarding funnel)
const NAV_HIDDEN_PATHS = ['/', '/check', '/adaptive-profile', '/preview']

// ─── Shell ───────────────────────────────────────────────

export default function Shell({ children }: { children: ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    const complete =
      localStorage.getItem('rentedge_profile_complete') === 'true'
    setProfileComplete(complete)
  }, [pathname])

  // Nav is visible only after onboarding is complete,
  // OR if the user is already on /unlock or /dashboard
  const isOnboardingPage = NAV_HIDDEN_PATHS.includes(pathname)
  const showNav = profileComplete || (!isOnboardingPage)

  // During onboarding: no nav padding. After: add nav padding.
  const showOnboardingBar = ONBOARDING_PAGES.includes(pathname)

  return (
    <div className="app-bg">
      <div className="app-frame">

        {/* ONBOARDING PROGRESS — shown during funnel only */}
        {showOnboardingBar && (
          <OnboardingBar pathname={pathname} />
        )}

        {/* PAGE CONTENT */}
        <div
          className={
            'app-content ' +
            (showNav ? 'app-content-with-nav' : '')
          }
        >
          {children}
        </div>

        {/* BOTTOM NAV — hidden during onboarding */}
        {showNav && (
          <nav className="app-nav">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.path ||
                (item.path !== '/' && pathname.startsWith(item.path))

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => router.push(item.path)}
                  className={'nav-item ' + (active ? 'nav-active' : '')}
                  style={{
                    color: active
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                  }}
                >
                  {/* Active background pill */}
                  {active && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: '4px 2px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    />
                  )}

                  <div style={{ position: 'relative' }}>
                    {item.icon}
                  </div>

                  <span className="nav-label" style={{ position: 'relative' }}>
                    {item.name}
                  </span>

                  <div
                    className="nav-dot"
                    style={{
                      background: active ? 'var(--accent-primary)' : 'transparent',
                    }}
                  />
                </button>
              )
            })}
          </nav>
        )}

      </div>
    </div>
  )
}
