'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import {
    fetchNutricionHistorial,
    deletePlanta,
    deleteNutricion,
    deleteCultivo
} from '@/lib/api/cultivos-service'
import { ejecutarAccionActuador } from '@/lib/api/devices-service'
import { useCultivo } from '@/hooks/use-cultivo'
import { formatLocalDate } from '@/lib/utils/date-utils'
import { LoadingSpinner } from '@/components/ui'
import { DashboardHeader, DeviceCard } from '@/components/dashboard'
import { useAuthContext } from '@/lib/auth/auth-context'
import { useToast } from '@/providers/toast-provider'
import {
    Plus,
    ArrowLeft,
    Sprout,
    Dna,
    Calendar,
    ClipboardList,
    FlaskConical,
    Activity,
    ChevronRight,
    TrendingUp,
    Droplets,
    Grid,
    MapPin,
    AlertCircle,
    Edit2,
    Trash2,
    Layers,
    Beaker,
    FileText,
    Thermometer,
    Sparkles,
    Brain
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { CreatePlantaForm } from '@/components/forms/create-planta-form'
import { CreateNutricionForm } from '@/components/forms/create-nutricion-form'
import { CreateCultivoForm } from '@/components/forms/create-cultivo-form'
import { AIAnalysisView } from '@/components/cultivos/ai-analysis-view'
import { Planta, NutricionSemanal } from '@/lib/types/api'
import type { TimeRange } from '@/lib/utils/mock-sensor-data'

const statusConfig: Record<string, { color: string, bg: string, label: string }> = {
    'activo': { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Activo' },
    'esqueje': { color: 'text-teal-700', bg: 'bg-teal-100', label: 'Esqueje' },
    'vegetativo': { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Vegetativo' },
    'floracion': { color: 'text-purple-700', bg: 'bg-purple-100', label: 'Floración' },
    'cosecha': { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Cosecha' },
    'finalizado': { color: 'text-slate-700', bg: 'bg-slate-100', label: 'Finalizado' },
    'cancelado': { color: 'text-red-700', bg: 'bg-red-100', label: 'Cancelado' },
}

export default function CultivoDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuthContext()
    const id = Number(params.id)
    const [activeTab, setActiveTab] = useState<'info' | 'plantas' | 'nutricion' | 'clima' | 'analisis'>('info')
    const [timeRange, setTimeRange] = useState<TimeRange>('12H')

    // Modal states
    const [isAddPlantaModalOpen, setIsAddPlantaModalOpen] = useState(false)
    const [isEditPlantaModalOpen, setIsEditPlantaModalOpen] = useState(false)
    const [isAddNutricionModalOpen, setIsAddNutricionModalOpen] = useState(false)
    const [isEditNutricionModalOpen, setIsEditNutricionModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const [selectedFila, setSelectedFila] = useState<number | undefined>(undefined)
    const [selectedColumna, setSelectedColumna] = useState<number | undefined>(undefined)
    const [selectedPlanta, setSelectedPlanta] = useState<Planta | null>(null)
    const [selectedNutricion, setSelectedNutricion] = useState<NutricionSemanal | null>(null)

    // Use custom hook for data fetching
    const { cultivo, historialNutricion, isLoading: dataLoading, refetchCultivo } = useCultivo(id)

    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const deletePlantaMutation = useMutation({
        mutationFn: (plantaId: number) => deletePlanta(plantaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cultivo', id] })
            showToast('Planta eliminada correctamente', 'success')
        },
        onError: () => showToast('Error al eliminar la planta', 'error')
    })

    const deleteNutricionMutation = useMutation({
        mutationFn: (logId: number) => deleteNutricion(logId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nutricion', id] })
            showToast('Registro de nutrición eliminado', 'success')
        },
        onError: () => showToast('Error al eliminar el registro', 'error')
    })

    const deleteCultivoMutation = useMutation({
        mutationFn: () => deleteCultivo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cultivos'] })
            showToast('Ciclo de cultivo eliminado', 'success')
            router.push('/cultivos')
        },
        onError: () => showToast('Error al eliminar el ciclo de cultivo', 'error')
    })

    const handleDeleteCultivo = () => {
        if (window.confirm('¿Estás seguro de eliminar este ciclo de cultivo? Esta acción eliminará permanentemente todos los registros y plantas asociados.')) {
            deleteCultivoMutation.mutate()
        }
    }

    const handleDeletePlanta = (planta: Planta) => {
        if (!planta.id) return
        if (window.confirm(`¿Estás seguro de eliminar la planta ${planta.codigo || ''}? Esta acción no se puede deshacer.`)) {
            deletePlantaMutation.mutate(planta.id)
        }
    }

    const handleDeleteNutricion = (logId: number) => {
        if (window.confirm('¿Estás seguro de eliminar este registro de nutrición?')) {
            deleteNutricionMutation.mutate(logId)
        }
    }

    const handleAddPlanta = (r?: number, c?: number) => {
        setSelectedFila(r)
        setSelectedColumna(c)
        setIsAddPlantaModalOpen(true)
    }

    const handleEditPlanta = (planta: Planta) => {
        setSelectedPlanta(planta)
        setIsEditPlantaModalOpen(true)
    }

    const handleEditNutricion = (log: NutricionSemanal) => {
        setSelectedNutricion(log)
        setIsEditNutricionModalOpen(true)
    }

    const handleToggleActuador = async (actuadorId: number, currentState: boolean) => {
        try {
            const accion = currentState ? 'apagar' : 'encender'
            await ejecutarAccionActuador(actuadorId, accion)
            queryClient.invalidateQueries({ queryKey: ['cultivo', id] })
        } catch (error) {
            console.error('Error toggling actuador:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error al controlar el actuador'
            showToast(errorMessage, 'error')
        }
    }

    if (dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <LoadingSpinner size="xl" text="Analizando ciclo de cultivo..." />
            </div>
        )
    }

    if (!cultivo) return null

    // Calcular el último riego
    const ultimoRiego = historialNutricion.length > 0
        ? [...historialNutricion].sort((a, b) =>
            new Date(b.fecha_aplicacion).getTime() - new Date(a.fecha_aplicacion).getTime()
        )[0]
        : null

    // Helper to render the grid
    const renderGrid = () => {
        const rows = cultivo.cama?.filas || 0
        const cols = cultivo.cama?.columnas || 0

        if (rows === 0 || cols === 0) return null

        const grid = []
        for (let r = 1; r <= rows; r++) {
            const rowCells = []
            for (let c = 1; c <= cols; c++) {
                const pos = `${r}-${c}`
                const planta = cultivo.plantas?.find(p => (p.fila === r && p.columna === c) || p.posicion === pos)
                rowCells.push(
                    <div
                        key={pos}
                        onClick={() => planta ? handleEditPlanta(planta) : handleAddPlanta(r, c)}
                        className={cn(
                            "aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer group relative",
                            planta
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-100/50"
                                : "bg-slate-50 border-slate-100 border-dashed hover:border-sky-300 hover:bg-sky-50 text-slate-300 hover:text-sky-500"
                        )}
                    >
                        {planta ? (
                            <>
                                <Sprout className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold uppercase truncate max-w-full px-1">
                                    {planta.codigo || `P-${planta.id}`}
                                </span>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit2 className="w-3 h-3 text-emerald-400" />
                                </div>
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-[8px] font-bold mt-1 uppercase">{pos}</span>
                            </>
                        )}

                        {/* Tooltip for cell info */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold">
                            Fila {r}, Col {c} {planta ? '(Click para editar)' : '(Click para agregar)'}
                        </div>
                    </div>
                )
            }
            grid.push(
                <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                    {rowCells}
                </div>
            )
        }
        return <div className="space-y-3">{grid}</div>
    }

    return (
        <div className="min-h-screen bg-white">
            <DashboardHeader title={`Cultivo: ${cultivo.nombre}`} />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="flex items-start gap-5">
                        <button
                            onClick={() => router.back()}
                            className="mt-1 p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-200 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                {(() => {
                                    const status = statusConfig[cultivo.estado.toLowerCase()] || { color: 'text-sky-700', bg: 'bg-sky-100', label: cultivo.estado };
                                    return (
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                            status.bg,
                                            status.color
                                        )}>
                                            {status.label}
                                        </span>
                                    );
                                })()}
                                <span className="text-slate-400 text-sm flex items-center gap-1.5 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    Iniciado: {formatLocalDate(cultivo.fecha_inicio)}
                                </span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                                {cultivo.nombre}
                            </h1>
                            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                                <Dna className="w-4 h-4 text-sky-500" />
                                {cultivo.variedades && cultivo.variedades.length > 0 ? (
                                    <>
                                        {cultivo.variedades.length > 1 ? (
                                            <span className="text-slate-800 font-bold">{cultivo.variedades.length} Variedades</span>
                                        ) : (
                                            <>
                                                Variedad: <span className="text-slate-800 font-bold">{cultivo.variedades[0].nombre}</span>
                                            </>
                                        )}
                                    </>
                                ) : cultivo.variedad ? (
                                    <>
                                        Variedad: <span className="text-slate-800 font-bold">{cultivo.variedad.nombre}</span>
                                    </>
                                ) : (
                                    <>
                                        Variedad: <span className="text-slate-800 font-bold">General</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            Editar
                        </button>
                        <button
                            onClick={handleDeleteCultivo}
                            disabled={deleteCultivoMutation.isPending}
                            className="px-6 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all shadow-sm flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar Ciclo
                        </button>
                        <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                            Finalizar Ciclo
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-3xl mb-10 shadow-sm w-fit">
                    {[
                        { id: 'info', icon: ClipboardList, label: 'Visión General' },
                        { id: 'plantas', icon: Sprout, label: 'Plantas' },
                        { id: 'nutricion', icon: FlaskConical, label: 'Plan Nutricional' },
                        { id: 'clima', icon: Thermometer, label: 'Clima', slug: 'dispositivos' },
                        { id: 'analisis', icon: Sparkles, label: 'Análisis IA' },
                    ].filter(tab => {
                        if (tab.slug === 'dispositivos') {
                            return user?.modulos?.some(m => m.slug === 'dispositivos')
                        }
                        return true
                    }).map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-sky-400" : "text-slate-400")} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block mb-1">Días de Ciclo</span>
                                    <p className="text-3xl font-black text-slate-900">{cultivo.dias_ciclo}</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                                        <Sprout className="w-6 h-6" />
                                    </div>
                                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block mb-1">Población</span>
                                    <p className="text-3xl font-black text-slate-900">
                                        {cultivo.plantas?.length || 0} / {cultivo.cantidad_plantas || 0}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                                        <Droplets className="w-6 h-6" />
                                    </div>
                                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block mb-1">Último Riego</span>
                                    <p className="text-xl font-black text-slate-900">
                                        {ultimoRiego
                                            ? formatLocalDate(ultimoRiego.fecha_aplicacion, { day: '2-digit', month: '2-digit', year: '2-digit' })
                                            : 'Sin registros'}
                                    </p>
                                </div>
                            </div>

                            {/* Activities or Notes */}
                            <section className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-slate-800">Notas de Cultivo</h2>
                                    <button className="text-sky-600 font-bold flex items-center gap-1 hover:underline">
                                        Añadir nota
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-8">
                                    <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                        <ClipboardList className="w-16 h-16 text-slate-300 mb-4" />
                                        <p className="font-medium text-slate-400">No hay observaciones registradas aún.</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            {/* Variety Detail */}
                            <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Dna className="w-32 h-32" />
                                </div>
                                <h3 className="text-xl font-bold mb-6">Ficha Genética</h3>
                                <div className="space-y-6 relative z-10">
                                    {/* Display varieties */}
                                    <div>
                                        <span className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                                            {cultivo.variedades && cultivo.variedades.length > 1 ? 'Variedades' : 'Variedad'}
                                        </span>
                                        <div className="mt-2 space-y-2">
                                            {cultivo.variedades && cultivo.variedades.length > 0 ? (
                                                cultivo.variedades.map((variedad, index) => (
                                                    <div key={variedad.id || index} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                                                        <p className="text-lg font-bold text-sky-400">{variedad.nombre}</p>
                                                        {variedad.banco && (
                                                            <p className="text-sm text-slate-400 mt-1">Banco: {variedad.banco}</p>
                                                        )}
                                                        {variedad.tipo && (
                                                            <p className="text-xs text-slate-500 mt-1">Tipo: {variedad.tipo}</p>
                                                        )}
                                                    </div>
                                                ))
                                            ) : cultivo.variedad ? (
                                                // Fallback for backward compatibility
                                                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                                                    <p className="text-lg font-bold text-sky-400">{cultivo.variedad.nombre}</p>
                                                    {cultivo.variedad.banco && (
                                                        <p className="text-sm text-slate-400 mt-1">Banco: {cultivo.variedad.banco}</p>
                                                    )}
                                                    {cultivo.variedad.tipo && (
                                                        <p className="text-xs text-slate-500 mt-1">Tipo: {cultivo.variedad.tipo}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-lg font-bold text-sky-400">Seleccionada</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Location Detail */}
                            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-sky-500" />
                                    Ubicación
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block mb-0.5">Sala</span>
                                            <p className="text-base font-bold text-slate-800 leading-tight">{cultivo.sala?.nombre || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block mb-0.5">Cama</span>
                                            <p className="text-base font-bold text-slate-800 leading-tight">
                                                {cultivo.cama?.nombre || 'N/A'}
                                                {cultivo.cama && (
                                                    <span className="text-[10px] text-slate-400 ml-2 font-medium">
                                                        ({cultivo.cama.filas}x{cultivo.cama.columnas})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                            <Droplets className="w-5 h-5 text-sky-500" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none block mb-0.5">Medio de Cultivo</span>
                                            <p className="text-base font-bold text-slate-800 leading-tight">
                                                {cultivo.medioCultivo?.nombre || 'N/D'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'plantas' && (
                    <div className="space-y-8">
                        {/* Grid View */}
                        {(cultivo.cama?.filas || 0) > 0 && (
                            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                                            <Grid className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 leading-tight">Mapa de la Cama</h2>
                                            <p className="text-sm text-slate-400 font-medium">Distribución física de las plantas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                            <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200 border-dashed" />
                                            Libre
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                            <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
                                            Ocupado
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center p-4 bg-slate-50/50 rounded-3xl border border-slate-100">
                                    <div className="w-full max-w-2xl px-2">
                                        {renderGrid()}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Inventory List */}
                        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm min-h-[400px]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 leading-tight">Inventario de Plantas</h2>
                                        <p className="text-sm text-slate-400 font-medium">Lista detallada de ejemplares</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">
                                        {cultivo.plantas?.length || 0} de {cultivo.cantidad_plantas || 0}
                                    </span>
                                    <button
                                        onClick={() => handleAddPlanta()}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Agregar Planta
                                    </button>
                                </div>
                            </div>

                            {cultivo.plantas && cultivo.plantas.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[...cultivo.plantas]
                                        .sort((a, b) => {
                                            if (a.fila !== b.fila) return a.fila - b.fila;
                                            return a.columna - b.columna;
                                        })
                                        .map((planta) => (
                                            <div key={planta.id} className="p-5 border border-slate-100 rounded-2xl bg-white hover:border-emerald-200 hover:bg-emerald-50/20 transition-all group">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-emerald-500 flex items-center justify-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                            <Sprout className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID</span>
                                                            <p className="font-bold text-slate-800 leading-none mt-0.5">{planta.codigo || `PLN-${planta.id}`}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditPlanta(planta)}
                                                            className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePlanta(planta)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 transition-all active:scale-95"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            planta.estado === 'activa' ? "bg-emerald-400" :
                                                                planta.estado === 'cosechada' ? "bg-amber-400" : "bg-red-400"
                                                        )} />
                                                        {planta.estado}
                                                    </div>
                                                    {planta.fila && planta.columna ? (
                                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            Pos: {planta.fila}-{planta.columna}
                                                        </span>
                                                    ) : planta.posicion && (
                                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            Pos: {planta.posicion}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <Sprout className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">Sin plantas registradas</h3>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                        Empieza a registrar las plantas de este ciclo para darles seguimiento individual.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'nutricion' && (
                    <div className="space-y-8">
                        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm min-h-[400px]">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shadow-sm">
                                        <FlaskConical className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 leading-tight">Historial Nutricional</h2>
                                        <p className="text-sm text-slate-400 font-medium">Registros de riego y planes aplicados</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAddNutricionModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                                >
                                    <Plus className="w-5 h-5 text-sky-400" />
                                    Nuevo Registro
                                </button>
                            </div>

                            {dataLoading ? (
                                <div className="py-20 flex justify-center">
                                    <LoadingSpinner text="Cargando historial..." />
                                </div>
                            ) : historialNutricion && historialNutricion.length > 0 ? (
                                <div className="space-y-6">
                                    {historialNutricion.map((log) => (
                                        <div key={log.id} className="relative group">
                                            {/* Línea de tiempo vertical */}
                                            <div className="absolute left-[24px] top-[60px] bottom-[-24px] w-0.5 bg-slate-100 group-last:hidden" />

                                            <div className="flex gap-6">
                                                <div className="relative z-10 w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-sky-200 group-hover:text-sky-500 transition-all shadow-sm">
                                                    {log.tipo_riego === 'nutricion' ? <Beaker className="w-5 h-5" /> :
                                                        log.tipo_riego === 'agua_esquejes' ? <TrendingUp className="w-5 h-5 text-teal-500" /> :
                                                            <Droplets className="w-5 h-5" />}
                                                </div>

                                                <div className="flex-1 bg-slate-50/50 rounded-[2rem] border border-slate-100 p-8 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group/card">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={cn(
                                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                                    log.tipo_riego === 'nutricion' ? "bg-emerald-100 text-emerald-700" :
                                                                        log.tipo_riego === 'agua_esquejes' ? "bg-teal-100 text-teal-700" :
                                                                            log.tipo_riego === 'solo_agua' ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"
                                                                )}>
                                                                    {log.tipo_riego?.replace('_', ' ')}
                                                                </span>
                                                                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                                                                    • Semana {log.semana || '?'}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                                {formatLocalDate(log.fecha_aplicacion, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                            </h3>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleEditNutricion(log)}
                                                                className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover/card:opacity-100"
                                                                title="Editar Registro"
                                                            >
                                                                <Edit2 className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteNutricion(log.id)}
                                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover/card:opacity-100"
                                                                title="Eliminar Registro"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>

                                                            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                                                                <div className="text-center px-4 border-r border-slate-100">
                                                                    <span className="block text-[8px] font-black text-slate-400 uppercase">Litros</span>
                                                                    <span className="text-sm font-black text-slate-700">{log.litros_agua}L</span>
                                                                </div>
                                                                <div className="text-center px-4 border-r border-slate-100">
                                                                    <span className="block text-[8px] font-black text-slate-400 uppercase text-rose-400">pH</span>
                                                                    <span className="text-sm font-black text-slate-700">{log.ph || 'N/A'}</span>
                                                                </div>
                                                                <div className="text-center px-4">
                                                                    <span className="block text-[8px] font-black text-slate-400 uppercase text-amber-500">EC</span>
                                                                    <span className="text-sm font-black text-slate-700">{log.ec || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Productos aplicados */}
                                                    <div className="mt-4 pt-4 border-t border-slate-50">
                                                        <div className="flex flex-wrap gap-2">
                                                            {log.productos && log.productos.length > 0 ? (
                                                                log.productos.map((prod) => (
                                                                    <div key={prod.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-xl border border-sky-100">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                                                        <span className="text-[10px] font-black uppercase tracking-tight">
                                                                            {prod.productoNutricion?.nombre}: {prod.dosis_por_litro} ml/L
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-dashed border-slate-200">
                                                                    Sin productos adicionales
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {log.notas && (
                                                        <div className="flex gap-3 p-4 bg-white/50 border border-slate-100 rounded-2xl italic text-slate-500 text-sm">
                                                            <FileText className="w-4 h-4 text-slate-300 shrink-0" />
                                                            {log.notas}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                                        <FlaskConical className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">Historial Vacío</h3>
                                    <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">
                                        Aún no has registrado ningún evento nutricional para este cultivo. Agrega tu primer riego para empezar el seguimiento.
                                    </p>
                                    <button
                                        onClick={() => setIsAddNutricionModalOpen(true)}
                                        className="mt-8 px-8 py-3 bg-sky-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 active:scale-95"
                                    >
                                        Registrar Primer Riego
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'clima' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <Thermometer className="w-7 h-7 text-sky-500" />
                                Monitoreo de Clima
                            </h2>
                        </div>

                        {cultivo.sala?.dispositivos && cultivo.sala.dispositivos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {cultivo.sala.dispositivos.map((device) => (
                                    <DeviceCard
                                        key={device.id}
                                        device={device}
                                        onToggleActuador={handleToggleActuador}
                                        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['cultivo', id] })}
                                        isRefreshing={dataLoading}
                                        showDetailLink={true}
                                        detailLinkPath={`/dispositivos/${device.id}`}
                                        timeRange={timeRange}
                                        onTimeRangeChange={setTimeRange}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Thermometer className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Sin dispositivos climáticos</h3>
                                <p className="text-slate-500">No hay dispositivos vinculados a esta sala para el monitoreo.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'analisis' && (
                    <AIAnalysisView cultivoId={id} />
                )}
            </div>

            {/* Modal para Registrar/Editar Planta */}
            <Modal
                isOpen={isAddPlantaModalOpen || isEditPlantaModalOpen}
                onClose={() => {
                    setIsAddPlantaModalOpen(false)
                    setIsEditPlantaModalOpen(false)
                    setSelectedFila(undefined)
                    setSelectedColumna(undefined)
                    setSelectedPlanta(null)
                }}
                title={isEditPlantaModalOpen ? "Editar Información de Planta" : "Registrar Nueva Planta"}
            >
                {!isEditPlantaModalOpen && (
                    <div className="mb-6 p-4 bg-emerald-50 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-emerald-800">Ubicación Estratégica</p>
                            <p className="text-xs text-emerald-600">
                                Registrar plantas con su posición exacta permite un control preciso de su crecimiento y salud.
                            </p>
                        </div>
                    </div>
                )}
                <CreatePlantaForm
                    cultivoId={id}
                    variedades={cultivo.variedades || (cultivo.variedad ? [cultivo.variedad] : [])}
                    initialData={selectedPlanta || undefined}
                    fila={selectedFila}
                    columna={selectedColumna}
                    maxFilas={cultivo.cama?.filas}
                    maxColumnas={cultivo.cama?.columnas}
                    onSuccess={() => {
                        setIsAddPlantaModalOpen(false)
                        setIsEditPlantaModalOpen(false)
                        setSelectedFila(undefined)
                        setSelectedColumna(undefined)
                        setSelectedPlanta(null)
                    }}
                    onCancel={() => {
                        setIsAddPlantaModalOpen(false)
                        setIsEditPlantaModalOpen(false)
                        setSelectedFila(undefined)
                        setSelectedColumna(undefined)
                        setSelectedPlanta(null)
                    }}
                />
            </Modal>

            {/* Modal para Registro Nutricional */}
            <Modal
                isOpen={isAddNutricionModalOpen}
                onClose={() => setIsAddNutricionModalOpen(false)}
                title="Nuevo Registro de Riego y Nutrición"
                maxWidth="4xl"
            >
                <div className="mb-8 p-6 bg-sky-50 rounded-[2rem] border border-sky-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-sky-600 shadow-sm border border-sky-100 shrink-0">
                        <Beaker className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-base font-black text-sky-900 leading-tight mb-1">Control de Precisión</p>
                        <p className="text-sm text-sky-600 font-medium leading-relaxed">
                            Registra los parámetros de pH y EC para optimizar la biodisponibilidad de nutrientes y prevenir bloqueos.
                        </p>
                    </div>
                </div>
                <CreateNutricionForm
                    cultivoId={id}
                    onSuccess={() => {
                        setIsAddNutricionModalOpen(false)
                        queryClient.invalidateQueries({ queryKey: ['nutricion', id] })
                    }}
                    onCancel={() => setIsAddNutricionModalOpen(false)}
                />
            </Modal>

            {/* Modal para Editar Nutrición */}
            <Modal
                isOpen={isEditNutricionModalOpen}
                onClose={() => {
                    setIsEditNutricionModalOpen(false)
                    setSelectedNutricion(null)
                }}
                title="Editar Registro de Riego y Nutrición"
                maxWidth="4xl"
            >
                <div className="mb-8 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 shrink-0">
                        <Edit2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-base font-black text-indigo-900 leading-tight mb-1">Modificación Técnica</p>
                        <p className="text-sm text-indigo-600 font-medium leading-relaxed">
                            Ajusta los valores históricos del riego o la mezcla de productos utilizada.
                        </p>
                    </div>
                </div>
                <CreateNutricionForm
                    cultivoId={id}
                    initialData={selectedNutricion}
                    onSuccess={() => {
                        setIsEditNutricionModalOpen(false)
                        setSelectedNutricion(null)
                        queryClient.invalidateQueries({ queryKey: ['nutricion', id] })
                    }}
                    onCancel={() => {
                        setIsEditNutricionModalOpen(false)
                        setSelectedNutricion(null)
                    }}
                />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Editar Ciclo de Cultivo"
            >
                <CreateCultivoForm
                    initialData={cultivo}
                    onSuccess={() => {
                        setIsEditModalOpen(false)
                        queryClient.invalidateQueries({ queryKey: ['cultivo', id] })
                    }}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            </Modal>
        </div>
    )
}
