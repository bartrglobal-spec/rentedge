'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type ProfileState = {
  income: string
  additionalIncome: string

  employment: string
  duration: string

  occupants: string
  pets: string
  smoking: string

  leasePreference: string
  moveTimeline: string

  depositReady: boolean
  idReady: boolean
  payslipReady: boolean
  bankStatementsReady: boolean
  referencesReady: boolean
  guarantorAvailable: boolean

  creditIssues: string
  evictionHistory: string
}

const initialProfile: ProfileState = {
  income: '',
  additionalIncome: '',

  employment: '',
  duration: '',

  occupants: '',
  pets: '',
  smoking: '',

  leasePreference: '',
  moveTimeline: '',

  depositReady: false,
  idReady: false,
  payslipReady: false,
  bankStatementsReady: false,
  referencesReady: false,
  guarantorAvailable: false,

  creditIssues: '',
  evictionHistory: '',
}

export default function ProfilePage() {
  const router = useRouter()

  const [profile, setProfile] =
    useState<ProfileState>(initialProfile)

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const existing =
      localStorage.getItem('rentedge_renter') ||
      localStorage.getItem('rentedge_profile')

    if (!existing) return

    try {
      const parsed = JSON.parse(existing)

      setProfile((prev) => ({
        ...prev,
        ...parsed,
      }))
    } catch {
      console.log('Profile load failed')
    }
  }, [])

  const update = (
    field: keyof ProfileState,
    value: any
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const completionScore = useMemo(() => {
    let total = 0

    if (profile.income) total += 1
    if (profile.employment) total += 1
    if (profile.duration) total += 1
    if (profile.occupants) total += 1
    if (profile.pets !== '') total += 1
    if (profile.smoking !== '') total += 1
    if (profile.moveTimeline) total += 1
    if (profile.leasePreference) total += 1

    if (profile.depositReady) total += 1
    if (profile.idReady) total += 1
    if (profile.payslipReady) total += 1
    if (profile.bankStatementsReady) total += 1
    if (profile.referencesReady) total += 1

    return Math.min(
      100,
      Math.round((total / 13) * 100)
    )
  }, [profile])

  const isComplete =
    profile.income &&
    profile.employment &&
    profile.duration &&
    profile.occupants &&
    profile.pets !== '' &&
    profile.smoking !== '' &&
    profile.moveTimeline !== ''

  const saveProfile = () => {
    const normalizedProfile = {
      ...profile,

      income: Number(profile.income || 0),

      additionalIncome: Number(
        profile.additionalIncome || 0
      ),

      occupants: Number(profile.occupants || 1),

      pets: profile.pets === 'Yes',

      smoking: profile.smoking === 'Yes',

      deposit: profile.depositReady
        ? 'full'
        : 'none',

      payslip: profile.payslipReady,
    }

    localStorage.setItem(
      'rentedge_renter',
      JSON.stringify(normalizedProfile)
    )

    localStorage.setItem(
      'rentedge_profile',
      JSON.stringify(normalizedProfile)
    )

    localStorage.setItem(
      'rentedge_profile_complete',
      'true'
    )

    setSaved(true)

    setTimeout(() => {
      setSaved(false)
      router.push('/')
    }, 1000)
  }

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <section className="space-y-4">
        <div>

          <p className="app-eyebrow">
            RENTER PROFILE
          </p>

          <h1 className="app-title">
            Build your rental position
          </h1>

          <p className="section-subtitle max-w-[92%]">
            RentEdge uses your renter profile to
            evaluate affordability, stability,
            household fit, and possible approval
            friction before you apply.
          </p>

        </div>

        {/* PROFILE STATUS */}
        <div className="card card-elevated space-y-4">

          <div className="flex items-start justify-between gap-4">

            <div>

              <p className="label">
                PROFILE STATUS
              </p>

              <p className="mt-2 text-base font-semibold text-white">
                {completionScore >= 85
                  ? 'Application-ready'
                  : completionScore >= 55
                  ? 'In progress'
                  : 'Getting started'}
              </p>

            </div>

            <div className="app-badge">
              {completionScore}% complete
            </div>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/5">

            <div
              className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500"
              style={{
                width: `${completionScore}%`,
              }}
            />

          </div>

          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            A more complete renter profile helps
            RentEdge generate stronger property-fit
            evaluations and clearer application
            guidance.
          </p>

        </div>

      </section>

      {/* FINANCIAL POSITION */}
      <section className="card space-y-5">

        <div>

          <p className="section-title">
            Financial position
          </p>

          <p className="section-subtitle">
            Affordability and income stability
            heavily influence rental confidence.
          </p>

        </div>

        <div className="space-y-3">

          <div className="space-y-2">

            <p className="label">
              Monthly income
            </p>

            <input
              type="number"
              placeholder="Monthly income (R)"
              value={profile.income}
              onChange={(e) =>
                update(
                  'income',
                  e.target.value
                )
              }
              className="input"
            />

          </div>

          <div className="space-y-2">

            <p className="label">
              Additional household income
            </p>

            <input
              type="number"
              placeholder="Optional"
              value={profile.additionalIncome}
              onChange={(e) =>
                update(
                  'additionalIncome',
                  e.target.value
                )
              }
              className="input"
            />

          </div>

        </div>

      </section>

      {/* STABILITY */}
      <section className="card space-y-5">

        <div>

          <p className="section-title">
            Stability
          </p>

          <p className="section-subtitle">
            Longer stability periods generally
            reduce approval hesitation.
          </p>

        </div>

        <SelectionGrid
          title="Employment"
          value={profile.employment}
          options={[
            'Employed',
            'Self-employed',
            'Student',
            'Retired',
            'Unemployed',
          ]}
          onSelect={(value) =>
            update('employment', value)
          }
        />

        <SelectionGrid
          title="Current income stability"
          value={profile.duration}
          options={[
            'Less than 6 months',
            '6-12 months',
            '1-2 years',
            '2+ years',
          ]}
          onSelect={(value) =>
            update('duration', value)
          }
        />

      </section>

      {/* HOUSEHOLD */}
      <section className="card space-y-5">

        <div>

          <p className="section-title">
            Household setup
          </p>

          <p className="section-subtitle">
            Household fit can influence property
            comfort and landlord confidence.
          </p>

        </div>

        <div className="space-y-2">

          <p className="label">
            Number of occupants
          </p>

          <input
            type="number"
            placeholder="Occupants"
            value={profile.occupants}
            onChange={(e) =>
              update(
                'occupants',
                e.target.value
              )
            }
            className="input"
          />

        </div>

        <SelectionRow
          title="Pets"
          value={profile.pets}
          options={['Yes', 'No']}
          onSelect={(value) =>
            update('pets', value)
          }
        />

        <SelectionRow
          title="Smoking"
          value={profile.smoking}
          options={['Yes', 'No']}
          onSelect={(value) =>
            update('smoking', value)
          }
        />

      </section>

      {/* MOVE */}
      <section className="card space-y-5">

        <div>

          <p className="section-title">
            Move preferences
          </p>

          <p className="section-subtitle">
            Timing and lease expectations can
            influence competitiveness.
          </p>

        </div>

        <SelectionGrid
          title="Move timeline"
          value={profile.moveTimeline}
          options={[
            'Immediately',
            'Within 30 days',
            '1-3 months',
            'Just browsing',
          ]}
          onSelect={(value) =>
            update('moveTimeline', value)
          }
        />

        <SelectionGrid
          title="Preferred lease"
          value={profile.leasePreference}
          options={[
            '6 months',
            '12 months',
            'Long-term',
            'Flexible',
          ]}
          onSelect={(value) =>
            update('leasePreference', value)
          }
        />

      </section>

      {/* BACKGROUND */}
      <section className="card space-y-5">

        <div>

          <p className="section-title">
            Background signals
          </p>

          <p className="section-subtitle">
            These signals help RentEdge identify
            possible approval friction more
            accurately.
          </p>

        </div>

        <SelectionRow
          title="Recent credit issues"
          value={profile.creditIssues}
          options={[
            'None',
            'Minor',
            'Serious',
          ]}
          onSelect={(value) =>
            update('creditIssues', value)
          }
        />

        <SelectionRow
          title="Previous eviction history"
          value={profile.evictionHistory}
          options={['No', 'Yes']}
          onSelect={(value) =>
            update('evictionHistory', value)
          }
        />

      </section>

      {/* READINESS */}
      <section className="card space-y-5">

        <div>

          <p className="section-title">
            Application readiness
          </p>

          <p className="section-subtitle">
            Faster and more complete applications
            are usually easier to process with
            confidence.
          </p>

        </div>

        <div className="space-y-3">

          <Toggle
            label="Deposit ready"
            description="Able to pay deposit immediately if approved"
            value={profile.depositReady}
            onChange={() =>
              update(
                'depositReady',
                !profile.depositReady
              )
            }
          />

          <Toggle
            label="ID ready"
            description="Certified ID copy available"
            value={profile.idReady}
            onChange={() =>
              update(
                'idReady',
                !profile.idReady
              )
            }
          />

          <Toggle
            label="Payslips ready"
            description="Recent proof of income available"
            value={profile.payslipReady}
            onChange={() =>
              update(
                'payslipReady',
                !profile.payslipReady
              )
            }
          />

          <Toggle
            label="Bank statements ready"
            description="Recent statements available if requested"
            value={profile.bankStatementsReady}
            onChange={() =>
              update(
                'bankStatementsReady',
                !profile.bankStatementsReady
              )
            }
          />

          <Toggle
            label="References ready"
            description="Previous references available"
            value={profile.referencesReady}
            onChange={() =>
              update(
                'referencesReady',
                !profile.referencesReady
              )
            }
          />

          <Toggle
            label="Guarantor available"
            description="Someone available to support the application if required"
            value={profile.guarantorAvailable}
            onChange={() =>
              update(
                'guarantorAvailable',
                !profile.guarantorAvailable
              )
            }
          />

        </div>

      </section>

      {/* INSIGHT */}
      <section className="card-hero">

        <p className="app-eyebrow text-blue-200">
          RENTEDGE INSIGHT
        </p>

        <p className="mt-4 text-sm leading-6 text-white/85">
          RentEdge does not generate credit
          scores or judge renters. The platform
          highlights areas that may create
          approval hesitation, comparison
          pressure, or additional landlord
          scrutiny before you apply.
        </p>

      </section>

      {/* ACTION */}
      <button
        onClick={saveProfile}
        disabled={!isComplete}
        className={`btn-primary ${
          !isComplete
            ? 'cursor-not-allowed opacity-40'
            : ''
        }`}
      >
        {saved
          ? 'Application profile saved'
          : 'Save application profile'}
      </button>

      <div className="h-2" />

    </div>
  )
}

