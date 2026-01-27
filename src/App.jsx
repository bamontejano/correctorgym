import React from 'react'
import ExerciseDetector from './components/ExerciseDetector'
import { Dumbbell } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Premium Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/10 glass rounded-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Dumbbell className="text-bg-dark" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">CORRECTOR <span className="text-primary">GYM IA</span></h1>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em]">High Performance Training</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-white">Prueba de Concepto v1.0</span>
            <span className="text-xs text-primary">Análisis de Pose 3D</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ExerciseDetector />
      </main>

      {/* Footer Info */}
      <footer className="p-4 text-center text-[10px] text-text-muted border-t border-white/5 bg-black/20">
        © 2026 Sistema de Análisis Biomecánico Inteligente • Desarrollado para Proyectos de Innovación en Gimnasios
      </footer>
    </div>
  )
}

export default App
