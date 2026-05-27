'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { fetchNutricionHistorial, deletePlanta, deleteNutricion } from '@/lib/api/cultivos-service'
import { useToggleActuador } from '@/hooks/use-actuadores'
import { useCama } from '@/hooks/use-cama'
import { LoadingSpinner } from '@/components/ui'
import { DashboardHeader, DeviceCard } from '@/components/dashboard'
import { useAuthContext } from '@/lib/auth/auth-context'
import { useToast } from '@/providers/toast-provider'
import { formatLocalDate } from '@/lib/utils/date-utils'
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
import { Planta, NutricionSemanal, Cultivo } from '@/lib/types/api'
import type { TimeRange } from '@/lib/utils/mock-sensor-data'
import { AIAnalysisHistoryView } from '../../../components/cultivos/ai-analysis-history-view'

export default function CamaDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params.id)
    const { user } = useAuthContext()
    const [activeTab, setActiveTab] = useState<'nutricion' | 'plantas' | 'info' | 'clima' | 'analisis'>('nutricion')
    const [timeRange, setTimeRange] = useState<TimeRange>('12H')
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    // Modal states
    const [isAddPlantaModalOpen, setIsAddPlantaModalOpen] = useState(false)
    const [isEditPlantaModalOpen, setIsEditPlantaModalOpen] = useState(false)
    const [isAddNutricionModalOpen, setIsAddNutricionModalOpen] = useState(false)
    const [isEditNutricionModalOpen, setIsEditNutricionModalOpen] = useState(false)

    const [selectedFila, setSelectedFila] = useState<number | undefined>(undefined)
    const [selectedColumna, setSelectedColumna] = useState<number | undefined>(undefined)
    const [selectedPlanta, setSelectedPlanta] = useState<Planta | null>(null)
    const [selectedNutricion, setSelectedNutricion] = useState<NutricionSemanal | null>(null)

    // 1 & 2. Fetch Cama and active crop using custom hook
    const { cama, cultivoActivo, dispositivos, isLoading: dataLoading, salaId } = useCama(id)

    const { data: historialNutricion = [], isLoading: nutricionLoading } = useQuery({
        queryKey: ['nutricion', cultivoActivo?.id],
        queryFn: () => fetchNutricionHistorial(cultivoActivo!.id),
        enabled: !!cultivoActivo?.id && activeTab === 'nutricion'
    })

    const deletePlantaMutation = useMutation({
        mutationFn: (plantaId: number) => deletePlanta(plantaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cama', id] })
            queryClient.invalidateQueries({ queryKey: ['cultivos-sala', salaId] })
            showToast('Planta eliminada correctamente', 'success')
        },
        onError: () => showToast('Error al eliminar la planta', 'error')
    })

    const deleteNutricionMutation = useMutation({
        mutationFn: (logId: number) => deleteNutricion(logId, cultivoActivo!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nutricion', cultivoActivo?.id] })
            showToast('Registro de nutrición eliminado', 'success')
        },
        onError: () => showToast('Error al eliminar el registro', 'error')
    })

    const handleDeletePlanta = (planta: Planta) => {
        if (!planta.id) return
        if (window.confirm('¿Estás seguro de eliminar esta planta?')) {
            deletePlantaMutation.mutate(planta.id)
        }
    }

    const handleDeleteNutricion = (logId: number) => {
        if (window.confirm('¿Estás seguro de eliminar este registro de nutrición?')) {
            deleteNutricionMutation.mutate(logId)
        }
    }

    const handleCellClick = (fila: number, columna: number, planta?: Planta) => {
        if (planta) {
            handleEditPlanta(planta)
        } else {
            setSelectedFila(fila)
            setSelectedColumna(columna)
            setIsAddPlantaModalOpen(true)
        }
    }

    const handleEditPlanta = (planta: Planta) => {
        setSelectedPlanta(planta)
        setIsEditPlantaModalOpen(true)
    }

    const handleEditNutricion = (log: NutricionSemanal) => {
        setSelectedNutricion(log)
        setIsEditNutricionModalOpen(true)
    }

    const toggleActuadorMutation = useToggleActuador()

    const handleToggleActuador = async (actuadorId: number, currentState: boolean) => {
        const accion = currentState ? 'apagar' : 'encender'
        toggleActuadorMutation.mutate({ actuadorId, accion }, {
            onError: (error) => {
                console.error('Error toggling actuador:', error)
                const errorMessage = error instanceof Error ? error.message : 'Error al controlar el actuador'
                showToast(errorMessage, 'error')
            }
        })
    }

    if (dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <LoadingSpinner size="xl" text="Cargando detalles de la cama..." />
            </div>
        )
    }

    if (!cama) return null

    const renderGrid = () => {
        if (!cama.filas || !cama.columnas) return null
        const grid = []
        for (let r = 1; r <= cama.filas; r++) {
            const row = []
            for (let c = 1; c <= cama.columnas; c++) {
                const planta = cultivoActivo?.plantas?.find(p =>
                    (p.fila === r && p.columna === c) || p.posicion === `${r}-${c}`
                )
                row.push(
                    <div
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c, planta)}
                        className={cn(
                            "aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer relative group",
                            planta
                                ? "bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100"
                                : "bg-slate-50 border-slate-100 border-dashed hover:border-sky-300 hover:bg-sky-50/50"
                        )}
                    >
                        {planta ? (
                            <>
                                <Sprout className="w-1/2 h-1/2 text-emerald-500 mb-1" />
                                <span className="text-[8px] font-black text-emerald-700 uppercase tracking-tighter text-center px-1">
                                    {planta.codigo || `P-${planta.id}`}
                                </span>
                                <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeletePlanta(planta); }}
                                        className="p-1 bg-white rounded-md shadow-sm text-rose-500 hover:bg-rose-50"
                                    >
                                        <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Plus className="w-1/3 h-1/3 text-slate-300 group-hover:text-sky-400" />
                        )}
                        <span className="absolute bottom-1 right-1.5 text-[7px] font-bold text-slate-300">
                            {r}:{c}
                        </span>
                    </div>
                )
            }
            grid.push(<div key={r} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cama.columnas}, minmax(0, 1fr))` }}>{row}</div>)
        }
        return <div className="space-y-2">{grid}</div>
    }

    return (
        <div className="min-h-screen bg-white">
            <DashboardHeader title={`${cama.nombre}`} />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-200 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1 font-bold uppercase tracking-widest">
                                <Layers className="w-4 h-4" />
                                <span>{cama.sala?.nombre || 'Sala'}</span>
                                <ChevronRight className="w-4 h-4" />
                                <span>{cama.nombre}</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                {cama.nombre}
                                {cultivoActivo && (
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-200">
                                        {cultivoActivo.estado}
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>

                    {cultivoActivo && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setActiveTab('nutricion')}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Activity className="w-5 h-5 text-indigo-500" />
                                Estado Vital
                            </button>
                            {/* <button
                                onClick={() => setIsAddNutricionModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                            >
                                <Droplets className="w-5 h-5" />
                                Nuevo Riego
                            </button> */}
                        </div>
                    )}
                </div>

                {cultivoActivo ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar Left: Crop Info */}
                        <div className="lg:col-span-3 space-y-6">
                            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800">Cultivo Actual</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre del Ciclo</span>
                                        <p className="text-slate-900 font-bold">{cultivoActivo.nombre}</p>
                                    </div>

                                    <div className="p-4 rounded-3xl bg-indigo-50/50 border border-indigo-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Dna className="w-4 h-4 text-indigo-500" />
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                                {cultivoActivo.variedades && cultivoActivo.variedades.length > 1 ? 'Variedades' : 'Variedad'}
                                            </span>
                                        </div>
                                        <p className="text-indigo-900 font-bold">
                                            {cultivoActivo.variedades && cultivoActivo.variedades.length > 0
                                                ? cultivoActivo.variedades.map(v => v.nombre).join(', ')
                                                : cultivoActivo.variedad?.nombre || 'General'
                                            }
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100 text-center">
                                            <Calendar className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                                            <span className="text-[9px] font-black text-emerald-400 uppercase block tracking-widest mb-1">Día de Ciclo</span>
                                            <p className="text-emerald-900 font-black text-2xl">{cultivoActivo.dias_ciclo || 0}</p>
                                        </div>
                                        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-100 text-center">
                                            <Sprout className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                                            <span className="text-[9px] font-black text-amber-400 uppercase block tracking-widest mb-1">Plantas</span>
                                            <p className="text-amber-900 font-black text-2xl">{cultivoActivo.plantas?.length || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <nav className="bg-white rounded-[2.5rem] border border-slate-200 p-3 shadow-sm flex flex-col gap-2">
                                <button
                                    onClick={() => setActiveTab('nutricion')}
                                    className={cn(
                                        "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all",
                                        activeTab === 'nutricion' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <Activity className="w-5 h-5" />
                                    Historial Nutricional
                                </button>
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={cn(
                                        "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all",
                                        activeTab === 'info' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <ClipboardList className="w-5 h-5" />
                                    Vista General
                                </button>
                                <button
                                    onClick={() => setActiveTab('plantas')}
                                    className={cn(
                                        "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all",
                                        activeTab === 'plantas' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <Grid className="w-5 h-5" />
                                    Mapa de Plantas
                                </button>

                                {user?.modulos?.some(m => m.slug === 'dispositivos') && (
                                    <>
                                        <button
                                            onClick={() => setActiveTab('clima')}
                                            className={cn(
                                                "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all",
                                                activeTab === 'clima' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-500 hover:bg-slate-50"
                                            )}
                                        >
                                            <Thermometer className="w-5 h-5" />
                                            Clima
                                        </button>

                                    </>
                                )}
                                <button
                                    onClick={() => setActiveTab('analisis')}
                                    className={cn(
                                        "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all",
                                        activeTab === 'analisis' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Análisis IA
                                </button>
                            </nav>
                        </div>

                        {/* Main Interaction Area */}
                        <div className="lg:col-span-9">
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                                <FileText className="w-7 h-7 text-sky-500" />
                                                Detalles del Ciclo
                                            </h2>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-6">
                                                    <div>
                                                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Fecha de Inicio</span>
                                                        <div className="flex items-center gap-4 text-slate-700 font-bold text-lg">
                                                            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                                                                <Calendar className="w-6 h-6" />
                                                            </div>
                                                            {formatLocalDate(cultivoActivo.fecha_inicio)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 text-sky-600">
                                                <MapPin className="w-5 h-5" />
                                                Ubicación en Grid
                                            </h3>
                                            <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                                                <span className="text-slate-500 font-bold italic">Configuración de Cama:</span>
                                                <span className="font-black text-slate-900">{cama.filas} Filas x {cama.columnas} Columnas</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'plantas' && (
                                <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
                                    <div className="flex items-center justify-between mb-10">
                                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                            <Grid className="w-7 h-7 text-indigo-500" />
                                            Inventario Visual
                                        </h2>
                                        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase px-3">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" /> Ocupado
                                            </span>
                                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase px-3">
                                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Disponible
                                            </span>
                                        </div>
                                    </div>
                                    <div className="max-w-2xl mx-auto py-10">
                                        {renderGrid()}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'nutricion' && (
                                <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
                                    <div className="flex items-center justify-between mb-10">
                                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                            <FlaskConical className="w-7 h-7 text-amber-500" />
                                            Historial Nutricional
                                        </h2>
                                        <button
                                            onClick={() => setIsAddNutricionModalOpen(true)}
                                            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Nuevo Registro
                                        </button>
                                    </div>

                                    {nutricionLoading ? (
                                        <div className="py-20 flex justify-center"><LoadingSpinner text="Recuperando fórmulas..." /></div>
                                    ) : historialNutricion.length > 0 ? (
                                        <div className="relative space-y-8 before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                            {historialNutricion.sort((a, b) => new Date(b.fecha_aplicacion).getTime() - new Date(a.fecha_aplicacion).getTime()).map((log) => (
                                                <div key={log.id} className="relative pl-20 group">
                                                    <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-white border-4 border-indigo-500 z-10 ring-4 ring-indigo-50 group-hover:scale-125 transition-transform" />
                                                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-white shadow-sm hover:border-indigo-200 transition-all">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                            <div>
                                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Aplicación de {log.tipo_riego}</span>
                                                                <h4 className="text-xl font-black text-slate-800">{formatLocalDate(log.fecha_aplicacion)}</h4>
                                                            </div>
                                                            <div className="flex items-center gap-3 self-start">
                                                                <span className="px-4 py-1.5 bg-white text-slate-600 rounded-full text-xs font-black shadow-sm border border-slate-100 uppercase tracking-widest">
                                                                    Semana {log.semana}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleEditNutricion(log)}
                                                                    className="p-2.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                                                                >
                                                                    <Edit2 className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteNutricion(log.id)}
                                                                    className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                                            <div className="p-4 bg-white rounded-3xl border border-slate-100">
                                                                <span className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Solución Total</span>
                                                                <p className="text-slate-900 font-bold flex items-center gap-2">
                                                                    <Droplets className="w-4 h-4 text-sky-400" />
                                                                    {log.litros_agua} Litros
                                                                </p>
                                                            </div>
                                                            <div className="p-4 bg-white rounded-3xl border border-slate-100">
                                                                <span className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Potencial H+</span>
                                                                <p className="text-slate-900 font-bold flex items-center gap-2">
                                                                    <Beaker className="w-4 h-4 text-amber-500" />
                                                                    {log.ph} pH
                                                                </p>
                                                            </div>
                                                            <div className="p-4 bg-white rounded-3xl border border-slate-100">
                                                                <span className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Cond. Elect.</span>
                                                                <p className="text-slate-900 font-bold flex items-center gap-2">
                                                                    <Activity className="w-4 h-4 text-emerald-500" />
                                                                    {log.ec} EC
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Productos aplicados */}
                                                        <div className="mt-4 pt-4 border-t border-slate-50">
                                                            <div className="flex flex-wrap gap-2">
                                                                {log.productos && log.productos.length > 0 ? (
                                                                    log.productos.map((prod) => (
                                                                        <div key={prod.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
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
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                                <Activity className="w-10 h-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">Sin registros técnicos</h3>
                                            <p className="text-slate-500">Inicia el historial de nutrición para este cultivo.</p>
                                        </div>
                                    )}
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
                                    {dispositivos.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {dispositivos.map((device: any) => (
                                                <DeviceCard
                                                    key={device.id}
                                                    device={device}
                                                    onToggleActuador={handleToggleActuador}
                                                    onRefresh={() => {
                                                        queryClient.invalidateQueries({ queryKey: ['cama', id] })
                                                        queryClient.invalidateQueries({ queryKey: ['sala', cama?.salaId] })
                                                    }}
                                                    isRefreshing={dataLoading}
                                                    showDetailLink={true}
                                                    detailLinkPath={`/dispositivos/${device.id}`}
                                                    timeRange={timeRange}
                                                    onTimeRangeChange={setTimeRange}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        < div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <Thermometer className="w-10 h-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">Sin dispositivos climáticos</h3>
                                            <p className="text-slate-500">No hay dispositivos vinculados a esta sala para el monitoreo.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'analisis' && cultivoActivo && (
                                <AIAnalysisHistoryView cultivoId={cultivoActivo.id} />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center max-w-4xl mx-auto shadow-sm">
                        <div className="w-32 h-32 bg-indigo-50 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-indigo-100 rotate-3">
                            <Sprout className="w-16 h-16" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Cama en Espera</h3>
                        <p className="text-slate-500 text-xl max-w-lg mx-auto leading-relaxed">
                            No hay un ciclo de cultivo activo para esta cama en este momento.
                            ¿Quieres empezar una nueva producción?
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                            <button
                                onClick={() => router.push(`/cultivos?new=true&salaId=${cama.salaId}&camaId=${id}`)}
                                className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 flex items-center gap-3 group"
                            >
                                Iniciar Nuevo Ciclo
                                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                            >
                                Regresar a la Sala
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {
                cultivoActivo && (
                    <>
                        <Modal
                            isOpen={isAddPlantaModalOpen}
                            onClose={() => {
                                setIsAddPlantaModalOpen(false)
                                setSelectedFila(undefined)
                                setSelectedColumna(undefined)
                            }}
                            title="Agregar Planta"
                        >
                            <CreatePlantaForm
                                cultivoId={cultivoActivo.id}
                                fila={selectedFila}
                                columna={selectedColumna}
                                maxFilas={cama.filas}
                                maxColumnas={cama.columnas}
                                onSuccess={() => {
                                    setIsAddPlantaModalOpen(false)
                                    setSelectedFila(undefined)
                                    setSelectedColumna(undefined)
                                    queryClient.invalidateQueries({ queryKey: ['cultivos-sala', cama.salaId] })
                                }}
                                onCancel={() => {
                                    setIsAddPlantaModalOpen(false)
                                    setSelectedFila(undefined)
                                    setSelectedColumna(undefined)
                                }}
                                variedades={cultivoActivo.variedades || (cultivoActivo.variedad ? [cultivoActivo.variedad] : [])}
                            />
                        </Modal>

                        <Modal
                            isOpen={isEditPlantaModalOpen}
                            onClose={() => {
                                setIsEditPlantaModalOpen(false)
                                setSelectedPlanta(null)
                            }}
                            title="Editar Planta"
                        >
                            <CreatePlantaForm
                                cultivoId={cultivoActivo.id}
                                variedades={cultivoActivo.variedades || (cultivoActivo.variedad ? [cultivoActivo.variedad] : [])}
                                initialData={selectedPlanta || undefined}
                                onSuccess={() => {
                                    setIsEditPlantaModalOpen(false)
                                    setSelectedPlanta(null)
                                    queryClient.invalidateQueries({ queryKey: ['cultivos-sala', cama.salaId] })
                                }}
                                onCancel={() => {
                                    setIsEditPlantaModalOpen(false)
                                    setSelectedPlanta(null)
                                }}
                            />
                        </Modal>

                        <Modal
                            isOpen={isAddNutricionModalOpen}
                            onClose={() => setIsAddNutricionModalOpen(false)}
                            title="Registrar Aplicación Nutricional"
                            maxWidth="4xl"
                        >
                            <CreateNutricionForm
                                cultivoId={cultivoActivo.id}
                                onSuccess={() => {
                                    setIsAddNutricionModalOpen(false)
                                    queryClient.invalidateQueries({ queryKey: ['nutricion', cultivoActivo.id] })
                                }}
                                onCancel={() => setIsAddNutricionModalOpen(false)}
                            />
                        </Modal>

                        <Modal
                            isOpen={isEditNutricionModalOpen}
                            onClose={() => {
                                setIsEditNutricionModalOpen(false)
                                setSelectedNutricion(null)
                            }}
                            title="Editar Aplicación Nutricional"
                            maxWidth="4xl"
                        >
                            <CreateNutricionForm
                                cultivoId={cultivoActivo.id}
                                initialData={selectedNutricion}
                                onSuccess={() => {
                                    setIsEditNutricionModalOpen(false)
                                    setSelectedNutricion(null)
                                    queryClient.invalidateQueries({ queryKey: ['nutricion', cultivoActivo.id] })
                                }}
                                onCancel={() => {
                                    setIsEditNutricionModalOpen(false)
                                    setSelectedNutricion(null)
                                }}
                            />
                        </Modal>
                    </>
                )
            }
        </div >
    )
}
