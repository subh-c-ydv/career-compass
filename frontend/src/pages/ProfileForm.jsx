import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const EMPTY_DOMAIN = { label: '', description: '', years: '', highlights: ['', '', ''] }
const EMPTY_PROFILE = {
  name: '',
  type: 'client',
  domain_a: { ...EMPTY_DOMAIN },
  domain_b: { ...EMPTY_DOMAIN },
  domain_c: { ...EMPTY_DOMAIN },
  hub: { statement: '', values: ['', '', ''] }
}

function DomainSection({ label, value, onChange, letter }) {
  const colours = { A: '#6c8eff', B: '#f0a04b', C: '#4caf7d' }
  const colour = colours[letter]

  const update = (field, val) => onChange({ ...value, [field]: val })
  const updateHighlight = (i, val) => {
    const h = [...value.highlights]
    h[i] = val
    onChange({ ...value, highlights: h })
  }

  return (
    <div className="card" style={{ borderTop: `3px solid ${colour}` }}>
      <div className="section-label" style={{ color: colour }}>Point {letter}</div>
      <div className="field">
        <label>Domain Label</label>
        <input placeholder="e.g. Software Delivery Leadership" value={value.label}
          onChange={e => update('label', e.target.value)} />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea placeholder="What is this domain? What does it cover in your career?"
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

  const updateDomain = (key, val) => setProfile(p => ({ ...p, [key]: val }))
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

  return (
    <div>
      <div className="h2">{isNew ? 'New Profile' : 'Edit Profile'}</div>
      <p className="muted small mt-1" style={{ marginBottom: '2rem' }}>
        Fill in each of the three Mercedes Model domains and the hub.
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

      <DomainSection letter="A" label="Point A" value={profile.domain_a} onChange={v => updateDomain('domain_a', v)} />
      <DomainSection letter="B" label="Point B" value={profile.domain_b} onChange={v => updateDomain('domain_b', v)} />
      <DomainSection letter="C" label="Point C" value={profile.domain_c} onChange={v => updateDomain('domain_c', v)} />

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
