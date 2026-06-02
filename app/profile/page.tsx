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

type SelectionProps = {
  title: string
  value: string
  options: string[]
  onSelect: (value: string) => void
}

type ToggleProps = {
  label: string
  description: string
  value: boolean
  onChange: () => void
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

  const [saved, setSaved] =
    useState(false)

  useEffect(() => {

    const existing =
      localStorage.getItem(
        'rentedge_renter'
      ) ||
      localStorage.getItem(
        'rentedge_profile'
      )

    if (!existing) return

    try {

      const parsed =
        JSON.parse(existing)

      setProfile(prev => ({
        ...prev,
        ...parsed,
      }))

    } catch {

      console.log(
        'Profile load failed'
      )

    }

  }, [])

  const update = <
    K extends keyof ProfileState
  >(
    field: K,
    value: ProfileState[K]
  ) => {

    setProfile(prev => ({
      ...prev,
      [field]: value,
    }))

  }

  const completionScore =
    useMemo(() => {

      let total = 0

      if (profile.income) total++
      if (profile.employment) total++
      if (profile.duration) total++
      if (profile.occupants) total++
      if (profile.pets !== '') total++
      if (profile.smoking !== '') total++
      if (profile.moveTimeline) total++
      if (profile.leasePreference) total++
      if (profile.depositReady) total++
      if (profile.idReady) total++
      if (profile.payslipReady) total++
      if (profile.bankStatementsReady) total++
      if (profile.referencesReady) total++

      return Math.min(
        100,
        Math.round(
          (total / 13) * 100
        )
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

    const normalized = {

      ...profile,

      income:
        Number(
          profile.income || 0
        ),

      additionalIncome:
        Number(
          profile.additionalIncome || 0
        ),

      occupants:
        Number(
          profile.occupants || 1
        ),

      pets:
        profile.pets === 'Yes',

      smoking:
        profile.smoking === 'Yes',

      deposit:
        profile.depositReady
          ? 'full'
          : 'none',

      payslip:
        profile.payslipReady,

    }

    localStorage.setItem(
      'rentedge_renter',
      JSON.stringify(normalized)
    )

    localStorage.setItem(
      'rentedge_profile',
      JSON.stringify(normalized)
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

<section className="card space-y-5">

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
onSelect={(value:string)=>
update(
'employment',
value
)
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
onSelect={(value:string)=>
update(
'duration',
value
)
}
/>

<SelectionRow
title="Pets"
value={profile.pets}
options={['Yes','No']}
onSelect={(value:string)=>
update(
'pets',
value
)
}
/>

<SelectionRow
title="Smoking"
value={profile.smoking}
options={['Yes','No']}
onSelect={(value:string)=>
update(
'smoking',
value
)
}
/>

<button
onClick={saveProfile}
disabled={!isComplete}
className={`btn-primary ${
!isComplete
? 'opacity-40'
: ''
}`}
>

{saved
? 'Application profile saved'
: 'Save application profile'}

</button>

</section>

</div>

  )

}

function SelectionGrid({
title,
value,
options,
onSelect,
}:SelectionProps){

return(

<div className="space-y-3">

<p className="label">
{title}
</p>

<div className="grid grid-cols-2 gap-2">

{options.map(item=>(

<button
key={item}
type="button"
onClick={()=>
onSelect(item)
}
className={`rounded-2xl border px-4 py-3 text-sm ${
value===item
? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-white'
: 'border-[var(--border-soft)] bg-white/[0.02]'
}`}
>

{item}

</button>

))}

</div>

</div>

)

}

function SelectionRow(
props:SelectionProps
){

return(
<SelectionGrid
{...props}
/>
)

}

function Toggle({
label,
description,
value,
onChange,
}:ToggleProps){

return(

<button
type="button"
onClick={onChange}
className="flex w-full justify-between rounded-2xl border p-4"
>

<div>

<p>
{label}
</p>

<p>
{description}
</p>

</div>

<div>

{value
? 'ON'
: 'OFF'}

</div>

</button>

)

}