import React, { useEffect, useState, useCallback } from 'react'
import { detectionsAPI, imageUrl } from '../services/api'
import { Search, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import './Historial.css'

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

function ConfLevel({ value }) {
  const pct = Math.round(value * 100)
  const level = pct >= 85 ? 'Alto' : pct >= 65 ? 'Medio' : 'Bajo'
  const color = pct >= 85 ? '#52b788' : pct >= 65 ? '#f4a261' : '#e63946'
  return (
    <span className="conf-level" style={{ '--c': color }}>
      <span className="conf-dot" />
      {level}
    </span>
  )
}

export default function Historial() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 10

  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')
  const [fecha, setFecha] = useState('')

  const [selectedItem, setSelectedItem] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await detectionsAPI.history({
        limit,
        skip: (page - 1) * limit,
        ...(categoria && { categoria }),
        ...(search && { zona: search }),
        ...(fecha && { fecha }),
      })
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, categoria, search, fecha])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') { setPage(1); fetchData() }
  }

  const handleExport = () => {
    detectionsAPI.exportCSV({ categoria, zona: search, fecha }).catch(console.error)
  }

  const applyFilters = () => { setPage(1); fetchData() }

  return (
    <div className="historial page-enter">
      <div className="page-header">
        <div className="page-header__inner">
          <h1 className="page-header__title">🗂️ Historial de detecciones</h1>
          <p className="page-header__sub">Registro completo · filtra por categoría, zona y fecha</p>
        </div>
      </div>

      <div className="historial__inner">
        {/* FILTERS */}
        <div className="filters-bar">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por zona o tipo de residuo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchKey}
            />
          </div>

          <select value={categoria} onChange={e => { setCategoria(e.target.value); setPage(1) }}>
            <option value="">Todas las categorías</option>
            <option value="Aprovechable">Aprovechable</option>
            <option value="No_aprovechable">No aprovechable</option>
            <option value="Orgánico">Orgánico</option>
          </select>

          <select value={fecha} onChange={e => { setFecha(e.target.value); setPage(1) }}>
            <option value="">Cualquier fecha</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
          </select>

          <button className="btn-export" onClick={handleExport}>
            <Download size={15} />
            Exportar CSV
          </button>
        </div>

        {/* TABLE */}
        <div className="table-card">
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
            </div>
          ) : items.length === 0 ? (
            <div className="table-empty">
              <p>No se encontraron detecciones</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="hist-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>IMAGEN</th>
                    <th>ZONA</th>
                    <th>CATEGORÍAS DETECTADAS</th>
                    <th>CONFIANZA</th>
                    <th>NIVEL</th>
                    <th>FECHA</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id}>
                      <td className="id-col">#{String(i + 1 + (page - 1) * limit).padStart(3, '0')}</td>
                      <td>
                        <div className="thumb-wrap">
                          {item.url ? (
                            <img src={imageUrl(item.url)} alt="thumb" className="thumb" />
                          ) : (
                            <div className="thumb-ph">📷</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="zona-cell">
                          <span className="zona-name">{item.zona || '—'}</span>
                          {item.zona_detalle && (
                            <span className="zona-detail">{item.zona_detalle}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="tags-wrap">
                          {Object.keys(item.resumen || {}).map(cls => (
                            <span
                              key={cls}
                              className="tag"
                              style={{ '--t': CLASS_COLORS[cls] || '#888' }}
                            >
                              {CLASS_LABELS[cls] || cls}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="conf-val" style={{
                          color: item.confianza_max >= 0.85 ? '#52b788' :
                                 item.confianza_max >= 0.65 ? '#f4a261' : '#e63946'
                        }}>
                          {item.confianza_max ? `${Math.round(item.confianza_max * 100)}%` : '—'}
                        </span>
                      </td>
                      <td>
                        {item.confianza_max
                          ? <ConfLevel value={item.confianza_max} />
                          : '—'}
                      </td>
                      <td className="date-col">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString('es', {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })
                          : '—'}
                      </td>
                      <td>
                        <button className="action-btn" onClick={() => setSelectedItem(item)} title="Ver detalle">
                          <Eye size={14} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {!loading && total > 0 && (
            <div className="pagination">
              <span className="pagination__info">
                Mostrando {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} de {total} registros
              </span>
              <div className="pagination__controls">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1
                  return (
                    <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>
                      {p}
                    </button>
                  )
                })}
                {totalPages > 5 && <span>...</span>}
                {totalPages > 5 && (
                  <button className={page === totalPages ? 'active' : ''} onClick={() => setPage(totalPages)}>
                    {totalPages}
                  </button>
                )}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setSelectedItem(null)}>✕</button>
            <h3 className="modal__title">Detalle de detección</h3>
            {selectedItem.annotated_url && (
              <img
                src={imageUrl(selectedItem.annotated_url)}
                alt="annotated"
                className="modal__img"
              />
            )}
            <div className="modal__info">
              <div><strong>Zona:</strong> {selectedItem.zona || '—'}</div>
              <div><strong>Detalle:</strong> {selectedItem.zona_detalle || '—'}</div>
              <div><strong>Fecha:</strong> {new Date(selectedItem.created_at).toLocaleString('es')}</div>
              <div><strong>Categorías:</strong> {Object.entries(selectedItem.resumen || {}).map(([k,v]) => `${CLASS_LABELS[k]}: ${v}`).join(', ')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
