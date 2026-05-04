import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { detectionsAPI, imageUrl } from '../services/api'
import { Camera, Upload, BarChart2, AlertCircle, CheckCircle, X } from 'lucide-react'
import './Home.css'

const CLASS_COLORS = {
  Aprovechable: '#52b788',
  No_aprovechable: '#e63946',
  Orgánico: '#f4a261',
}

const CLASS_LABELS = {
  Aprovechable: 'Aprovechable',
  No_aprovechable: 'No aprovechable',
  Orgánico: 'Orgánico',
}

export default function Home() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [zona, setZona] = useState('')
  const [zonaDetalle, setZonaDetalle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [cameraMode, setCameraMode] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Por favor sube una imagen JPG, PNG o WEBP')
      return
    }
    setSelectedFile(file)
    setResult(null)
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    processFile(file)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      setCameraActive(true)
    } catch {
      setError('No se pudo acceder a la cámara')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
    setCameraMode(false)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      const file = new File([blob], 'captura.jpg', { type: 'image/jpeg' })
      processFile(file)
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const analyze = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError('')
    try {
      const data = await detectionsAPI.analyze(selectedFile, zona, zonaDetalle)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setPreview(null)
    setSelectedFile(null)
    setResult(null)
    setError('')
    setZona('')
    setZonaDetalle('')
  }

  const totalDetections = result
    ? Object.values(result.resumen || {}).reduce((a, b) => a + b, 0)
    : 0

  return (
    <div className="home page-enter">
      {/* HERO */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
          <div className="hero__grid" />
        </div>
        <div className="hero__inner">
          <div className="hero__left">
            <div className="hero__badge">
              <span className="hero__dot" />
              Modelo activo · YOLO11s · Label Studio
            </div>
            <h1 className="hero__title">
              Identificador de<br />
              <span className="hero__title--accent">Basuras Digital</span>
            </h1>
            <p className="hero__desc">
              Detecta y clasifica residuos sólidos en el campus de la Fundación
              Universitaria Lumen Gentium usando visión artificial entrenada con YOLO11s.
            </p>
            <div className="hero__actions">
              <button className="btn btn--primary" onClick={() => document.getElementById('detector').scrollIntoView({ behavior: 'smooth' })}>
                <span className="btn__dot" />
                Analizar imagen
              </button>
              <button className="btn btn--ghost" onClick={() => navigate('/estadisticas')}>
                Ver estadísticas →
              </button>
            </div>
          </div>
          <div className="hero__stats">
            {[
              { value: '94%', label: 'Precisión' },
              { value: '3', label: 'Categorías' },
              { value: '36', label: 'Imágenes dataset' },
              { value: '31ms', label: 'Inferencia' },
            ].map(s => (
              <div key={s.label} className="hero__stat">
                <span className="hero__stat-value">{s.value}</span>
                <span className="hero__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DETECTOR */}
      <section className="detector" id="detector">
        <div className="detector__inner">
          <div className="detector__main">
            <h2 className="section-title">Detector de residuos</h2>
            <p className="section-sub">Sube una foto del campus y el modelo identificará los residuos automáticamente</p>

            {/* ZONE INPUTS */}
            <div className="zone-inputs">
              <div className="form-group">
                <label>Zona (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Cafetería central"
                  value={zona}
                  onChange={e => setZona(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Detalle (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Edificio principal"
                  value={zonaDetalle}
                  onChange={e => setZonaDetalle(e.target.value)}
                />
              </div>
            </div>

            {/* CAMERA */}
            {cameraMode && (
              <div className="camera-container">
                <video ref={videoRef} autoPlay playsInline className="camera-video" />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="camera-controls">
                  {!cameraActive ? (
                    <button className="btn btn--primary" onClick={startCamera}>Activar cámara</button>
                  ) : (
                    <>
                      <button className="btn btn--primary" onClick={capturePhoto}>📸 Capturar</button>
                      <button className="btn btn--ghost" onClick={stopCamera}>Cancelar</button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* DROPZONE */}
            {!cameraMode && !preview && (
              <div
                className={`dropzone ${dragOver ? 'dragover' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => processFile(e.target.files[0])}
                />
                <div className="dropzone__icon">📁</div>
                <p className="dropzone__text">
                  Arrastra una imagen aquí o <strong>busca un archivo</strong>
                </p>
                <p className="dropzone__hint">JPG · PNG · hasta 10 MB · también puedes usar la cámara</p>
                <div className="dropzone__divider"><span>o</span></div>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={e => { e.stopPropagation(); setCameraMode(true); startCamera() }}
                >
                  <Camera size={16} /> Usar cámara
                </button>
              </div>
            )}

            {/* PREVIEW + RESULT */}
            {preview && (
              <div className="preview-section">
                <div className="preview-img-wrap">
                  <img
                    src={result?.annotated_url ? imageUrl(result.annotated_url) : preview}
                    alt="Vista previa"
                    className="preview-img"
                  />
                  {result && (
                    <div className="preview-overlays">
                      {result.detections?.map((d, i) => {
                        const [x1, y1, x2, y2] = d.bbox
                        return (
                          <div
                            key={i}
                            className="detection-label"
                            style={{
                              left: `${x1 * 100}%`,
                              top: `${y1 * 100}%`,
                              background: CLASS_COLORS[d.clase] || '#fff',
                            }}
                          >
                            {CLASS_LABELS[d.clase]} {Math.round(d.confianza * 100)}%
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <button className="preview-close" onClick={reset}><X size={14} /></button>
                </div>

                {!result && (
                  <div className="analyze-bar">
                    <button className="btn btn--primary btn--full" onClick={analyze} disabled={loading}>
                      {loading ? <><span className="btn-spinner" /> Analizando...</> : '🔍 Analizar imagen'}
                    </button>
                  </div>
                )}

                {result && (
                  <div className="results-panel">
                    <div className="results-header">OBJETOS DETECTADOS</div>
                    {Object.entries(result.resumen || {}).map(([cls, count]) => {
                      const conf = result.detections
                        ?.filter(d => d.clase === cls)
                        .reduce((max, d) => Math.max(max, d.confianza), 0)
                      return (
                        <div key={cls} className="result-row">
                          <span className="result-dot" style={{ background: CLASS_COLORS[cls] }} />
                          <span className="result-name">{CLASS_LABELS[cls]}</span>
                          <div className="result-bar-wrap">
                            <div
                              className="result-bar"
                              style={{
                                width: `${Math.round(conf * 100)}%`,
                                background: CLASS_COLORS[cls]
                              }}
                            />
                          </div>
                          <span className="result-pct" style={{ color: CLASS_COLORS[cls] }}>
                            {Math.round(conf * 100)}%
                          </span>
                        </div>
                      )
                    })}
                    <button className="btn btn--primary btn--full" onClick={() => navigate('/historial')}>
                      Ver historial completo →
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="alert alert--error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>

          {/* SIDEBAR CATEGORIES */}
          <div className="detector__sidebar">
            <h3 className="sidebar-title">Categorías del modelo</h3>
            <p className="sidebar-sub">Clasificación según PGIRS Colombia</p>
            {[
              {
                key: 'Aprovechable',
                icon: '♻️',
                color: 'var(--aprovechable)',
                desc: 'Plástico, papel, cartón, vidrio, metal y textiles en buen estado que pueden reciclarse.'
              },
              {
                key: 'No aprovechable',
                icon: '🚫',
                color: 'var(--no-aprovechable)',
                desc: 'Papel higiénico, colillas, icopor, envases sucios y residuos sin posibilidad de recuperación.'
              },
              {
                key: 'Orgánico',
                icon: '🌿',
                color: 'var(--organico)',
                desc: 'Restos de comida, cáscaras, residuos de jardín y materiales biodegradables.'
              },
            ].map(cat => (
              <div key={cat.key} className="cat-card" style={{ '--cat-color': cat.color }}>
                <div className="cat-icon">{cat.icon}</div>
                <div>
                  <div className="cat-name">{cat.key}</div>
                  <div className="cat-desc">{cat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
