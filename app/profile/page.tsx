'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {

const router = useRouter()

const [saved,setSaved]=
useState(false)

const [profile,setProfile]=
useState({

income:'',

additionalIncome:'',

employment:'',

duration:'',

occupants:'1',

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

function update(
field:string,
value:any
){

setProfile(prev=>({

...prev,

[field]:value

}))

}

const complete=

profile.income &&
profile.employment &&
profile.duration &&
profile.occupants

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
)

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

},800)

}

return(

<div className="space-y-6">

<div>

<div className="text-[11px] uppercase tracking-[0.3em] text-blue-200/50">

Renter Profile

</div>

<h1 className="mt-3 text-3xl font-semibold">

Build your renter identity

</h1>

</div>

<div className="card space-y-4">

<input
className="input"
placeholder="Monthly income"
value={profile.income}
onChange={e=>
update(
'income',
e.target.value
)}
/>

<input
className="input"
placeholder="Additional income"
value={profile.additionalIncome}
onChange={e=>
update(
'additionalIncome',
e.target.value
)}
/>

<input
className="input"
placeholder="Occupants"
value={profile.occupants}
onChange={e=>
update(
'occupants',
e.target.value
)}
/>

<select
className="input"
value={profile.employment}
onChange={e=>
update(
'employment',
e.target.value
)}
>

<option value="">
Employment
</option>

<option>
Employed
</option>

<option>
Self-employed
</option>

<option>
Student
</option>

<option>
Retired
</option>

</select>

<select
className="input"
value={profile.duration}
onChange={e=>
update(
'duration',
e.target.value
)}
>

<option value="">
Employment duration
</option>

<option>
Less than 6 months
</option>

<option>
6-12 months
</option>

<option>
1-2 years
</option>

<option>
2+ years
</option>

</select>

<Toggle
label="Deposit Ready"
value={
profile.depositReady
}
onClick={()=>
update(
'depositReady',
!profile.depositReady
)}
/>

<Toggle
label="ID Ready"
value={
profile.idReady
}
onClick={()=>
update(
'idReady',
!profile.idReady
)}
/>

<Toggle
label="Payslip Ready"
value={
profile.payslipReady
}
onClick={()=>
update(
'payslipReady',
!profile.payslipReady
)}
/>

<Toggle
label="Bank Statements"
value={
profile.bankStatementsReady
}
onClick={()=>
update(
'bankStatementsReady',
!profile.bankStatementsReady
)}
/>

<Toggle
label="References"
value={
profile.referencesReady
}
onClick={()=>
update(
'referencesReady',
!profile.referencesReady
)}
/>

<Toggle
label="Guarantor"
value={
profile.guarantorAvailable
}
onClick={()=>
update(
'guarantorAvailable',
!profile.guarantorAvailable
)}
/>

<button

disabled={!complete}

onClick={save}

className={`btn-primary w-full ${
!complete
?'opacity-40'
:''
}`}

>

{saved
?'Saving...'
:'Save renter profile'}

</button>

</div>

</div>

)

}

function Toggle({
label,
value,
onClick
}:any){

return(

<button

type="button"

onClick={onClick}

className="flex w-full items-center justify-between rounded-2xl border border-white/10 p-4"

>

<span>

{label}

</span>

<span>

{value
?'ON'
:'OFF'}

</span>

</button>

)

}