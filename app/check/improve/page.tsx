'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'

export default function ImprovePage() {
  const params = useSearchParams()
  const router = useRouter()

  const rent = Number(params.get('rent') || 0)
  const income = Number(params.get('income') || 0)
  const occupants = Number(params.get('occupants') || 0)
  const bedrooms = Number(params.get('bedrooms') || 0)

  const actions = useMemo(() => {
    const list: {
      title: string
      note: string
      color: string
    }[] = []

    const ratio = income / rent
    const capacity = bedrooms * 2

    // Financial strength perception
    if (ratio < 3) {
      list.push({
        title: 'Be ready to pay deposit immediately',
        note: 'Landlords prefer applicants who can move quickly',
        color: 'bg-emerald-500',
      })
    }

    // Fit perception
    if (occupants > capacity) {
      list.push({
        title: 'Be clear about your household upfront',
        note: 'Avoid back-and-forth that weakens your application',
        color: 'bg-amber-500',
      })
    }

    // Always relevant advantages
    list.push({
      title: 'Have documents ready before applying',
      note: 'ID, payslips, and references ready improves approval speed',
      color: 'bg-emerald-500',
    })

    list.push({
      title: 'Apply early when the listing is fresh',
      note: 'Early applicants are reviewed first',
      color: 'bg-emerald-500',
    })

    list.push({
      title: 'Submit a complete application',
      note: 'Incomplete applications often get ignored',
      color: 'bg-amber-500',
    })

    if (list.length === 0) {
      list.push({
        title: 'You are already well positioned',
        note: 'Focus on applying early and cleanly',
        color: 'bg-emerald-500',
      })
    }

    return list
  }, [income, rent, occupants, bedrooms])

  function handleRecheck() {
    router.push(`/check/renter?rent=${rent}&bedrooms=${bedrooms}`)
  }

  return (
    <main className="min-h-screen bg-[#eef2f6]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#eef2f6]">

        {/* Header */}
        <header className="bg-[#0b1f3a] px-5 pt-6 pb-6 text-white">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
            Improve
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            How to stand out
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Small actions that improve how you are seen by landlords
          </p>
        </header>

        <div className="flex-1 px-4 py-4 space-y-4">

          {/* Property Context */}
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs uppercase text-slate-500">Property</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              R {rent.toLocaleString()} • {bedrooms} bedrooms
            </p>
          </section>

          {/* Actions */}
          {actions.map((item, i) => (
            <section
              key={i}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex gap-3">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.note}
                  </p>
                </div>
              </div>
            </section>
          ))}

        </div>

        {/* CTA */}
        <div className="px-4 pb-2">
          <button
            onClick={handleRecheck}
            className="w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white"
          >
            Adjust and recheck
          </button>
        </div>

        {/* Bottom Nav */}
        <nav className="border-t border-slate-200 bg-white">
          <div className="grid grid-cols-4 text-center text-xs">
            
          </div>
        </nav>

      </div>
    </main>
  )
}

function Tab({ label }: { label: string }) {
  return (
    <button className="flex flex-col items-center justify-center py-3 text-slate-400">
      <span className="mb-1 h-5 w-5 rounded-full border-2 border-slate-300" />
      <span>{label}</span>
    </button>
  )
}