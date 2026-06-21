import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import ProfileForm from './pages/ProfileForm.jsx'
import Analysis from './pages/Analysis.jsx'
import './styles.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="nav">
          <Link to="/" className="nav-brand">🧭 Career Compass</Link>
          <div className="nav-links">
            <Link to="/profile/new">New Profile</Link>
            <Link to="/">Profiles</Link>
          </div>
        </nav>
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/new" element={<ProfileForm />} />
            <Route path="/profile/:id" element={<ProfileForm />} />
            <Route path="/analysis/:id" element={<Analysis />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
