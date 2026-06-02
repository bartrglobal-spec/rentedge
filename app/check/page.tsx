'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)

  const [properties, setProperties] = useState<any[]>([])

  const [extracting, setExtracting] =
    useState(false)

  const [extractMessage, setExtractMessage] =
    useState('')

  const [current, setCurrent] = useState({
    link: '',
    area: '',
    rent: '',
    bedrooms: '',
    title: '',
  })

  const hasLoaded = useRef(false)

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem(
        'rentedge_profile'
      ) || 'null'
    )

    if (saved) {
      const normalizedProfile = {
        ...saved,

        pets:
          saved.pets === true ||
          saved.pets === 'Yes',

        payslipReady:
          saved.payslipReady === true ||
          saved.payslip === true,

        idReady:
          saved.idReady === true,
      }

      setProfile(normalizedProfile)
    }
  }, [])

  useEffect(() => {
    const savedProps = JSON.parse(
      localStorage.getItem(
        'rentedge_properties'
      ) || '[]'
    )

    if (
      Array.isArray(savedProps) &&
      savedProps.length > 0
    ) {
      const normalized = savedProps.map(
        (p: any) => ({
          id: p.id,
          rent: Number(p.rent),
          bedrooms: Number(p.bedrooms),
          title:
            p.title ||
            p.label ||
            p.location ||
            'Property',
          location:
            p.location ||
            p.label ||
            '',
        })
      )

      setProperties(normalized)
    }

    hasLoaded.current = true
  }, [])

  useEffect(() => {
    if (!hasLoaded.current) return

    localStorage.setItem(
      'rentedge_properties',
      JSON.stringify(properties)
    )
  }, [properties])

  const handleAutofill = async () => {
    if (!current.link) {
      alert('Paste a property link first')
      return
    }

    try {
      setExtracting(true)

      setExtractMessage(
        'Extracting property details...'
      )

      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          url: current.link,
        }),
      })

      if (!res.ok) {
        throw new Error()
      }

      const data = await res.json()

      setCurrent((prev) => ({
        ...prev,

        title:
          data.location ||
          data.title ||
          '',

        area:
          data.location ||
          prev.area,

        rent: data.price
          ? String(data.price)
          : prev.rent,

        bedrooms: data.bedrooms
          ? String(data.bedrooms)
          : prev.bedrooms,
      }))

      setExtractMessage(
        'Property details extracted successfully'
      )
    } catch {
      setExtractMessage(
        'Extraction failed. Complete manually.'
      )
    } finally {
      setExtracting(false)
    }
  }

  const addProperty = () => {
    if (
      !current.area ||
      !current.rent ||
      !current.bedrooms
    ) {
      alert(
        'Complete property details first'
      )

      return
    }

    const bedrooms = Number(
      current.bedrooms
    )

    const area = current.area

    setProperties((prev) => [
      ...prev,

      {
        id: Date.now(),

        rent: Number(current.rent),

        bedrooms,

        title:
          current.title ||
          `${bedrooms}-bedroom in ${area}`,

        location: area,
      },
    ])

    setCurrent({
      link: '',
      area: '',
      rent: '',
      bedrooms: '',
      title: '',
    })

    setExtractMessage('')
  }

  const removeProperty = (id: number) => {
    setProperties((prev) =>
      prev.filter((p) => p.id !== id)
    )
  }

  const goToUnlock = (id: number) => {
    localStorage.setItem(
      'rentedge_selected_property_id',
      String(id)
    )

    router.push('/unlock-preview')
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <div className="text-[11px] uppercase tracking-[0.28em] text-blue-200/50">
          Property Check
        </div>

        <h1 className="mt-3 text-[30px] font-semibold tracking-tight text-white">
          Evaluate a rental property
        </h1>

        <p className="mt-3 max-w-sm text-sm leading-7 text-white/50">
          Understand affordability pressure,
          approval friction, and renter
          positioning before applying.
        </p>

      </div>

      {/* PROPERTY INPUT */}

      <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(9,14,24,0.98))] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">

        <div className="flex items-start justify-between gap-4">

          <div>

            <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">
              Property Details
            </div>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Add a rental listing
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Paste a listing URL or enter
              the property manually.
            </p>

          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-[11px] text-blue-200">
            Beta
          </div>

        </div>

        {/* LINK INPUT */}

        <div className="mt-6 space-y-4">

          <div>

            <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-white/35">
              Listing Link
            </div>

            <input
              placeholder="https://www.property24.com/..."
              value={current.link}
              onChange={(e) =>
                setCurrent({
                  ...current,
                  link: e.target.value,
                })
              }
              className="input"
            />

          </div>

          {/* EXTRACT BUTTON */}

          <button
            onClick={handleAutofill}
            disabled={extracting}
            className="
              flex
              w-full
              items-center
              justify-center
              rounded-2xl
              border
              border-blue-500/20
              bg-blue-500/10
              px-5
              py-4
              text-sm
              font-semibold
              text-blue-100
              transition
              hover:bg-blue-500/15
              disabled:opacity-50
            "
          >
            {extracting
              ? 'Extracting listing details...'
              : 'Extract property details'}
          </button>

          {/* EXTRACTION FEEDBACK */}

          {extractMessage && (

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
              {extractMessage}
            </div>

          )}

          {/* MANUAL INPUTS */}

          <div className="grid gap-3 pt-2">

            <input
              placeholder="Area / Suburb"
              value={current.area}
              onChange={(e) =>
                setCurrent({
                  ...current,
                  area: e.target.value,
                })
              }
              className="input"
            />

            <input
              placeholder="Monthly rent (R)"
              value={current.rent}
              onChange={(e) =>
                setCurrent({
                  ...current,
                  rent: e.target.value,
                })
              }
              className="input"
            />

            <input
              placeholder="Bedrooms"
              value={current.bedrooms}
              onChange={(e) =>
                setCurrent({
                  ...current,
                  bedrooms: e.target.value,
                })
              }
              className="input"
            />

          </div>

          {/* ADD BUTTON */}

          <button
            onClick={addProperty}
            className="btn-primary"
          >
            Add Property
          </button>

        </div>

      </section>

      {/* SAVED PROPERTIES */}

      {properties.length > 0 && (

        <section className="space-y-3">

          <div className="flex items-center justify-between">

            <div>

              <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                Workspace
              </div>

              <div className="mt-2 text-xl font-semibold">
                Saved target properties
              </div>

            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/45">
              {properties.length} tracked
            </div>

          </div>

          {properties.map((p, index) => (

            <div
              key={p.id}
              className="rounded-[26px] border border-white/10 bg-[#0b1220] p-5"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0 flex-1">

                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                    {index === 0
                      ? 'Primary Target'
                      : 'Tracked Property'}
                  </div>

                  <h3 className="mt-3 text-xl font-semibold leading-tight text-white break-words">
                    {p.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/45">

                    <span>
                      R{p.rent}
                    </span>

                    <span className="text-white/20">
                      •
                    </span>

                    <span>
                      {p.bedrooms} bedroom
                    </span>

                  </div>

                </div>

                <button
                  onClick={() =>
                    removeProperty(p.id)
                  }
                  className="text-xs text-white/35 transition hover:text-white/60"
                >
                  Remove
                </button>

              </div>

              {/* MAIN ACTION */}

              <div className="mt-5">

                <button
                  onClick={() =>
                    goToUnlock(p.id)
                  }
                  className="w-full rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  View Property Analysis
                </button>

              </div>

              {/* BETA INFO */}

              <div className="mt-4 rounded-2xl border border-blue-500/15 bg-blue-500/10 px-4 py-3 text-sm leading-6 text-blue-100/90">
                Free beta access is currently active while RentEdge positioning systems are being refined.
              </div>

            </div>

          ))}

        </section>

      )}

    </div>
  )
}