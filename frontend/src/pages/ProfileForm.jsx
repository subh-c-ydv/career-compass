import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const EMPTY_DOMAIN = { label: '', description: '', years: '', highlights: ['', '', ''] }

const EMPTY_PROFILE = {
  name: '',
  type: 'client',
  dimensions: [
    { ...EMPTY_DOMAIN },
    { ...EMPTY_DOMAIN },
    { ...EMPTY_DOMAIN }
  ],
  hub: { statement: '', values: ['', '', ''] }
}

const EXAMPLE_PROFILE = {
  name: 'Subhash Yadav',
  type: 'coach',
  dimensions: [
    {
      label: 'Software Delivery Leadership',
      description: 'Leading large-scale technology delivery across global organisations — spanning portfolio management, programme delivery, and Agile transformation. The operational core of a 20+ year career.',
      years: '20',
      highlights: [
        'Portfolio Manager at Bunker Holding Group, overseeing cross-functional delivery across multiple Scrum teams',
        'Senior roles at Maersk / APM Terminals driving payment digitalisation — reducing cash transactions by 25-30%',
        'End-to-end programme delivery at Infosys across enterprise technology engagements'
      ]
    },
    {
      label: 'Strategy & Consulting',
      description: 'An aspirational direction toward advisory and consulting work — bringing strategic thinking, organisational design, and technology leadership into a self-directed practice, likely anchored in India post-Denmark.',
      years: '5',
      highlights: [
        'Evaluating executive education pathways (ISB, Henley) to build consulting credibility',
        'Building thought leadership platform at allthingsagile.net as a consulting identity',
        'Cross-border financial and career planning toward entrepreneurial independence by mid-2030s'
      ]
    },
    {
      label: 'Agile Coaching',
      description: 'A methodological identity rooted in Agile ways of working — not just as a framework but as a philosophy of continuous improvement, team empowerment, and coaching-led leadership.',
      years: '12',
      highlights: [
        'Designing and facilitating retrospectives across multiple Scrum teams with custom formats',
        'Exploring ICF-accredited coaching certification via Henley Business School PCEC programme',
        'Publishing Agile insights and frameworks at allthingsagile.net'
      ]
    }
  ],
  hub: {
    statement: 'A technology delivery leader who bridges execution and strategy — using Agile coaching as the connective tissue between getting things done today and building the systems that work tomorrow.',
    values: ['Delivery Excellence', 'Continuous Improvement', 'Purposeful Leadership']
  }
}

const DOMAIN_COLOURS = ['#6c8eff', '#f0a04b', '#4caf7d', '#e05c5c', '#a78bfa', '#38bdf8']

