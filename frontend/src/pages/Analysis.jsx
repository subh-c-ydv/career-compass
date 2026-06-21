import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function ScoreRing({ score, label, colour }) {
  const pct = (score / 10) * 100
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={colour} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 36 36)" />
        <text x="36" y="41" textAnchor="middle" fill={colour} fontSize="14" fontWeight="700"
          fontFamily="var(--font-body)">{score}</text>
      </svg>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{label}</div>
    </div>
  )
}

function ListSection({ title, items, colour }) {
  if (!items || items.length === 0) return null
  return (
    <div className="mt-2">
      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: colour, marginBottom: '0.5rem' }}>{title}</div>
      <ul style={{ listStyle: 'none' }}>
        {items.map((item, i) => (
          <li key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)',
            fontSize: '0.9rem', display: 'flex', gap: '0.5rem' }}>
            <span style={{ color: colour, marginTop: '2px' }}>›</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Analysis() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/profiles/${id}`)
      .then(r => r.json())
      .then(setProfile)
  }, [id])

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })
      const data = await res.json()
      setAnalysis(data.analysis)
    } catch (e) {
      setError('Analysis failed. Check the backend is running.')
    }
    setLoading(false)
  }

  if (!profile) return <p className="muted">Loading profile…</p>

  const a = analysis

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <div className="h2">{profile.name}</div>
          <span className={`tag ${profile.type === 'coach' ? 'coach' : ''}`}>{profile.type}</span>
        </div>
        <div className="flex gap-1">
          <Link to={`/profile/${id}`} className="btn btn-secondary">Edit</Link>
          <button className="btn btn-warm" onClick={runAnalysis} disabled={loading}>
            {loading ? 'Analysing…' : '✦ Run Analysis'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      {!a && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✦</div>
          <p className="muted">Click <strong>Run Analysis</strong> to generate the Mercedes Model assessment.</p>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="muted">Running analysis… this takes a few seconds.</p>
        </div>
      )}

      {a && !a.parse_error && (
        <>
          {/* Scores row */}
          <div className="card">
            <div className="section-label">Scores</div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <ScoreRing score={a.coherence_score} label="Coherence" colour="#6c8eff" />
              <ScoreRing score={a.hub_strength} label="Hub Strength" colour="#a78bfa" />
              <ScoreRing score={a.domain_scores?.domain_a} label={profile.domain_a?.label || 'Domain A'} colour="#6c8eff" />
              <ScoreRing score={a.domain_scores?.domain_b} label={profile.domain_b?.label || 'Domain B'} colour="#f0a04b" />
              <ScoreRing score={a.domain_scores?.domain_c} label={profile.domain_c?.label || 'Domain C'} colour="#4caf7d" />
            </div>
          </div>

          {/* Narrative thread */}
          {a.narrative_thread && (
            <div className="card" style={{ borderLeft: '3px solid var(--accent-warm)', paddingLeft: '1.2rem' }}>
              <div className="section-label" style={{ color: 'var(--accent-warm)' }}>Narrative Thread</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', lineHeight: 1.5 }}>
                "{a.narrative_thread}"
              </p>
            </div>
          )}

          {/* Coherence + Hub */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card">
              <div className="section-label">Coherence</div>
              <p className="small">{a.coherence_summary}</p>
            </div>
            <div className="card">
              <div className="section-label" style={{ color: '#a78bfa' }}>Hub Assessment</div>
              <p className="small">{a.hub_assessment}</p>
            </div>
          </div>

          {/* Lists */}
          <div className="card">
            <ListSection title="Strengths" items={a.strengths} colour="#4caf7d" />
            <ListSection title="Tensions & Gaps" items={a.tensions} colour="var(--danger)" />
            <ListSection title="Opportunities" items={a.opportunities} colour="var(--accent-warm)" />
          </div>

          {/* Reflection questions */}
          {a.reflection_questions && (
            <div className="card">
              <div className="section-label">Coaching Questions</div>
              {a.reflection_questions.map((q, i) => (
                <div key={i} style={{ padding: '0.75rem', background: 'var(--surface-2)',
                  borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--accent)', marginRight: '0.5rem' }}>Q{i + 1}</span> {q}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {a?.parse_error && (
        <div className="card">
          <div className="section-label" style={{ color: 'var(--danger)' }}>Raw Output</div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.raw}</pre>
        </div>
      )}
    </div>
  )
}
