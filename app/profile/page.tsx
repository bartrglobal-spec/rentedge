'use client'

import { useEffect, useMemo, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type ProfileState = {
income:string
additionalIncome:string
employment:string
duration:string
occupants:string
pets:string
smoking:string

depositReady:boolean
idReady:boolean
payslipReady:boolean
bankStatementsReady:boolean
referencesReady:boolean
guarantorAvailable:boolean

evictionHistory:string
}

export default function ProfilePage(){

const router=useRouter()

const [saved,setSaved]=
useState(false)

const [profile,setProfile]=
useState<ProfileState>({

income:'',

additionalIncome:'',

employment:'',

duration:'',

occupants:'1',

pets:'',

smoking:'',

depositReady:false,

idReady:false,

payslipReady:false,

bankStatementsReady:false,

referencesReady:false,

guarantorAvailable:false,

evictionHistory:'No'

})

useEffect(()=>{

const existing=
localStorage.getItem(
'rentedge_profile'
)

if(!existing) return

try{

setProfile(prev=>({

...prev,

...JSON.parse(existing)

}))

}catch{}

},[])

function update<K extends keyof ProfileState>(
field:K,
value:ProfileState[K]
){

setProfile(prev=>({

...prev,

[field]:value

}))

}

const progress=
useMemo(()=>{

let score=0

if(profile.income) score++

if(profile.employment) score++

if(profile.duration) score++

if(profile.occupants) score++

if(profile.pets) score++

if(profile.smoking) score++

if(profile.depositReady) score++

if(profile.idReady) score++

if(profile.payslipReady) score++

if(profile.bankStatementsReady) score++

if(profile.referencesReady) score++

if(profile.guarantorAvailable)
score++

return Math.min(
100,
Math.round(
(score/12)*100
)
)

},[profile])

const complete=

profile.income &&
profile.employment &&
profile.duration &&
profile.occupants &&
profile.pets &&
profile.smoking

function save(){

const normalized={

...profile,

income:Number(
profile.income
),

additionalIncome:Number(
profile.additionalIncome
),

occupants:Number(
profile.occupants
),

pets:
profile.pets==='Yes',

smoking:
profile.smoking==='Yes'

}

localStorage.setItem(
'rentedge_profile',
JSON.stringify(
normalized
)
)

localStorage.setItem(
'rentedge_renter',
JSON.stringify(
normalized
)
)

localStorage.setItem(
'rentedge_profile_complete',
'true'
)

setSaved(true)

setTimeout(()=>{

router.push('/')

},700)

}

return(

<div className="mx-auto max-w-md px-4 pb-40 pt-5 space-y-6">

<div className="rounded-[34px] border border-white/10 bg-[#0b1220] p-6">

<div className="text-[10px] uppercase tracking-[0.32em] text-blue-200/60">

Renter Profile

</div>

<h1 className="mt-4 text-[34px] font-semibold leading-[0.98] tracking-[-0.05em]">

Build Your Rental Position

</h1>

<p className="mt-4 text-sm leading-7 text-white/55">

Your renter profile powers approval analysis,
competition signals and affordability positioning.

</p>

<div className="mt-7">

<div className="flex justify-between text-xs text-white/45">

<span>Profile completion</span>

<span>{progress}%</span>

</div>

<div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">

<div

className="h-full rounded-full bg-blue-400 transition-all duration-500"

style={{
width:
progress+'%'
}}

/>

</div>

</div>

</div>

<Section
title="Financial Position"
subtitle="Financial strength is usually the first filter."
>

<Input
placeholder="Monthly income"
value={profile.income}
onChange={(v:string)=>
update(
'income',
v
)}
/>

<Input
placeholder="Additional income"
value={profile.additionalIncome}
onChange={(v:string)=>
update(
'additionalIncome',
v
)}
/>

<Select
value={profile.employment}
onChange={(v:string)=>
update(
'employment',
v
)}
options={[
'Employed',
'Self-employed',
'Student',
'Retired',
'Unemployed'
]}
placeholder="Employment"
/>

<Select
value={profile.duration}
onChange={(v:string)=>
update(
'duration',
v
)}
options={[
'Less than 6 months',
'6-12 months',
'1-2 years',
'2+ years'
]}
placeholder="Income stability"
/>

</Section>

<Section
title="Application Readiness"
subtitle="Prepared applicants usually move faster."
>

<Toggle
label="Deposit Ready"
value={profile.depositReady}
onClick={()=>
update(
'depositReady',
!profile.depositReady
)}
/>

<Toggle
label="ID Documents"
value={profile.idReady}
onClick={()=>
update(
'idReady',
!profile.idReady
)}
/>

<Toggle
label="Payslips Ready"
value={profile.payslipReady}
onClick={()=>
update(
'payslipReady',
!profile.payslipReady
)}
/>

<Toggle
label="Bank Statements"
value={profile.bankStatementsReady}
onClick={()=>
update(
'bankStatementsReady',
!profile.bankStatementsReady
)}
/>

<Toggle
label="References"
value={profile.referencesReady}
onClick={()=>
update(
'referencesReady',
!profile.referencesReady
)}
/>

</Section>

<Section
title="Competitive Position"
subtitle="Your competition is other applicants."
>

<Input
placeholder="Occupants"
value={profile.occupants}
onChange={(v:string)=>
update(
'occupants',
v
)}
/>

<SelectionRow
label="Pets"
value={profile.pets}
onSelect={(v:string)=>
update(
'pets',
v
)}
/>

<SelectionRow
label="Smoking"
value={profile.smoking}
onSelect={(v:string)=>
update(
'smoking',
v
)}
/>

<Toggle
label="Guarantor Available"
value={profile.guarantorAvailable}
onClick={()=>
update(
'guarantorAvailable',
!profile.guarantorAvailable
)}
/>

</Section>

<div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#07111F]/95 backdrop-blur-xl p-4">

<div className="mx-auto max-w-md">

<button

disabled={!complete}

onClick={save}

className={`w-full rounded-2xl px-5 py-4 font-semibold transition ${
complete
?'bg-white text-black'
:'bg-white/20 text-white/40'
}`}

>

{saved
?'Saving profile...'
:'Save Rental Profile'}

</button>

<p className="mt-3 text-center text-xs text-white/40">

{progress}% complete

</p>

</div>

</div>

</div>

)

}

function Section({
title,
subtitle,
children
}:{
title:string
subtitle:string
children:ReactNode
}){

return(

<div className="rounded-[30px] border border-white/10 bg-[#0b1220] p-5 space-y-5">

<div>

<div className="text-[10px] uppercase tracking-[0.24em] text-white/35">

{title}

</div>

<p className="mt-3 text-sm leading-7 text-white/50">

{subtitle}

</p>

</div>

{children}

</div>

)

}

function Input({
value,
onChange,
placeholder
}:{
value:string
onChange:(v:string)=>void
placeholder:string
}){

return(

<input

value={value}

placeholder={placeholder}

onChange={(e)=>
onChange(
e.target.value
)
}

className="input"

/>

)

}

function Select({
value,
onChange,
options,
placeholder
}:{
value:string
onChange:(v:string)=>void
options:string[]
placeholder:string
}){

return(

<select

value={value}

onChange={(e)=>
onChange(
e.target.value
)
}

className="input"

>

<option value="">

{placeholder}

</option>

{options.map((o)=>(

<option
key={o}
value={o}
>

{o}

</option>

))}

</select>

)

}

function Toggle({
label,
value,
onClick
}:{
label:string
value:boolean
onClick:()=>void
}){

return(

<button

type="button"

onClick={onClick}

className={`flex w-full items-center justify-between rounded-2xl border p-4 transition ${
value
?'border-blue-500/20 bg-blue-500/10'
:'border-white/10'
}`}

>

<span>{label}</span>

<span>

{value
?'ON'
:'OFF'}

</span>

</button>

)

}

function SelectionRow({
label,
value,
onSelect
}:{
label:string
value:string
onSelect:(v:string)=>void
}){

return(

<div>

<div className="mb-3 text-sm text-white/55">

{label}

</div>

<div className="grid grid-cols-2 gap-3">

{['Yes','No'].map(
(item)=>(

<button

type="button"

key={item}

onClick={()=>{

onSelect(item)

}}

className={`rounded-2xl border p-4 ${
value===item
?'border-blue-500/20 bg-blue-500/10'
:'border-white/10'
}`}

>

{item}

</button>

))

}

</div>

</div>

)

}