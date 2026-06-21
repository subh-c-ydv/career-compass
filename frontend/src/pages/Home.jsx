import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profiles')
      .then(r => r.json())
      .then(data => { setProfiles(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <div className="h1">Career Compass</div>
          <p className="muted">Mercedes Model coaching profiles</p>
        </div>
        <Link to="/profile/new" className="btn btn-primary">+ New Profile</Link>
      </div>

      {loading && <p className="muted">Loading profiles…</p>}

      {!loading && profiles.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧭</div>
          <p className="muted">No profiles yet. Start by creating your own.</p>
          <Link to="/profile/new" className="btn btn-primary mt-2">Create first profile</Link>
        </div>
      )}

      {profiles.map(p => (
        <div className="card flex gap-2" key={p.id} style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div className="small muted mt-1">ID: {p.id}</div>
          </div>
          <div className="flex gap-1">
            <span className={`tag ${p.type === 'coach' ? 'coach' : ''}`}>{p.type}</span>
            <Link to={`/profile/${p.id}`} className="btn btn-secondary">Edit</Link>
            <Link to={`/analysis/${p.id}`} className="btn btn-primary">Analyse</Link>
          </div>
        </div>
      ))}
    </div>
  )
}