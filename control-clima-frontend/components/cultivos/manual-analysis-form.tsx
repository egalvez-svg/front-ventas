'use client'

import { useState } from 'react'
import { ManualAIAnalysisDto } from '@/lib/types/api'
import { Button } from '@/components/ui'
import { Thermometer, Droplets, FlaskConical, Beaker, FileText, Sparkles } from 'lucide-react'

interface ManualAnalysisFormProps {
    onSubmit: (data: ManualAIAnalysisDto) => void
    isLoading?: boolean
}

export function ManualAnalysisForm({ onSubmit, isLoading }: ManualAnalysisFormProps) {
    const [formData, setFormData] = useState({
        temperatura: '',
        humedad: '',
        ph: '',
        ec: '',
        notas_usuario: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            temperatura: parseFloat(formData.temperatura) || 0,
            humedad: parseFloat(formData.humedad) || 0,
            ph: formData.ph ? parseFloat(formData.ph) : undefined,
            ec: formData.ec ? parseFloat(formData.ec) : undefined,
            notas_usuario: formData.notas_usuario
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 leading-tight">Análisis Manual</h2>
                    <p className="text-sm text-slate-400 font-medium">Ingresa los parámetros actuales para una predicción precisa</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Temperatura */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-rose-500" />
                        Temperatura (°C)
                    </label>
                    <input
                        required
                        type="number"
                        step="0.1"
                        value={formData.temperatura}
                        onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })}
                        placeholder="Ej: 24.5"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900"
                    />
                </div>

                {/* Humedad */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-sky-500" />
                        Humedad (%)
                    </label>
                    <input
                        required
                        type="number"
                        step="0.1"
                        value={formData.humedad}
                        onChange={(e) => setFormData({ ...formData, humedad: e.target.value })}
                        placeholder="Ej: 60"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900"
                    />
                </div>

                {/* pH */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-emerald-500" />
                        pH (Opcional)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        value={formData.ph}
                        onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                        placeholder="Ej: 5.8"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900"
                    />
                </div>

                {/* EC */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Beaker className="w-4 h-4 text-amber-500" />
                        EC (Opcional)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.ec}
                        onChange={(e) => setFormData({ ...formData, ec: e.target.value })}
                        placeholder="Ej: 1.2"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900"
                    />
                </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Notas Adicionales (Opcional)
                </label>
                <textarea
                    value={formData.notas_usuario}
                    onChange={(e) => setFormData({ ...formData, notas_usuario: e.target.value })}
                    placeholder="Describe cualquier observación relevante..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium min-h-[100px] text-slate-900"
                />
            </div>

            <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black uppercase tracking-widest shadow-xl shadow-sky-600/20"
            >
                {isLoading ? 'Generando Informe...' : 'Solicitar Análisis Experto'}
            </Button>
        </form>
    )
}
