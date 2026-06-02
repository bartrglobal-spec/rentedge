'use client'

import { useEffect,useMemo,useState } from 'react'

import { evaluateProperty } from '@/lib/evaluation'

import { buildUnlockPresentation } from '@/lib/evaluation/presentation'

export default function UnlockPage(){

const [profile,setProfile]=useState<any>(null)

const [properties,setProperties]=useState<any[]>([])

const [selectedId,setSelectedId]=
useState<number|null>(null)

useEffect(()=>{

const savedProfile=
JSON.parse(
localStorage.getItem(
'rentedge_profile'
)||'null'
)

const savedProperties=
JSON.parse(
localStorage.getItem(
'rentedge_properties'
)||'[]'
)

setProfile(savedProfile)

setProperties(savedProperties)

const selected=
localStorage.getItem(
'rentedge_selected_property_id'
)

if(selected){

setSelectedId(
Number(selected)
)

}else if(savedProperties.length){

setSelectedId(
savedProperties[0].id
)

}

},[])

const property=
useMemo(()=>{

return properties.find(
p=>p.id===selectedId
)

},[
properties,
selectedId
])

function cleanTitle(
value:string
){

if(!value) return 'Property'

return value
.replace(/property24/gi,'')
.replace(/\|/g,' ')
.replace(/\s+-\s+/g,', ')
.replace(/\s{2,}/g,' ')
.trim()

}

function removeProperty(
id:number
){

const updated=
properties.filter(
p=>p.id!==id
)

setProperties(updated)

localStorage.setItem(
'rentedge_properties',
JSON.stringify(updated)
)

}

if(
!profile||
!property
){

return(

<div className="px-5 py-24">

<div className="card text-center">

<h1 className="text-2xl font-semibold">

No Property Selected

</h1>

<p className="mt-4 text-white/60">

Add a property first

</p>

</div>

</div>

)

}

const evaluation=
evaluateProperty(
profile,
property
)

const presentation=
buildUnlockPresentation(
evaluation,
profile,
property
)

const heroColor=

evaluation.approvalChance>=70

?'from-emerald-500/20'

:evaluation.approvalChance>=40

?'from-amber-500/20'

:'from-red-500/20'

const other=

properties.filter(
p=>p.id!==property.id
)

return(

<div className="mx-auto max-w-md px-4 pb-32 pt-4 space-y-5">

<div className={`rounded-[34px] border border-white/10 bg-gradient-to-b ${heroColor} to-[#06111f] p-6`}>

<div className="text-[10px] tracking-[0.35em] uppercase text-blue-200">

RentEdge Intelligence

</div>

<h1 className="mt-4 text-3xl font-semibold leading-tight">

{cleanTitle(
property.title||
property.location
)}

</h1>

<p className="mt-4 text-white/45">

R{property.rent?.toLocaleString()}

•

{property.bedrooms} Bedrooms

</p>

<div className="mt-8">

<p className="text-[12px] uppercase tracking-[0.2em] text-white/40">

Decision

</p>

<h2 className="mt-2 text-5xl font-bold">

{presentation.heroDecision}

</h2>

<p className="mt-4 text-white/70 leading-7">

{presentation.heroSummary}

</p>

</div>

<div className="mt-8 flex items-end gap-2">

<div className="text-6xl font-bold">

{evaluation.approvalChance}

</div>

<div className="pb-2 text-white/50">

/100

</div>

</div>

<div className="mt-6 h-4 rounded-full bg-white/10 overflow-hidden">

<div

className="h-full rounded-full bg-white"

style={{
width:
evaluation.approvalChance+'%'
}}

/>

</div>

</div>

<div className="grid grid-cols-2 gap-3">

{presentation.signalCards.map(
(card:any,i:number)=>(

<div

key={i}

className="rounded-2xl border border-white/10 p-4"

>

<div className="text-[10px] uppercase tracking-[0.2em] text-white/45">

{card.label}

</div>

<p className="mt-4 font-semibold">

{card.value}

</p>

</div>

))

}

</div>

<Card
title="How Landlords May View This"
items={
presentation.landlordSignals
}
/>

<Card
title="Why You Got This Result"
items={
presentation.whySignals
}
/>

<div className="card">

<div className="text-[10px] uppercase tracking-[0.3em] text-white/45">

Fastest Improvement

</div>

<h2 className="mt-4 text-2xl font-semibold">

{
presentation.fastestImprovement
}

</h2>

<p className="mt-5 text-white/65">

Focus here before changing everything else.

</p>

</div>

<div className="card">

<h2 className="text-xl font-semibold">

Better Target Range

</h2>

<div className="grid grid-cols-2 gap-3 mt-5">

<Metric
label="Comfort"
value={
evaluation.recommendedRentRange.comfortable
}
/>

<Metric
label="Competitive"
value={
evaluation.recommendedRentRange.competitive
}
/>

<Metric
label="Stretch"
value={
evaluation.recommendedRentRange.stretch
}
/>

<Metric
label="Too High"
value={
evaluation.recommendedRentRange.unrealisticAbove
}
/>

</div>

</div>

<Card
title="What To Do Next"
items={
presentation.actions
}
/>

<div className="card">

<div className="flex justify-between">

<h2 className="text-xl font-semibold">

Optimized Application Message

</h2>

<p className="text-xs text-white/40">

Built For Faster Screening

</p>

</div>

<div className="mt-5 rounded-3xl border border-white/10 p-5 whitespace-pre-line leading-9 text-white/80">

{
presentation.message
}

</div>

<button

className="btn-primary mt-6 w-full"

onClick={()=>{

navigator.clipboard.writeText(
presentation.message
)

}}

>

Copy Message

</button>

</div>

{other.length>0&&(

<div className="card">

<h2 className="text-xl font-semibold">

Compare Properties

</h2>

<div className="space-y-4 mt-5">

{other.map((p)=>(

<div

key={p.id}

className="rounded-2xl border border-white/10 p-4"

>

<p className="leading-7">

{
cleanTitle(
p.title
)
}

</p>

<div className="flex gap-2 mt-5">

<button

className="btn-primary flex-1"

onClick={()=>{

setSelectedId(
p.id
)

localStorage.setItem(
'rentedge_selected_property_id',
String(p.id)
)

}}

>

Open

</button>

<button

onClick={()=>{

removeProperty(
p.id
)

}}

>

Remove

</button>

</div>

</div>

))}

</div>

</div>

)}

</div>

)

}

function Metric({
label,
value
}:any){

return(

<div className="rounded-2xl border border-white/10 p-4">

<div className="text-xs text-white/45">

{label}

</div>

<div className="mt-3 text-3xl font-semibold">

R{
Number(
value
).toLocaleString()
}

</div>

</div>

)

}

function Card({
title,
items
}:any){

return(

<div className="card">

<h2 className="text-xl font-semibold">

{title}

</h2>

<div className="space-y-3 mt-5">

{items?.map(
(item:string,i:number)=>(

<div

key={i}

className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 leading-8 text-white/75"

>

{item}

</div>

))

}

</div>

</div>

)

}