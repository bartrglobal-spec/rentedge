'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { evaluateProperty } from '@/lib/evaluation'
import { evaluateUnlock } from '@/lib/evaluation/unlock'

type Property = {
  id: number
  title: string
  area: string
  rent: number
  bedrooms: number
}

type Tab = 'overview' | 'strengths' | 'agent' | 'properties' | 'strategy'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',    label: 'Overview'    },
  { id: 'strengths',   label: 'Strengths'   },
  { id: 'agent',       label: 'Agent View'  },
  { id: 'properties',  label: 'Properties'  },
  { id: 'strategy',    label: 'Strategy'    },
]

function cleanTitle(value?: string) {
  if (!value) return 'Property'
  return value.replace(/property24/gi,'').replace(/\|/g,' ').replace(/\s+-\s+/g,', ').replace(/\s{2,}/g,' ').trim()
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
      className={copied ? 'btn-primary btn-copied' : 'btn-gold'}
      style={{ marginTop: 16 }}
    >
      {copied ? '✓ Copied' : 'Copy introduction message'}
    </button>
  )
}

// Map profile_answers → RenterProfile shape evaluateProperty expects
function buildRenterProfile(profile: any) {
  const mapDuration = (s: string) => {
    if (!s) return ''
    if (s === 'More than 2 years' || (s as string).includes('2+')) return '2+ years'
    if (s === '1 to 2 years'      || (s as string).includes('1-2')) return '1-2 years'
    return s
  }
  const gaps: string[] = profile?.documentationGaps || []
  return {
    income:              Number(profile?.monthlyIncome || 0),
    additionalIncome:    0,
    employment:          profile?.incomeSource || '',
    duration:            mapDuration(profile?.employmentStabilityMapped || profile?.employmentStability || ''),
    occupants:           profile?.occupancy || '',
    depositReady:        profile?.depositReadiness === 'Yes',
    idReady:             !gaps.includes('ID Document'),
    payslipReady:        !gaps.includes('Payslips'),
    bankStatementsReady: !gaps.includes('Bank Statements'),
    referencesReady:     profile?.referenceAvailability === 'Available',
    guarantorAvailable:  profile?.guarantorSupport === 'Yes',
    evictionHistory:     'none' as string,
    pets:                'none' as string,
  }
}

