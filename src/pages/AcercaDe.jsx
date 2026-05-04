import React from 'react'
import './AcercaDe.css'

const steps = [
  { n: 1, title: 'Captura', desc: 'Fotos reales del campus Lumen Gentium con residuos' },
  { n: 2, title: 'Etiquetado', desc: 'Anotación con Label Studio — bounding boxes por categoría' },
  { n: 3, title: 'Entrenamiento', desc: 'YOLO11s en Google Colab · 100 épocas · GPU T4' },
  { n: 4, title: 'Plataforma web', desc: 'App React + MongoDB desplegada para el campus' },
]

const categories = [
  {
    icon: '♻️',
    name: 'Aprovechable',
    color: '#52b788',
    items: ['Plástico (botellas, bolsas, envases)', 'Papel y cartón limpio', 'Vidrio (botellas, frascos)', 'Metal (latas, chatarra)', 'Textiles en buen estado']
  },
  {
    icon: '🚫',
    name: 'No aprovechable',
    color: '#e63946',
    items: ['Papel higiénico y servilletas', 'Colillas de cigarrillo', 'Icopor / tecnopor', 'Envases con residuos', 'Residuos sin recuperación']
  },
  {
    icon: '🌿',
    name: 'Orgánico',
    color: '#f4a261',
    items: ['Cáscaras de frutas y verduras', 'Restos de alimentos', 'Residuos de jardín', 'Café y filtros usados', 'Alimentos vencidos']
  },
]

export default function AcercaDe() {
  return (
    <div className="acerca page-enter">
      <div className="acerca__hero">
        <h1>Acerca del proyecto</h1>
        <p>
          Sistema de visión artificial para identificar y clasificar residuos sólidos en el campus
          de la Fundación Universitaria Lumen Gentium, entrenado con YOLO11s y anotado con Label Studio.
        </p>
      </div>

      <div className="acerca__inner">
        {/* HOW IT WORKS */}
        <section className="acerca-section">
          <h2 className="acerca-section__title">Cómo funciona</h2>
          <p className="acerca-section__sub">Del dato real al modelo en producción</p>
          <div className="steps">
            <div className="steps__line" />
            {steps.map((s, i) => (
              <div key={s.n} className="step" style={{ '--delay': `${i * 0.1}s` }}>
                <div className="step__num">{s.n}</div>
                <div className="step__title">{s.title}</div>
                <div className="step__desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="acerca-section">
          <h2 className="acerca-section__title">Categorías de residuos</h2>
          <p className="acerca-section__sub">Clasificación según PGIRS — Política de Gestión Integral de Residuos Sólidos</p>
          <div className="cat-grid">
            {categories.map(cat => (
              <div key={cat.name} className="acerca-cat" style={{ '--c': cat.color }}>
                <div className="acerca-cat__icon">{cat.icon}</div>
                <h3 className="acerca-cat__name">{cat.name}</h3>
                <ul className="acerca-cat__list">
                  {cat.items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* TEAM */}
        <section className="acerca-section">
          <h2 className="acerca-section__title">Equipo del proyecto</h2>
          <p className="acerca-section__sub">Fundación Universitaria Lumen Gentium</p>
          <div className="team-card">
            <div className="team-logo">♻</div>
            <div>
              <div className="team-name">Fundación Universitaria Católica Lumen Gentium</div>
              <div className="team-detail">Proyecto de Identificación de Basuras Digitales · Cali, Colombia</div>
              <div className="team-stack">
                <span>YOLO11s</span>
                <span>FastAPI</span>
                <span>MongoDB Atlas</span>
                <span>React + Vite</span>
                <span>Label Studio</span>
                <span>Hugging Face</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="acerca-footer">
        Identificador de Basuras Digital · Fundación Universitaria Lumen Gentium · YOLO11s + Label Studio
      </footer>
    </div>
  )
}
