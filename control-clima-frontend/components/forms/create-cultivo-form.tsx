'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCultivo, updateCultivo } from '@/lib/api/cultivos-service'
import { fetchVariedades } from '@/lib/api/catalogos-service'
import { fetchMediosCultivo } from '@/lib/api/medio-cultivo-service'
import { fetchUserSalas } from '@/lib/api/salas-service'
import { fetchCamasBySala } from '@/lib/api/camas-service'
import { CreateCultivoDto, CropStatus, Cultivo } from '@/lib/types/api'
import { Plus, Sprout, Home, Layers, Dna, Calendar, Activity, Hash, AlertCircle, Save, Droplets } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { useToast } from '@/providers/toast-provider'
import { cn } from '@/lib/utils'

interface CreateCultivoFormProps {
    initialData?: Cultivo
    onSuccess: () => void
    onCancel: () => void
}

export function CreateCultivoForm({ initialData, onSuccess, onCancel }: CreateCultivoFormProps) {
    const isEdit = !!initialData
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [formData, setFormData] = useState<CreateCultivoDto>(() => {
        // Robust extraction of variety IDs
        let variedadIds: number[] = []
        if (initialData?.variedadIds && initialData.variedadIds.length > 0) {
            variedadIds = initialData.variedadIds
        } else if (initialData?.variedades && initialData.variedades.length > 0) {
            variedadIds = initialData.variedades.map(v => v.id)
        } else if (initialData?.variedadId) {
            variedadIds = [initialData.variedadId]
        } else if (initialData?.variedad?.id) {
            variedadIds = [initialData.variedad.id]
        }

        return {
            nombre: initialData?.nombre || '',
            fecha_inicio: initialData?.fecha_inicio ? initialData.fecha_inicio.split('T')[0] : new Date().toISOString().split('T')[0],
            estado: (initialData?.estado?.toLowerCase() as CropStatus) || 'vegetativo',
            variedadIds,
            salaId: initialData?.salaId || initialData?.sala?.id || 0,
            camaId: initialData?.camaId || initialData?.cama?.id || 0,
            cantidad_plantas: initialData?.cantidad_plantas || 0,
            medioCultivoId: initialData?.medioCultivoId || 0
        }
    })

    const { data: medios } = useQuery({
        queryKey: ['medios-cultivo'],
        queryFn: fetchMediosCultivo
    })

    const { data: variedades } = useQuery({
        queryKey: ['variedades'],
        queryFn: fetchVariedades
    })

    const { data: salas } = useQuery({
        queryKey: ['salas'],
        queryFn: fetchUserSalas
    })

    const { data: camas } = useQuery({
        queryKey: ['camas', formData.salaId],
        queryFn: () => fetchCamasBySala(formData.salaId),
        enabled: !!formData.salaId
    })

    const selectedCama = camas?.find(c => c.id === formData.camaId)
    const capacityExceeded = selectedCama && (selectedCama.capacidad_plantas || 0) > 0 && formData.cantidad_plantas > (selectedCama.capacidad_plantas || 0)

    const mutation = useMutation({
        mutationFn: (data: CreateCultivoDto) =>
            isEdit ? updateCultivo(initialData.id, data) : createCultivo(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cultivos'] })
            if (isEdit) {
                queryClient.invalidateQueries({ queryKey: ['cultivo', initialData.id] })
            }
            showToast(isEdit ? '¡Cultivo actualizado con éxito!' : '¡Cultivo iniciado con éxito!', 'success')
            onSuccess()
        },
        onError: () => {
            showToast(isEdit ? 'Error al actualizar el cultivo' : 'Error al iniciar el cultivo', 'error')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.variedadIds.length === 0) {
            showToast('Debes seleccionar al menos una variedad', 'error')
            return
        }

        if (capacityExceeded) {
            showToast(`La cantidad de plantas excede la capacidad de la cama (${selectedCama.capacidad_plantas})`, 'error')
            return
        }

        mutation.mutate(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-4">
                {/* Nombre */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-sky-500" />
                        Nombre del Cultivo
                    </label>
                    <input
                        required
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Ciclo Invernal 2024"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900"
                    />
                </div>

                {/* Variedades */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Dna className="w-4 h-4 text-sky-500" />
                        Variedades
                        <span className="text-xs font-normal text-slate-400">(una o más)</span>
                    </label>
                    <div className="max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        {variedades && variedades.length > 0 ? (
                            variedades.map(v => (
                                <label
                                    key={v.id}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer",
                                        formData.variedadIds.includes(v.id)
                                            ? "bg-sky-50 border-sky-200"
                                            : "bg-white border-slate-100 hover:border-sky-200 hover:bg-sky-50/50"
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.variedadIds.includes(v.id)}
                                        onChange={(e) => {
                                            const newIds = e.target.checked
                                                ? [...formData.variedadIds, v.id]
                                                : formData.variedadIds.filter(id => id !== v.id)
                                            setFormData({ ...formData, variedadIds: newIds })
                                        }}
                                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-2 focus:ring-sky-500/20 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0 flex items-baseline gap-2">
                                        <p className={cn(
                                            "font-bold text-sm",
                                            formData.variedadIds.includes(v.id) ? "text-sky-900" : "text-slate-800"
                                        )}>
                                            {v.nombre}
                                        </p>
                                        {v.banco && (
                                            <span className="text-xs text-slate-500">• {v.banco}</span>
                                        )}
                                    </div>
                                </label>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <Dna className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-xs text-slate-500 font-medium">No hay variedades disponibles</p>
                            </div>
                        )}
                    </div>
                    {formData.variedadIds.length === 0 && (
                        <p className="text-xs text-red-500 font-medium">* Selecciona al menos una variedad</p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sala */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Home className="w-4 h-4 text-sky-500" />
                            Sala
                        </label>
                        <select
                            required
                            value={formData.salaId}
                            onChange={(e) => setFormData({ ...formData, salaId: parseInt(e.target.value), camaId: 0 })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900"
                        >
                            <option value="">Selecciona sala</option>
                            {salas?.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Cama */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-sky-500" />
                            Cama
                        </label>
                        <select
                            required
                            value={formData.camaId}
                            onChange={(e) => setFormData({ ...formData, camaId: parseInt(e.target.value) })}
                            disabled={!formData.salaId}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium disabled:opacity-50 text-slate-900"
                        >
                            <option value="">Selecciona cama</option>
                            {camas?.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre} {c.capacidad_plantas ? `(${c.capacidad_plantas} plantas máx)` : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Medio de Cultivo */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-sky-500" />
                        Medio de Cultivo
                    </label>
                    <select
                        required
                        value={formData.medioCultivoId}
                        onChange={(e) => setFormData({ ...formData, medioCultivoId: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900"
                    >
                        <option value="">Selecciona medio de cultivo</option>
                        {medios?.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cantidad de Plantas */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-sky-500" />
                            Cantidad de Plantas
                        </label>
                        <div className="relative">
                            <input
                                required
                                type="number"
                                min="1"
                                value={formData.cantidad_plantas}
                                onChange={(e) => setFormData({ ...formData, cantidad_plantas: parseInt(e.target.value) || 0 })}
                                className={cn(
                                    "w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-900",
                                    capacityExceeded
                                        ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                        : "border-slate-200 focus:ring-sky-500/20 focus:border-sky-500"
                                )}
                            />
                            {capacityExceeded && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                        {selectedCama && (selectedCama.capacidad_plantas || 0) > 0 && (
                            <p className={cn(
                                "text-xs font-bold",
                                capacityExceeded ? "text-red-500" : "text-slate-400"
                            )}>
                                Capacidad disponible: {selectedCama.capacidad_plantas} plantas
                            </p>
                        )}
                    </div>

                    {/* Fecha Inicio */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-sky-500" />
                            Fecha de Inicio
                        </label>
                        <input
                            required
                            type="date"
                            value={formData.fecha_inicio}
                            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900"
                        />
                    </div>
                </div>

                {/* Estado Inicial */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-sky-500" />
                        Estado Inicial
                    </label>
                    <select
                        required
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value as CropStatus })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-900"
                    >
                        <option value="vegetativo">Vegetativo</option>
                        <option value="esqueje">Esqueje</option>
                        <option value="floracion">Floración</option>
                        <option value="cosecha">Cosecha</option>
                    </select>
                </div>
            </div>

            {mutation.isError && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ErrorMessage
                        title={isEdit ? "No se pudo actualizar el cultivo" : "No se pudo iniciar el cultivo"}
                        error={mutation.error}
                    />
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={mutation.isPending || capacityExceeded}
                    className={cn(
                        "flex-1 px-6 py-3 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2",
                        isEdit ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20" : "bg-sky-600 hover:bg-sky-700 shadow-sky-600/20"
                    )}
                >
                    {mutation.isPending
                        ? (isEdit ? 'Guardando...' : 'Iniciando...')
                        : (isEdit ? 'Guardar' : 'Empezar Cultivo')}
                    {!mutation.isPending && (isEdit ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                </button>
            </div>
        </form>
    )
}