/* ======================================================
   SELECTION GRID
====================================================== */

function SelectionGrid({
  title,
  value,
  options,
  onSelect,
}: any) {
  return (
    <div className="space-y-3">

      <p className="label">
        {title}
      </p>

      <div className="grid grid-cols-2 gap-2">

        {options.map((item: string) => (

          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`rounded-2xl border px-4 py-3 text-sm transition-all ${
              value === item
                ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-white'
                : 'border-[var(--border-soft)] bg-white/[0.02] text-[var(--text-secondary)]'
            }`}
          >
            {item}
          </button>

        ))}

      </div>

    </div>
  )
}

/* ======================================================
   SELECTION ROW
====================================================== */

function SelectionRow({
  title,
  value,
  options,
  onSelect,
}: any) {
  return (
    <div className="space-y-3">

      <p className="label">
        {title}
      </p>

      <div className="grid grid-cols-2 gap-2">

        {options.map((item: string) => (

          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`rounded-2xl border px-4 py-3 text-sm transition-all ${
              value === item
                ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-white'
                : 'border-[var(--border-soft)] bg-white/[0.02] text-[var(--text-secondary)]'
            }`}
          >
            {item}
          </button>

        ))}

      </div>

    </div>
  )
}

/* ======================================================
   TOGGLE
====================================================== */

function Toggle({
  label,
  description,
  value,
  onChange,
}: any) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-[var(--border-soft)] bg-white/[0.02] p-4 text-left transition-all"
    >

      <div>

        <p className="text-sm font-medium text-white">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
          {description}
        </p>

      </div>

      <div
        className={`mt-0.5 flex h-6 w-11 items-center rounded-full p-1 transition-all ${
          value
            ? 'bg-[var(--accent-primary)]'
            : 'bg-white/10'
        }`}
      >

        <div
          className={`h-4 w-4 rounded-full bg-white transition-all ${
            value
              ? 'translate-x-5'
              : 'translate-x-0'
          }`}
        />

      </div>

    </button>
  )
}