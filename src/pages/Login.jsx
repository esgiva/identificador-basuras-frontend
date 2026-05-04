import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.nombre, form.email, form.password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-blob login-blob--1" />
        <div className="login-blob login-blob--2" />
        <div className="login-grid" />
      </div>

      <div className="login-card">
        <div className="login-logo">♻</div>
        <h1 className="login-title">Identificador de<br /><span>Basuras Digital</span></h1>
        <p className="login-sub">Fundación Universitaria Lumen Gentium</p>

        <div className="login-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Iniciar sesión
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Registrarse
          </button>
        </div>

        <form onSubmit={submit} className="login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label>Nombre completo</label>
              <input
                name="nombre"
                type="text"
                placeholder="Juan Pérez"
                value={form.nombre}
                onChange={handle}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              name="email"
              type="email"
              placeholder="correo@unicatolicacali.edu.co"
              value={form.email}
              onChange={handle}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handle}
              required
            />
            <p>Use letras, numeros y simbolos</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
