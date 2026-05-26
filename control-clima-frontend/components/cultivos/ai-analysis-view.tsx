'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAnalisisIAActual, fetchHistorialAnalisisIA, generarAnalisisManual } from '@/lib/api/ia-service'
import { LoadingSpinner } from '@/components/ui'
import { Brain, Sparkles, TrendingUp, Droplets, FlaskConical, AlertTriangle, Info, Clock, Calendar, Zap, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ManualAnalysisForm } from './manual-analysis-form'
import { ManualAIAnalysisDto } from '@/lib/types/api'
import { useToast } from '@/providers/toast-provider'

interface AIAnalysisViewProps {
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

export function AIAnalysisView({ cultivoId }: AIAnalysisViewProps) {
    const { user } = useAuth()
    const { showToast } = useToast()
    const queryClient = useQueryClient()
    const [viewMode, setViewMode] = useState<'current' | 'history'>('current')
    const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0)

    const { data: analisisActual, isLoading: loadingActual, isError: errorActual, refetch: refetchActual } = useQuery({
        queryKey: ['ia-analisis-actual', cultivoId],
        queryFn: () => fetchAnalisisIAActual(cultivoId),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
        enabled: viewMode === 'current' && !!user?.modulos?.some(m => m.slug === 'dispositivos')
    })

    const { data: historial = [], isLoading: loadingHistorial, isError: errorHistorial, refetch: refetchHistorial } = useQuery({
        queryKey: ['ia-analisis-historial', cultivoId],
        queryFn: () => fetchHistorialAnalisisIA(cultivoId),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
        enabled: viewMode === 'history'
    })

    const manualAnalysisMutation = useMutation({
        mutationFn: (data: ManualAIAnalysisDto) => generarAnalisisManual(cultivoId, data),
        onSuccess: () => {
            // Once stored, proceed to call the prediction endpoint (GET /ia/analisis/:cultivoId)
            refetchActual()
            queryClient.invalidateQueries({ queryKey: ['ia-analisis-historial', cultivoId] })
            showToast('Datos almacenados. Generando análisis...', 'success')
        },
        onError: (err) => {
            const msg = err instanceof Error ? err.message : 'Error al generar análisis'
            showToast(msg, 'error')
        }
    })

    const handleManualSubmit = (data: ManualAIAnalysisDto) => {
        manualAnalysisMutation.mutate(data)
    }

    const isLoading = viewMode === 'current' ? (loadingActual || manualAnalysisMutation.isPending) : loadingHistorial
    const isError = viewMode === 'current' ? errorActual : errorHistorial

    if (isLoading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-sky-400/20 blur-3xl rounded-full" />
                    <Brain className="w-16 h-16 text-sky-500 animate-pulse relative z-10" />
                </div>
                <LoadingSpinner text="La IA está analizando los datos nutricionales y ambientales..." />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-6 animate-pulse">
                    Consultando con el experto agrónomo virtual
                </p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <AlertTriangle className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-slate-800 mb-2">Error en el análisis</h3>
                <p className="text-slate-500 max-w-sm text-center mb-8">
                    No pudimos conectar con el motor de IA. Por favor, verifica tu conexión o intenta más tarde.
                </p>
                <button
                    onClick={() => viewMode === 'current' ? refetchActual() : refetchHistorial()}
                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
                >
                    Reintentar Análisis
                </button>
            </div>
        )
    }

    const displayData = viewMode === 'current' && analisisActual
        ? {
            snapshot: analisisActual.snapshot,
            analisis: analisisActual.analisis_prediccion,
            fecha: analisisActual.fecha,
            es_cache: analisisActual.es_cache
        }
        : viewMode === 'history' && historial[selectedHistoryIndex]
            ? {
                snapshot: historial[selectedHistoryIndex].snapshot,
                analisis: historial[selectedHistoryIndex].analisis,
                fecha: historial[selectedHistoryIndex].fecha,
                es_cache: false
            }
            : null

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 bg-white rounded-[2rem] border border-slate-200 p-2 shadow-sm w-fit">
                <button
                    onClick={() => setViewMode('current')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all",
                        viewMode === 'current'
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                >
                    <Zap className={cn("w-4 h-4", viewMode === 'current' ? "text-sky-400" : "text-slate-400")} />
                    Análisis Actual
                </button>
                <button
                    onClick={() => setViewMode('history')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all",
                        viewMode === 'history'
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                >
                    <Clock className={cn("w-4 h-4", viewMode === 'history' ? "text-sky-400" : "text-slate-400")} />
                    Historial
                </button>

            </div>

            {
                viewMode === 'current' && !user?.modulos?.some(m => m.slug === 'dispositivos') && !displayData && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <ManualAnalysisForm
                            onSubmit={handleManualSubmit}
                            isLoading={manualAnalysisMutation.isPending}
                        />
                    </div>
                )
            }

            {
                viewMode === 'history' && historial.length > 1 && (
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
                                    onClick={() => setSelectedHistoryIndex(index)}
                                    className={cn(
                                        "flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all",
                                        selectedHistoryIndex === index
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
                )
            }

            {
                viewMode === 'current' && displayData?.es_cache && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-amber-900">Análisis en Caché</p>
                            <p className="text-xs text-amber-700 mt-1">
                                Este análisis fue generado hoy. Solo se genera un nuevo análisis por día.
                            </p>
                        </div>
                    </div>
                )
            }

            {
                !displayData && viewMode === 'current' && (
                    <div className="py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Brain className="w-16 h-16 text-slate-200 mb-4" />
                        <h3 className="text-xl font-black text-slate-800 mb-2">Sin análisis disponible</h3>
                        <p className="text-slate-500 max-w-sm text-center">
                            Aún no se ha generado un análisis predictivo para este cultivo.
                        </p>
                    </div>
                )
            }

            {
                !displayData && viewMode === 'history' && (
                    <div className="py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Clock className="w-16 h-16 text-slate-200 mb-4" />
                        <h3 className="text-xl font-black text-slate-800 mb-2">Sin historial disponible</h3>
                        <p className="text-slate-500 max-w-sm text-center">
                            No hay análisis históricos guardados para este cultivo.
                        </p>
                    </div>
                )
            }

            {
                displayData && (
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
                                            {new Date(displayData.fecha).toLocaleString('es-ES')}
                                        </p>
                                    </div>
                                </div>

                                <div className="prose prose-slate max-w-none relative z-10">
                                    <MarkdownLite content={displayData.analisis} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Contexto del Ciclo
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                        <span className="text-xs font-bold text-slate-500">Cultivo</span>
                                        <span className="text-sm font-black text-slate-800">{displayData.snapshot.cultivo.nombre}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                        <span className="text-xs font-bold text-slate-500">Día de Ciclo</span>
                                        <span className="text-sm font-black text-sky-600">Día {displayData.snapshot.cultivo.dias_ciclo}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                        <span className="text-xs font-bold text-slate-500">Estado</span>
                                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-widest">{displayData.snapshot.cultivo.estado}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-xs font-bold text-slate-500">Sala</span>
                                        <span className="text-sm font-black text-slate-800">{displayData.snapshot.cultivo.sala}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Droplets className="w-4 h-4" />
                                    Parámetros Analizados
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    {displayData.snapshot.nutricion.slice(0, 1).map((riego, idx) => (
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

                                            {displayData.snapshot.cultivo.medio_cultivo && (
                                                <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                                            <Sparkles className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500">Medio de Cultivo</span>
                                                    </div>
                                                    <span className="text-base font-black text-slate-800">{displayData.snapshot.cultivo.medio_cultivo}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

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
                )}
        </div>
    )
}