export default function UnlockPage() {
  const router = useRouter()
  const [profile, setProfile]         = useState<any>(null)
  const [properties, setProperties]   = useState<Property[]>([])
  const [selectedId, setSelectedId]   = useState<number | null>(null)
  const [activeTab, setActiveTab]     = useState<Tab>('overview')
  const [ready, setReady]             = useState(false)
  const [revealedTabs, setRevealedTabs] = useState<Set<Tab>>(new Set(['overview']))

  useEffect(() => {
    const savedProfile     = JSON.parse(localStorage.getItem('rentedge_profile_answers') || 'null')
    const savedProperties  = JSON.parse(localStorage.getItem('rentedge_properties') || '[]')
    setProfile(savedProfile)
    setProperties(Array.isArray(savedProperties) ? savedProperties : [])
    const sel = localStorage.getItem('rentedge_selected_property_id')
    if (sel) setSelectedId(Number(sel))
    else if (savedProperties.length > 0) setSelectedId(savedProperties[0].id)
    setReady(true)
  }, [])

  const selectedProperty = useMemo(
    () => properties.find(p => p.id === selectedId) || properties[0] || null,
    [properties, selectedId]
  )

  const selectProperty = (id: number) => {
    setSelectedId(id)
    localStorage.setItem('rentedge_selected_property_id', String(id))
  }

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    setRevealedTabs(prev => new Set([...prev, tab]))
  }

  if (!ready) return null

  if (!profile || !selectedProperty) {
    return (
      <div className="section-gap" style={{ paddingTop: 60, alignItems: 'center', textAlign: 'center' }}>
        <div className="empty-state-icon" style={{ fontSize: 28 }}>🔒</div>
        <p className="section-title">Nothing to unlock yet</p>
        <p className="section-subtitle" style={{ maxWidth: 280 }}>
          Complete your profile and add at least one property to unlock your rental strategy.
        </p>
        <button onClick={() => router.push('/check')} className="btn-primary" style={{ marginTop: 12 }}>
          Start from Check
        </button>
      </div>
    )
  }

  const renter     = buildRenterProfile(profile)
  const evaluation = evaluateProperty(renter, selectedProperty)
  const unlock     = evaluateUnlock(renter, properties, selectedProperty, evaluation)

  const otherProps = properties.filter(p => p.id !== selectedProperty.id)

  // Translate evaluation to positioning label — no numbers shown
  const posLabel =
    evaluation.fit === 'strong'     ? 'Strong position'
    : evaluation.fit === 'borderline' ? 'Competitive position'
    : 'Room to strengthen'

  const posColour =
    evaluation.fit === 'strong'     ? 'var(--success)'
    : evaluation.fit === 'borderline' ? 'var(--warning)'
    : 'var(--danger)'

  return (
    <div style={{ paddingTop: 8 }}>

      {/* ══ GOLD HERO ══════════════════════════════════════ */}
      <div className="card-gold" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span className="app-badge badge-gold">Rental strategy unlocked</span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            background: posColour === 'var(--success)' ? 'var(--success-soft)' : posColour === 'var(--warning)' ? 'var(--warning-soft)' : 'var(--danger-soft)',
            border: `1px solid ${posColour === 'var(--success)' ? 'var(--success-border)' : posColour === 'var(--warning)' ? 'var(--warning-border)' : 'var(--danger-border)'}`,
            color: posColour, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            {posLabel}
          </span>
        </div>

        <h1 className="app-title" style={{ marginTop: 16, fontSize: 24 }}>
          Your rental strategy is ready
        </h1>
        <p className="section-subtitle">
          Here is what we found, what it means, and what we would do next.
        </p>

        {/* Selected property pill */}
        <div style={{
          marginTop: 16, padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid var(--gold-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ minWidth: 0 }}>
            <p className="label" style={{ color: 'var(--gold-text)' }}>Viewing analysis for</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cleanTitle(selectedProperty.area || selectedProperty.title)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <span className="app-badge">R{Number(selectedProperty.rent||0).toLocaleString()}</span>
            <span className="app-badge">{selectedProperty.bedrooms}bd</span>
          </div>
        </div>
      </div>

      {/* ══ TAB BAR ════════════════════════════════════════ */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4,
        scrollbarWidth: 'none', marginBottom: 16,
      }}>
        {TABS.map(tab => {
          const isActive   = activeTab === tab.id
          const isRevealed = revealedTabs.has(tab.id)
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              style={{
                flexShrink: 0, padding: '9px 14px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${isActive ? 'var(--gold-border)' : 'var(--border-soft)'}`,
                background: isActive ? 'var(--gold-soft)' : 'rgba(255,255,255,0.03)',
                color: isActive ? 'var(--gold-text)' : isRevealed ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                cursor: 'pointer', transition: 'all 140ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ══ TAB: OVERVIEW ══════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="section-gap">
          <div className="card card-elevated">
            <p className="app-eyebrow">What we noticed</p>
            <p className="section-title" style={{ marginTop: 8 }}>Things that stood out</p>
            <div className="section-gap" style={{ marginTop: 16 }}>
              {unlock.observations.map((obs, i) => (
                <div key={i} style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-card)',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)',
                }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{obs.observation}</p>
                  <p className="body-text" style={{ marginTop: 8 }}>{obs.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="card">
            <p className="app-eyebrow">Opportunities</p>
            <p className="section-title" style={{ marginTop: 8 }}>Things that could strengthen your position</p>
            <div className="section-gap" style={{ marginTop: 16 }}>
              {unlock.opportunities.slice(0,3).map((opp, i) => (
                <div key={i} style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-card)',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-soft)',
                }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{opp.title}</p>
                  <p className="body-text" style={{ marginTop: 6, fontSize: 13 }}>{opp.explanation}</p>
                  <div className="card-success" style={{ marginTop: 10 }}>
                    <p className="label" style={{ color: 'var(--success)' }}>Potential benefit</p>
                    <p className="body-text" style={{ marginTop: 4, fontSize: 13 }}>{opp.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Focus areas */}
          <div className="card card-elevated">
            <p className="app-eyebrow">Focus areas</p>
            <p className="section-title" style={{ marginTop: 8 }}>Where we would start</p>
            <div className="section-gap" style={{ marginTop: 16, gap: 10 }}>
              {unlock.focusAreas.map((focus, i) => (
                <div key={i} style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-card)',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)',
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{focus.what}</p>
                    <p className="body-text" style={{ marginTop: 4, fontSize: 13 }}>{focus.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => switchTab('strengths')} className="btn-primary">
            See what is working in your favour →
          </button>
        </div>
      )}

      {/* ══ TAB: STRENGTHS ═════════════════════════════════ */}
      {activeTab === 'strengths' && (
        <div className="section-gap">
          <div className="card">
            <p className="app-eyebrow">Working in your favour</p>
            <p className="section-title" style={{ marginTop: 8 }}>Things already on your side</p>
            <p className="section-subtitle">Not everything needs fixing. These are the parts worth leaning into.</p>
          </div>
          {unlock.strengths.map((s, i) => (
            <div key={i} className="card card-elevated">
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'var(--success-soft)', border: '1px solid var(--success-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: 'var(--success)',
                }}>✓</div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{s.title}</p>
                  <p className="body-text" style={{ marginTop: 6 }}>{s.explanation}</p>
                </div>
              </div>
              <div className="card-inner" style={{ marginTop: 14 }}>
                <p className="label">Why this matters</p>
                <p className="body-text" style={{ marginTop: 6 }}>{s.whyItMatters}</p>
              </div>
              <div className="card-accent" style={{ marginTop: 10 }}>
                <p className="label" style={{ color: 'var(--accent-primary)' }}>Keep doing this</p>
                <p className="body-text" style={{ marginTop: 6 }}>{s.keepDoing}</p>
              </div>
            </div>
          ))}
          <button onClick={() => switchTab('agent')} className="btn-primary">
            See the agent perspective →
          </button>
        </div>
      )}

      {/* ══ TAB: AGENT VIEW ════════════════════════════════ */}
      {activeTab === 'agent' && (
        <div className="section-gap">
          <div className="card card-elevated">
            <p className="app-eyebrow">Agent perspective</p>
            <p className="section-title" style={{ marginTop: 8 }}>What an agent might notice</p>
            <p className="section-subtitle">
              Most applications are reviewed to answer a few important questions. Here is what may naturally come up in your situation.
            </p>
          </div>
          {unlock.agentQuestions.map((q, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                  color: 'var(--accent-primary)', letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>Q{i + 1}</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 650, color: 'var(--text-primary)', lineHeight: 1.4 }}>{q.question}</p>
              <div className="section-gap" style={{ marginTop: 14, gap: 8 }}>
                <div className="card-inner">
                  <p className="label">How agents often think</p>
                  <p className="body-text" style={{ marginTop: 6 }}>{q.howAgentsThink}</p>
                </div>
                <div className="card-inner">
                  <p className="label">In your situation</p>
                  <p className="body-text" style={{ marginTop: 6 }}>{q.howYouFit}</p>
                </div>
                <div className="card-inner">
                  <p className="label">Why we are saying this</p>
                  <p className="body-text" style={{ marginTop: 6 }}>{q.whyWeSayThat}</p>
                </div>
                <div className="card-accent">
                  <p className="label" style={{ color: 'var(--accent-primary)' }}>What we would do next</p>
                  <p className="body-text" style={{ marginTop: 6 }}>{q.nextMove}</p>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => switchTab('properties')} className="btn-primary">
            Compare your properties →
          </button>
        </div>
      )}

      {/* ══ TAB: PROPERTIES ════════════════════════════════ */}
      {activeTab === 'properties' && (
        <div className="section-gap">
          <div className="card card-elevated">
            <p className="app-eyebrow">Property comparison</p>
            <p className="section-title" style={{ marginTop: 8 }}>Same renter. Different property.</p>
            <p className="section-subtitle">
              Your story stays the same. What changes is how it may be viewed against different properties.
            </p>
          </div>

          {/* Property switcher */}
          <div className="section-gap" style={{ gap: 8 }}>
            {/* Currently selected */}
            <div style={{
              padding: '14px 16px', borderRadius: 'var(--radius-card)',
              border: '1px solid var(--gold-border)', background: 'var(--gold-soft)',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold-text)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                Currently viewing
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 6 }}>
                {cleanTitle(selectedProperty.area || selectedProperty.title)}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <span className="app-badge">R{Number(selectedProperty.rent||0).toLocaleString()}/mo</span>
                <span className="app-badge">{selectedProperty.bedrooms} beds</span>
              </div>
            </div>

            {/* Other properties */}
            {otherProps.map(p => (
              <button
                key={p.id}
                onClick={() => selectProperty(p.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 16px',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--border-soft)',
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', transition: 'all 140ms ease',
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {cleanTitle(p.area || p.title)}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span className="app-badge">R{Number(p.rent||0).toLocaleString()}/mo</span>
                  <span className="app-badge">{p.bedrooms} beds</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--accent-primary)', marginTop: 8 }}>
                  Tap to see analysis for this property →
                </p>
              </button>
            ))}

            {otherProps.length === 0 && (
              <div className="card-inner" style={{ textAlign: 'center' }}>
                <p className="body-text" style={{ fontSize: 13 }}>
                  You only have one property. Go to Check to add more for comparison.
                </p>
                <button onClick={() => router.push('/check')} className="btn-ghost" style={{ marginTop: 8 }}>
                  Add another property
                </button>
              </div>
            )}
          </div>

          {/* Property conversation */}
          {unlock.propertyConversations.map((conv, i) => (
            <div key={i} className="section-gap" style={{ gap: 10 }}>
              <div className="card-success">
                <p className="label" style={{ color: 'var(--success)' }}>May feel easier here</p>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {conv.easierHere.map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--success)', flexShrink: 0 }}>·</span>
                      <p className="body-text" style={{ fontSize: 13 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-warning">
                <p className="label" style={{ color: 'var(--warning)' }}>May attract attention</p>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {conv.attentionHere.map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--warning)', flexShrink: 0 }}>·</span>
                      <p className="body-text" style={{ fontSize: 13 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-accent">
                <p className="label" style={{ color: 'var(--accent-primary)' }}>What we would focus on</p>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {conv.focusHere.map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>·</span>
                      <p className="body-text" style={{ fontSize: 13 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => switchTab('strategy')} className="btn-primary">
            See your rental strategy →
          </button>
        </div>
      )}

      {/* ══ TAB: STRATEGY ══════════════════════════════════ */}
      {activeTab === 'strategy' && (
        <div className="section-gap">

          {/* Strategy narrative */}
          <div className="card-hero">
            <p className="app-eyebrow" style={{ color: 'var(--accent-primary)' }}>Your rental strategy</p>
            <p className="section-title" style={{ marginTop: 8 }}>If we were in your shoes</p>
            <div style={{ marginTop: 16 }}>
              {unlock.strategy.narrative.split('\n\n').map((para, i) => (
                <p key={i} className="body-text" style={{ marginTop: i > 0 ? 14 : 0, lineHeight: 1.8 }}>{para}</p>
              ))}
            </div>
          </div>

          {/* Introduction message */}
          <div className="card card-elevated">
            <p className="app-eyebrow">Ready to use</p>
            <p className="section-title" style={{ marginTop: 8 }}>Introduction message</p>
            <p className="section-subtitle">
              Based on everything you have shared. Edit it however you like before sending.
            </p>
            <div style={{
              marginTop: 16, padding: '16px', borderRadius: 'var(--radius-card)',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-soft)',
              whiteSpace: 'pre-line',
            }}>
              <p className="body-text" style={{ lineHeight: 1.8, fontSize: 14 }}>
                {unlock.introduction.introduction}
              </p>
            </div>
            <CopyBtn text={unlock.introduction.introduction} />
          </div>

          {/* Final CTA — go to dashboard */}
          <div className="card-gold" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <span className="app-badge badge-gold" style={{ marginBottom: 14 }}>Rental picture complete</span>
            <p className="section-title" style={{ marginTop: 12 }}>
              You now know more than most renters before they apply
            </p>
            <p className="section-subtitle" style={{ marginTop: 8 }}>
              You have seen what creates confidence, what may create questions, and where to focus next.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-gold"
              style={{ marginTop: 20 }}
            >
              Go to my dashboard
            </button>
            <button
              onClick={() => { setActiveTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="btn-secondary"
              style={{ marginTop: 10 }}
            >
              Review from the beginning
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
