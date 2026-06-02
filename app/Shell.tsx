'use client'

import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  usePathname,
  useRouter,
} from 'next/navigation'

type NavItem = {
  name: string
  path: string
  visible?: boolean
  locked?: boolean
}

export default function Shell({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [profileComplete, setProfileComplete] =
    useState(false)

  const [hasUnlockData, setHasUnlockData] =
    useState(false)

  useEffect(() => {
    const profile =
      localStorage.getItem(
        'rentedge_profile_complete'
      ) === 'true'

    setProfileComplete(profile)

    try {
      const properties = JSON.parse(
        localStorage.getItem(
          'rentedge_properties'
        ) || '[]'
      )

      setHasUnlockData(
        Array.isArray(properties) &&
          properties.length > 0
      )
    } catch {
      setHasUnlockData(false)
    }
  }, [])

  const navItems: NavItem[] = useMemo(
    () => [
      {
        name: 'Home',
        path: '/',
      },
      {
        name: 'Profile',
        path: '/profile',
      },
      {
        name: 'Check',
        path: '/check',
        locked: !profileComplete,
      },
      {
        name: 'Unlock',
        path: '/unlock',
        visible: hasUnlockData,
        locked: !hasUnlockData,
      },
    ],
    [profileComplete, hasUnlockData]
  )

  const visibleNavItems = navItems.filter(
    (item) => item.visible !== false
  )

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* GLOBAL BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* TOP GLOW */}
        <div
          className="
            absolute
            left-1/2
            top-[-220px]
            h-[520px]
            w-[520px]
            -translate-x-1/2
            rounded-full
            bg-blue-500/10
            blur-3xl
          "
        />

        {/* SIDE GLOW */}
        <div
          className="
            absolute
            right-[-120px]
            top-[30%]
            h-[260px]
            w-[260px]
            rounded-full
            bg-cyan-400/5
            blur-3xl
          "
        />

        {/* GRID OVERLAY */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.03]
            [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)]
            [background-size:32px_32px]
          "
        />

      </div>

      {/* APP WRAPPER */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col">

        {/* DEVICE SURFACE */}
        <div
          className="
            relative
            flex
            min-h-screen
            flex-col
            border-x
            border-white/[0.04]
            bg-[linear-gradient(180deg,rgba(10,15,26,0.96),rgba(4,7,13,1))]
            shadow-[0_0_120px_rgba(0,0,0,0.45)]
          "
        >

          {/* TOP HAIRLINE */}
          <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

          {/* SCROLL CONTENT */}
          <section
            className="
              relative
              flex-1
              overflow-y-auto
              overflow-x-hidden
              px-4
              pt-5
              pb-32
              scrollbar-none
            "
          >
            {children}
          </section>

          {/* BOTTOM NAV */}
          <nav
            className="
              fixed
              bottom-0
              left-1/2
              z-50
              flex
              w-full
              max-w-md
              -translate-x-1/2
              items-center
              gap-2
              border-t
              border-white/[0.06]
              bg-[rgba(6,10,18,0.88)]
              px-3
              pb-[calc(env(safe-area-inset-bottom)+12px)]
              pt-3
              backdrop-blur-2xl
            "
          >

            {/* NAV SHADOW */}
            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-12
                bg-gradient-to-t
                from-transparent
                to-black/20
              "
            />

            {visibleNavItems.map((item) => {
              const active =
                pathname === item.path

              return (
                <button
                  key={item.path}
                  type="button"
                  disabled={item.locked}
                  onClick={() =>
                    router.push(item.path)
                  }
                  className={`
                    relative
                    flex
                    min-w-0
                    flex-1
                    flex-col
                    items-center
                    justify-center
                    gap-1.5
                    rounded-2xl
                    px-2
                    py-2.5
                    transition-all
                    duration-200
                    ${
                      active
                        ? `
                          bg-white
                          text-black
                          shadow-[0_10px_30px_rgba(255,255,255,0.12)]
                        `
                        : `
                          text-white/40
                          hover:bg-white/[0.03]
                          hover:text-white/70
                        `
                    }
                    ${
                      item.locked
                        ? 'cursor-not-allowed opacity-30'
                        : ''
                    }
                  `}
                >

                  {/* ACTIVE DOT */}
                  <div
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full
                      transition-all
                      ${
                        active
                          ? 'bg-black'
                          : 'bg-white/25'
                      }
                    `}
                  />

                  {/* LABEL */}
                  <span
                    className="
                      truncate
                      text-[11px]
                      font-medium
                      tracking-[-0.01em]
                    "
                  >
                    {item.name}
                  </span>

                </button>
              )
            })}

          </nav>

        </div>

      </div>

    </main>
  )
}