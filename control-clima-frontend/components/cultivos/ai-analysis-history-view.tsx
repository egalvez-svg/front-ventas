'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchHistorialAnalisisIA } from '@/lib/api/ia-service'
import { LoadingSpinner } from '@/components/ui'
import { Brain, Sparkles, TrendingUp, Droplets, FlaskConical, AlertTriangle, Info, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface AIAnalysisHistoryViewProps {
    cultivoId: number
}

function MarkdownLite({ content }: { content: string }) {
    if (!content) return null

    const lines = content.split('\n')
    return (
        <div className="space-y-4">
            {lines.map((line, i) => {
                const trimmedLine = line.trim()
                if (!trimmedLine && line !== '') return <div key={i} className="h-2" />

                if (trimmedLine.startsWith('### ')) {
                    return <h3 key={i} className="text-xl font-black text-slate-800 mt-8 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-sky-500 rounded-full" />
                        {trimmedLine.replace('### ', '')}
                    </h3>
                }

                if (trimmedLine.startsWith('#### ')) {
                    return <h4 key={i} className="text-base font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">
                        {trimmedLine.replace('#### ', '')}
                    </h4>
                }

                if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                    const content = trimmedLine.replace(/^[* -] /, '')
                    const processed = content.split(/(\*\*.*?\*\*)/).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="font-bold text-slate-900">{part.replace(/\*\*/g, '')}</strong>
                        }
                        return part
                    })
                    return (
                        <div key={i} className="flex gap-3 ml-2 group">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-sky-400 group-hover:scale-125 transition-transform" />
                            <p className="text-slate-600 leading-relaxed text-sm flex-1">{processed}</p>
                        </div>
                    )
                }

                if (trimmedLine.startsWith('1. ') || trimmedLine.match(/^\d\. /)) {
                    const content = trimmedLine.replace(/^\d\. /, '')
                    const processed = content.split(/(\*\*.*?\*\*)/).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="font-bold text-slate-900">{part.replace(/\*\*/g, '')}</strong>
                        }
                        return part
                    })
                    return (
                        <div key={i} className="flex gap-3 ml-2">
                            <span className="font-black text-sky-500 text-sm">{trimmedLine.split('.')[0]}.</span>
                            <p className="text-slate-600 leading-relaxed text-sm flex-1">{processed}</p>
                        </div>
                    )
                }

                if (trimmedLine.startsWith('---')) {
                    return <hr key={i} className="my-8 border-slate-100" />
                }

                // Default paragraph with bold support
                const processedLine = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="font-bold text-slate-900">{part.replace(/\*\*/g, '')}</strong>
                    }
                    return part
                })

                return <p key={i} className="text-slate-600 leading-relaxed text-sm">{processedLine}</p>
            })}
        </div>
    )
}

export function AIAnalysisHistoryView({ cultivoId }: AIAnalysisHistoryViewProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const { data: historial = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['ia-analisis-historial', cultivoId],
        queryFn: () => fetchHistorialAnalisisIA(cultivoId),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5
    })

    if (isLoading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-sky-400/20 blur-3xl rounded-full" />
                    <Brain className="w-16 h-16 text-sky-500 animate-pulse relative z-10" />
                </div>
                <LoadingSpinner text="Cargando historial de análisis..." />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-6 animate-pulse">
                    Consultando registros históricos
                </p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <AlertTriangle className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-slate-800 mb-2">Error al cargar historial</h3>
                <p className="text-slate-500 max-w-sm text-center mb-8">
                    No pudimos cargar el historial de análisis. Por favor, intenta más tarde.
                </p>
                <button
                    onClick={() => refetch()}
                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    if (historial.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <Clock className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-slate-800 mb-2">Sin historial disponible</h3>
                <p className="text-slate-500 max-w-sm text-center">
                    No hay análisis históricos guardados para este cultivo.
                </p>
            </div>
        )
    }

    const selectedAnalysis = historial[selectedIndex]

    return (
        <div className="space-y-8">
            {/* Timeline Selector */}
            {historial.length > 1 && (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-5 h-5 text-sky-500" />
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Seleccionar Análisis</h3>
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-bold">{historial.length}</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {historial.map((analisis, index) => (
                            <button
                                key={analisis.id}
                                onClick={() => setSelectedIndex(index)}
                                className={cn(
                                    "flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all",
                                    selectedIndex === index
                                        ? "bg-sky-50 border-sky-500 text-sky-700"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-sky-300"
                                )}
                            >
                                <div className="text-left">
                                    <p className="text-xs font-bold uppercase tracking-wider mb-1">
                                        Día {analisis.snapshot.cultivo.dias_ciclo}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                        {new Date(analisis.fecha).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Analysis Display */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Main Content: Prediction */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Brain className="w-40 h-40" />
                        </div>

                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 leading-tight">Hoja de Ruta Técnica</h2>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(selectedAnalysis.fecha).toLocaleString('es-ES')}
                                </p>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none relative z-10">
                            <MarkdownLite content={selectedAnalysis.analisis} />
                        </div>
                    </div>
                </div>

                {/* Sidebar: Snapshot and Metrics */}
                <div className="space-y-8">
                    {/* Crop Context */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Contexto del Ciclo
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-500">Cultivo</span>
                                <span className="text-sm font-black text-slate-800">{selectedAnalysis.snapshot.cultivo.nombre}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-500">Día de Ciclo</span>
                                <span className="text-sm font-black text-sky-600">Día {selectedAnalysis.snapshot.cultivo.dias_ciclo}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-500">Estado</span>
                                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedAnalysis.snapshot.cultivo.estado}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-xs font-bold text-slate-500">Sala</span>
                                <span className="text-sm font-black text-slate-800">{selectedAnalysis.snapshot.cultivo.sala}</span>
                            </div>
                        </div>
                    </div>

                    {/* Nutrition Summary */}
                    <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Droplets className="w-4 h-4" />
                            Parámetros Analizados
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {selectedAnalysis.snapshot.nutricion.slice(0, 1).map((riego, idx) => (
                                <div key={idx} className="space-y-4">
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                                                <TrendingUp className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500">pH Nivel</span>
                                        </div>
                                        <span className="text-base font-black text-slate-800">{riego.ph}</span>
                                    </div>

                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                                                <FlaskConical className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500">EC (Salinidad)</span>
                                        </div>
                                        <span className="text-base font-black text-slate-800">{riego.ec}</span>
                                    </div>

                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center">
                                                <Droplets className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500">Volumen</span>
                                        </div>
                                        <span className="text-base font-black text-slate-800">{riego.litros}L</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Technical Advisor Badge */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-600/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full border-2 border-sky-400/50 p-0.5">
                                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-black text-xl">
                                    IA
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-black leading-tight">Advisor Virtual</p>
                                <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Especialista Agrónomo</p>
                            </div>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-100 italic">
                            "Mi sistema procesa miles de puntos de datos de cultivos exitosos para darte la recomendación más precisa para tu sala actual."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
