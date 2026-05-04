import React, { useEffect, useState } from 'react'
import { detectionsAPI } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import './Estadisticas.css'

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

function MetricCard({ label, value, sub, color }) {
  return (
    <div className="metric-card" style={{ '--accent': color }}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      {sub && <span className="metric-sub">{sub}</span>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip__label">{label}</div>
        <div className="chart-tooltip__value">{payload[0].value} detecciones</div>
      </div>
    )
  }
  return null
}

export default function Estadisticas() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    detectionsAPI.stats()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
    </div>
  )

  if (error) return (
    <div className="page-error">
      <p>⚠️ {error}</p>
    </div>
  )

  const promedio = data?.metricas_por_clase?.Promedio
  const chartData = (data?.detecciones_por_dia || []).map(d => ({
    fecha: new Date(d.fecha).toLocaleDateString('es', { weekday: 'short' }),
    total: d.total,
  }))

  const maxDia = data?.detecciones_por_dia?.reduce((a, b) => a.total > b.total ? a : b, {})

  return (
    <div className="estadisticas page-enter">
      <div className="page-header">
        <div className="page-header__inner">
          <h1 className="page-header__title">📊 Estadísticas del modelo</h1>
          <p className="page-header__sub">
            Métricas de rendimiento · YOLO11s · 100 épocas en Google Colab
          </p>
        </div>
      </div>

      <div className="stats-inner">
        {/* TOP METRICS */}
        <div className="metrics-grid">
          <MetricCard
            label="Precisión mAP@0.5"
            value={`${((promedio?.map50 || 0) * 100).toFixed(1)}%`}
            sub="↑ Modelo entrenado"
            color="#52b788"
          />
          <MetricCard
            label="Tiempo de inferencia"
            value="31ms"
            sub="↓ Tiempo reducido"
            color="#60a5fa"
          />
          <MetricCard
            label="Imágenes en dataset"
            value={data?.total_imagenes_analizadas || 36}
            sub="Etiquetadas en Label Studio"
            color="#a78bfa"
          />
          <MetricCard
            label="Épocas entrenadas"
            value="100"
            sub="Google Colab · GPU T4"
            color="#f4a261"
          />
        </div>

        {/* CHARTS ROW */}
        <div className="charts-row">
          {/* DISTRIBUTION */}
          <div className="card">
            <h3 className="card-title">Distribución por categoría</h3>
            <p className="card-sub">Total acumulado de detecciones</p>
            <div className="dist-list">
              {Object.entries(data?.distribucion_por_clase || {}).map(([cls, info]) => (
                <div key={cls} className="dist-row">
                  <span className="dist-name">{CLASS_LABELS[cls] || cls}</span>
                  <div className="dist-bar-wrap">
                    <div
                      className="dist-bar-fill"
                      style={{
                        width: `${info.porcentaje}%`,
                        background: CLASS_COLORS[cls] || '#888'
                      }}
                    >
                      <span className="dist-pct">{info.porcentaje?.toFixed(0)}%</span>
                    </div>
                  </div>
                  <span className="dist-count">{info.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BAR CHART */}
          <div className="card">
            <h3 className="card-title">Detecciones por día</h3>
            <p className="card-sub">Últimos 7 días</p>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={28}>
                  <XAxis dataKey="fecha" tick={{ fill: '#6aab82', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(82,183,136,0.06)' }} />
                  <Bar dataKey="total" radius={[4,4,0,0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.total === Math.max(...chartData.map(d => d.total))
                          ? '#52b788' : '#2d6a4f'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {maxDia?.fecha && (
              <p className="chart-peak">
                Pico: <strong>{new Date(maxDia.fecha).toLocaleDateString('es', { weekday: 'long' })}</strong> — {maxDia.total} detecciones
              </p>
            )}
          </div>
        </div>

        {/* METRICS TABLE */}
        <div className="card">
          <h3 className="card-title">Métricas por clase</h3>
          <p className="card-sub">Precisión, Recall y F1-Score · YOLO11s entrenado en Google Colab</p>
          <div className="table-wrap">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Clase</th>
                  <th>Precisión</th>
                  <th>Recall</th>
                  <th>F1-Score</th>
                  <th>mAP@0.5</th>
                  <th>Muestras</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data?.metricas_por_clase || {}).map(([cls, m]) => (
                  <tr key={cls} className={cls === 'Promedio' ? 'row-total' : ''}>
                    <td>
                      <span className="cls-dot" style={{
                        background: cls === 'Promedio' ? 'transparent' : (CLASS_COLORS[cls] || '#888')
                      }} />
                      {CLASS_LABELS[cls] || cls}
                    </td>
                    <td>{m.precision?.toFixed(3)}</td>
                    <td>{m.recall?.toFixed(3)}</td>
                    <td>
                      <span className="f1-badge" style={{ background: `${CLASS_COLORS[cls] || '#888'}22`, color: CLASS_COLORS[cls] || '#aaa' }}>
                        {m.f1?.toFixed(3)}
                      </span>
                    </td>
                    <td>{m.map50?.toFixed(3)}</td>
                    <td>{m.muestras}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
