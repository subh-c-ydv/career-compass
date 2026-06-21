import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const DIMENSION_COLOURS = ['#6c8eff', '#f0a04b', '#4caf7d', '#e05c5c', '#a78bfa', '#38bdf8']

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

function RadarDiagram({ analysis, profile }) {
  const cx = 220
  const cy = 230
  const maxR = 130
  const levels = 5

  const dimensions = profile?.dimensions || []
  const n = dimensions.length
  if (n < 2) return null

  const toRad = deg => (deg * Math.PI) / 180

  // Evenly space axes, starting from top (-90 degrees)
  const angles = dimensions.map((_, i) => -90 + (360 / n) * i)

  const axisPoint = (angle, r) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle))
  })

  // Grid polygon at level r
  const gridPolygon = r =>
    angles.map(a => axisPoint(a, r)).map(p => `${p.x},${p.y}`).join(' ')

  // Data points
  const scores = dimensions.map((_, i) => {
    const key = `dimension_${i + 1}`
    return analysis.dimension_scores?.[key] || 0
  })

  const dataPoints = scores
    .map((score, i) => {
      const pt = axisPoint(angles[i], (score / 10) * maxR)
      return `${pt.x},${pt.y}`
    })
    .join(' ')

  const hubScore = analysis.hub_strength || 0
  const hubR = 10 + ((hubScore / 10) * 18)


  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="section-label" style={{ alignSelf: 'flex-start' }}>Career Compass Map</div>
      <svg width="500" height="500" viewBox="0 0 500 500" style={{ maxWidth: '100%' }}>
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6c8eff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4caf7d" stopOpacity="0.1" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid levels */}
        {Array.from({ length: levels }).map((_, i) => {
          const r = ((i + 1) / levels) * maxR
          return (
            <polygon key={i} points={gridPolygon(r)}
              fill="none" stroke="#2e3350"
              strokeWidth={i === levels - 1 ? 1.5 : 1}
              strokeDasharray={i === levels - 1 ? 'none' : '3 4'}
              opacity={0.6} />
          )
        })}

        {/* Scale labels on first axis */}
        {Array.from({ length: levels }).map((_, i) => {
          const r = ((i + 1) / levels) * maxR
          const pt = axisPoint(angles[0], r)
          return (
            <text key={i} x={pt.x + 5} y={pt.y + 4}
              fill="#444c6e" fontSize="8" fontFamily="Inter, sans-serif">
              {((i + 1) / levels * 10).toFixed(0)}
            </text>
          )
        })}

        {/* Axes */}
        {angles.map((angle, i) => {
          const tip = axisPoint(angle, maxR)
          return (
            <line key={i} x1={cx} y1={cy} x2={tip.x} y2={tip.y}
              stroke={DIMENSION_COLOURS[i % DIMENSION_COLOURS.length]}
              strokeWidth="1.5" opacity="0.4" />
          )
        })}

        {/* Data polygon */}
        <polygon points={dataPoints} fill="url(#radarFill)" opacity="0.85" />
        <polygon points={dataPoints} fill="none"
          stroke="#6c8eff" strokeWidth="2" strokeLinejoin="round"
          filter="url(#softGlow)" opacity="0.9" />

        {/* Data point dots + scores */}
        {scores.map((score, i) => {
          const pt = axisPoint(angles[i], (score / 10) * maxR)
          const colour = DIMENSION_COLOURS[i % DIMENSION_COLOURS.length]
          return (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r="6" fill={colour} />
              <text x={pt.x} y={pt.y + 4} textAnchor="middle"
                fill="white" fontSize="7" fontWeight="700">{score}</text>
            </g>
          )
        })}

        {/* Hub */}
        <circle cx={cx} cy={cy} r={hubR + 10} fill="#a78bfa" opacity="0.08" />
        <circle cx={cx} cy={cy} r={hubR} fill="#1a1d27" stroke="#a78bfa" strokeWidth="2" />
        <text x={cx} y={cy - 3} textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="700">{hubScore}</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fill="#a78bfa" fontSize="7" opacity="0.8">HUB</text>

        {/* Dimension labels — name only, word-wrapped */}
        {dimensions.map((dim, i) => {
          const colour = DIMENSION_COLOURS[i % DIMENSION_COLOURS.length]
          const labelPt = axisPoint(angles[i], maxR + 32)
          const words = (dim.label || `Dimension ${i + 1}`).split(' ')
          const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ')
          const line2 = words.slice(Math.ceil(words.length / 2)).join(' ')
          return (
            <g key={i}>
              <text x={labelPt.x} y={labelPt.y - (line2 ? 6 : 0)}
                textAnchor="middle" fill={colour} fontSize="10" fontWeight="600">
                {line1}
              </text>
              {line2 && (
                <text x={labelPt.x} y={labelPt.y + 8}
                  textAnchor="middle" fill={colour} fontSize="10" fontWeight="600">
                  {line2}
                </text>
              )}
            </g>
          )
        })}

        {/* Coherence footer */}
        <text x={cx} y={480} textAnchor="middle" fill="#6c8eff" fontSize="10" fontWeight="600">
          Overall Coherence {analysis.coherence_score}/10
        </text>
      </svg>
      <p className="small muted" style={{ marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
        A balanced shape indicates strong coherence across dimensions. A lopsided shape signals a coaching opportunity.
      </p>
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
  const [exporting, setExporting] = useState(false)
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

  const handleExport = async () => {
    if (!analysis) return
    setExporting(true)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, analysis })
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `career-compass-${profile.name.replace(/\s+/g, '_')}.pdf`
      anchor.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setError('Export failed. Check the backend is running.')
    }
    setExporting(false)
  }

  if (!profile) return <p className="muted">Loading profile…</p>

  const a = analysis
  const dimensions = profile?.dimensions || []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <div className="h2">{profile.name}</div>
          <span className={`tag ${profile.type === 'coach' ? 'coach' : ''}`}>{profile.type}</span>
        </div>
        <div className="flex gap-1">
          <Link to={`/profile/${id}`} className="btn btn-secondary">Edit</Link>
          {a && !a.parse_error && (
            <button className="btn btn-secondary" onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting…' : '↓ Export PDF'}
            </button>
          )}
          <button className="btn btn-warm" onClick={runAnalysis} disabled={loading}>
            {loading ? 'Analysing…' : '✦ Run Analysis'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      {!a && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✦</div>
          <p className="muted">Click <strong>Run Analysis</strong> to generate the Career Compass Map assessment.</p>
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
              {dimensions.map((dim, i) => (
                <ScoreRing
                  key={i}
                  score={a.dimension_scores?.[`dimension_${i + 1}`]}
                  label={dim.label || `Dimension ${i + 1}`}
                  colour={DIMENSION_COLOURS[i % DIMENSION_COLOURS.length]}
                />
              ))}
            </div>
          </div>

          {/* Radar Diagram */}
          <RadarDiagram analysis={a} profile={profile} />

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