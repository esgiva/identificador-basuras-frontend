import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Estadisticas from './pages/Estadisticas'
import Historial from './pages/Historial'
import AcercaDe from './pages/AcercaDe'
import Login from './pages/Login'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ width:40, height:40, border:'3px solid var(--green-primary)', borderTopColor:'var(--green-bright)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={
        <ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>
      } />
      <Route path="/estadisticas" element={
        <ProtectedRoute><Layout><Estadisticas /></Layout></ProtectedRoute>
      } />
      <Route path="/historial" element={
        <ProtectedRoute><Layout><Historial /></Layout></ProtectedRoute>
      } />
      <Route path="/acerca" element={
        <ProtectedRoute><Layout><AcercaDe /></Layout></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
