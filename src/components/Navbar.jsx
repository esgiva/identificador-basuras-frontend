import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Menu, X } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/estadisticas', label: 'Estadísticas' },
    { to: '/historial', label: 'Historial' },
    { to: '/acerca', label: 'Acerca de' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <div className="navbar__logo">♻</div>
          <div className="navbar__title">
            <span className="navbar__name">Identificador de Basuras Digital</span>
            <span className="navbar__org">Fundación Universitaria Lumen Gentium</span>
          </div>
        </div>

        <div className={`navbar__links ${open ? 'open' : ''}`}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          {user && (
            <button className="navbar__logout" onClick={handleLogout}>
              <LogOut size={15} />
              <span>Salir</span>
            </button>
          )}
        </div>

        <button className="navbar__burger" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  )
}
