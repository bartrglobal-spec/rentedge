'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type SavedProperty = {
  id: string | number
  title?: string
  location?: string
  price?: string | number
  rent?: string | number
  bedrooms?: string | number
}

export default function UnlockPreviewPage() {

  const router = useRouter()

  const [currentProperty,setCurrentProperty] =
    useState<SavedProperty | null>(null)

  useEffect(()=>{

    try{

      const stored =
        localStorage.getItem(
          'rentedge_properties'
        )

      if(!stored) return

      const parsed =
        JSON.parse(stored)

      const selected =
        localStorage.getItem(
          'rentedge_selected_property_id'
        )

      if(
        Array.isArray(parsed) &&
        parsed.length
      ){

        const property =
          parsed.find(
            (p:any)=>
              String(p.id) ===
              String(selected)
          ) || parsed[0]

        setCurrentProperty(
          property
        )

      }

    }catch(error){

      console.error(error)

    }

  },[])

  function cleanTitle(
    value?:string
  ){

    if(!value)
      return 'Property'

    return value
      .replace(/property24/gi,'')
      .replace(/\|/g,' ')
      .replace(/\s+-\s+/g,', ')
      .replace(/\s{2,}/g,' ')
      .trim()

  }

  function handleUnlock(){

    router.push('/unlock')

  }

  return(

<div className="min-h-screen bg-[#07111F] px-4 pb-28 pt-8 text-white">

<div className="mx-auto flex w-full max-w-md flex-col space-y-5">

{/* HERO */}

<div className="rounded-[32px] border border-blue-500/20 bg-[#081426] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">

<div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1">

<p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300">

Rental position analysis

</p>

</div>

<div className="mt-5 space-y-4">

<h1 className="text-[38px] font-semibold leading-[1.02] tracking-[-0.04em]">

This property could cost more than just the rent.

</h1>

<p className="text-[15px] leading-8 text-white/68">

Rental applications are competitive.
Many agents and landlords charge
upfront screening, admin, and credit
check fees before approval decisions
are even made.

</p>

</div>

{currentProperty && (

<div className="mt-7 rounded-3xl border border-white/10 bg-[#091528] p-4">

<div className="flex items-start justify-between gap-3">

<div className="min-w-0 flex-1">

<p className="text-[10px] uppercase tracking-[0.2em] text-white/35">

Active target property

</p>

<h2 className="mt-3 text-[18px] font-semibold leading-[1.15] break-words">

{
cleanTitle(
currentProperty.title ||
currentProperty.location
)
}

</h2>

<div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/50">

<span>

R{

Number(
currentProperty.rent ??
currentProperty.price ??
0
).toLocaleString()

}

</span>

{currentProperty.bedrooms && (

<>

<span className="text-white/20">

•

</span>

<span>

{
currentProperty.bedrooms
} bedroom

</span>

</>

)}

</div>

</div>

<div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">

<p className="text-[9px] uppercase tracking-[0.18em] text-white/40">

Pressure

</p>

<p className="mt-1 text-sm font-semibold text-rose-300">

Higher

</p>

</div>

</div>

<div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">

<p className="text-sm font-semibold">

RentEdge detected hidden approval pressure.

</p>

<p className="mt-3 text-sm leading-8 text-white/75">

Another applicant with stronger positioning,
faster documents, or cleaner affordability
may already appear safer to an agent
reviewing this property.

</p>

</div>

</div>

)}

</div>

{/* BETA */}

<div className="rounded-[30px] border border-blue-500/20 bg-blue-500/10 p-5">

<p className="text-[10px] uppercase tracking-[0.22em] text-blue-300">

Beta Access

</p>

<h2 className="mt-4 text-xl font-semibold">

Full access is temporarily unlocked.

</h2>

<p className="mt-4 text-sm leading-8 text-white/75">

RentEdge is currently being beta tested.
Your feedback and real-world usage help
improve affordability signals, positioning
logic, and approval analysis.

</p>

<p className="mt-4 text-sm leading-8 text-white/60">

No subscriptions.
No paywall during testing.
Simply explore and help refine the system.

</p>

</div>

{/* CTA */}

<button

onClick={handleUnlock}

className="rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-black"

>

Continue to full evaluation

</button>

</div>

</div>

)

}