function DimensionSection({ index, value, onChange, onRemove, canRemove }) {
  const colour = DOMAIN_COLOURS[index % DOMAIN_COLOURS.length]

  const update = (field, val) => onChange({ ...value, [field]: val })
  const updateHighlight = (i, val) => {
    const h = [...value.highlights]
    h[i] = val
    onChange({ ...value, highlights: h })
  }

  return (
    <div className="card" style={{ borderTop: `3px solid ${colour}`, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="section-label" style={{ color: colour, marginBottom: 0 }}>
          Dimension {index + 1}
        </div>
        {canRemove && (
          <button onClick={onRemove} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0.2rem 0.4rem',
            borderRadius: 'var(--radius-sm)', transition: 'color 0.15s'
          }}
            onMouseEnter={e => e.target.style.color = 'var(--danger)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            title="Remove dimension">✕</button>
        )}
      </div>

      <div className="field">
        <label>Dimension Label</label>
        <input placeholder="e.g. Software Delivery Leadership" value={value.label}
          onChange={e => update('label', e.target.value)} />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea placeholder="What is this dimension? What does it cover in your career?"
          value={value.description} onChange={e => update('description', e.target.value)} />
      </div>
      <div className="field">
        <label>Years of experience</label>
        <input placeholder="e.g. 15" value={value.years}
          onChange={e => update('years', e.target.value)} />
      </div>
      <div className="field">
        <label>Key highlights (up to 3)</label>
        {value.highlights.map((h, i) => (
          <input key={i} style={{ marginBottom: '0.4rem' }}
            placeholder={`Highlight ${i + 1}`} value={h}
            onChange={e => updateHighlight(i, e.target.value)} />
        ))}
      </div>
    </div>
  )
}

export default function ProfileForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [saving, setSaving] = useState(false)
  const isNew = !id

  useEffect(() => {
    if (id) {
      fetch(`/api/profiles/${id}`)
        .then(r => r.json())
        .then(data => setProfile(data))
    }
  }, [id])

  const updateDimension = (index, val) => {
    const dimensions = [...profile.dimensions]
    dimensions[index] = val
    setProfile(p => ({ ...p, dimensions }))
  }

  const addDimension = () => {
    if (profile.dimensions.length >= 6) return
    setProfile(p => ({ ...p, dimensions: [...p.dimensions, { ...EMPTY_DOMAIN }] }))
  }

  const removeDimension = (index) => {
    if (profile.dimensions.length <= 3) return
    const dimensions = profile.dimensions.filter((_, i) => i !== index)
    setProfile(p => ({ ...p, dimensions }))
  }

  const updateHub = (field, val) => setProfile(p => ({ ...p, hub: { ...p.hub, [field]: val } }))
  const updateValue = (i, val) => {
    const v = [...profile.hub.values]
    v[i] = val
    setProfile(p => ({ ...p, hub: { ...p.hub, values: v } }))
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    })
    const data = await res.json()
    setSaving(false)
    navigate(`/analysis/${data.profile_id}`)
  }

  const loadExample = () => setProfile({ ...EXAMPLE_PROFILE })

  const atMax = profile.dimensions.length >= 6
  const atMin = profile.dimensions.length <= 3

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
        <div className="h2">{isNew ? 'New Profile' : 'Edit Profile'}</div>
        {isNew && (
          <button className="btn btn-secondary" onClick={loadExample}>✦ Load Example</button>
        )}
      </div>
      <p className="muted small mt-1" style={{ marginBottom: '2rem' }}>
        Define between 3 and 6 career dimensions, then complete the hub.
        {isNew && <span style={{ color: 'var(--accent)', marginLeft: '0.4rem' }}>Try the example profile to see how it works.</span>}
      </p>

      <div className="card">
        <div className="section-label">Profile Info</div>
        <div className="field">
          <label>Full Name</label>
          <input placeholder="Name of the person being profiled"
            value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="field">
          <label>Profile Type</label>
          <select style={{ width: '100%', padding: '0.6rem', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)' }}
            value={profile.type} onChange={e => setProfile(p => ({ ...p, type: e.target.value }))}>
            <option value="coach">Coach (me)</option>
            <option value="client">Client</option>
          </select>
        </div>
      </div>

      {profile.dimensions.map((dimension, i) => (
        <DimensionSection
          key={i}
          index={i}
          value={dimension}
          onChange={val => updateDimension(i, val)}
          onRemove={() => removeDimension(i)}
          canRemove={!atMin}
        />
      ))}

      <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0 1.5rem' }}>
        <button className="btn btn-secondary" onClick={addDimension} disabled={atMax}
          style={{ opacity: atMax ? 0.4 : 1 }}>
          + Add Dimension {atMax ? '(max 6)' : `(${profile.dimensions.length}/6)`}
        </button>
      </div>

      <div className="card" style={{ borderTop: '3px solid #a78bfa' }}>
        <div className="section-label" style={{ color: '#a78bfa' }}>The Hub — Personal Brand</div>
        <div className="field">
          <label>Brand Statement</label>
          <textarea placeholder="One or two sentences: who are you professionally, and what do you stand for?"
            value={profile.hub.statement} onChange={e => updateHub('statement', e.target.value)} />
        </div>
        <div className="field">
          <label>Core Values (up to 3)</label>
          {profile.hub.values.map((v, i) => (
            <input key={i} style={{ marginBottom: '0.4rem' }}
              placeholder={`Value ${i + 1} e.g. Integrity, Delivery, Growth`}
              value={v} onChange={e => updateValue(i, e.target.value)} />
          ))}
        </div>
      </div>

      <div className="flex gap-1 mt-2">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save & Analyse →'}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Cancel</button>
      </div>
    </div>
  )
}
