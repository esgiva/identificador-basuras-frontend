# Identificador de Basuras Digital — Frontend

App web React + Vite para el sistema de identificación de residuos con YOLO11s.

## ¿Qué incluye?
- Login / Registro con JWT
- Analizador de imágenes (drag & drop + cámara)
- Historial de detecciones con filtros y paginación
- Estadísticas y métricas del modelo
- Página "Acerca de"
- Mobile-first, responsive

## Configuración

El backend ya está desplegado en:
```
https://mila10-basura-inteligente.hf.space
```

## Instalar y correr localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en desarrollo
npm run dev
```

Abre http://localhost:5173 en el navegador.

## Build para producción

```bash
npm run build
```
Genera la carpeta `dist/` lista para desplegar.

## Despliegue en Vercel

1. Sube este proyecto a un repositorio en GitHub
2. Ve a vercel.com → New Project → importa el repo
3. Vercel detecta Vite automáticamente
4. Click en Deploy ✅

## Estructura

```
src/
  context/      # AuthContext (JWT)
  services/     # api.js (todas las llamadas al backend)
  components/   # Navbar
  pages/        # Home, Estadisticas, Historial, AcercaDe, Login
```
