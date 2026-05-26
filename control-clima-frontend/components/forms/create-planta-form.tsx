'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addPlantaToCultivo, updatePlanta } from '@/lib/api/cultivos-service'
import { CreatePlantaDto, Planta } from '@/lib/types/api'
import { Plus, Sprout, Hash, MapPin, Calendar, AlignLeft, Activity, Save } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { useToast } from '@/providers/toast-provider'
import { cn } from '@/lib/utils'
import type { Variedad } from '@/lib/types/api'

interface CreatePlantaFormProps {
    cultivoId: number
    variedades: Variedad[] // Available varieties for the cultivo
    initialData?: Planta
    fila?: number
    columna?: number
    maxFilas?: number
    maxColumnas?: number
    onSuccess: () => void
    onCancel: () => void
}

export function CreatePlantaForm({
    cultivoId,
    variedades,
    initialData,
    fila,
    columna,
    maxFilas,
    maxColumnas,
    onSuccess,
    onCancel
}: CreatePlantaFormProps) {
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const isEdit = !!initialData

    // New state for variety selection and code generation
    const [variedadId, setVariedadId] = useState<number | undefined>(initialData?.variedadId)
    const [numeroSecuencial, setNumeroSecuencial] = useState('')

    // Bulk Mode states
    const [isBulkMode, setIsBulkMode] = useState(false)
    const [bulkCount, setBulkCount] = useState(1)
    const [bulkDirection, setBulkDirection] = useState<'horizontal' | 'vertical'>('horizontal')

    // Using strings for inputs to allow free typing
    const [filaStr, setFilaStr] = useState((initialData?.fila || fila || 1).toString())
    const [columnaStr, setColumnaStr] = useState((initialData?.columna || columna || 1).toString())
    const [estado, setEstado] = useState<'activa' | 'removida' | 'cosechada'>(initialData?.estado || 'activa')
    const [fechaPlantacion, setFechaPlantacion] = useState(initialData?.fecha_plantacion ? new Date(initialData.fecha_plantacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    const [notas, setNotas] = useState(initialData?.notas || '')

    // Auto-generate codigo from variety prefix + sequential number
    const selectedVariedad = variedades.find(v => v.id === variedadId)
    const prefijo = selectedVariedad?.nombre.substring(0, 2).toUpperCase() || ''
    const numeroFormateado = (n: number | string) => n.toString().padStart(3, '0')
    const codigoGenerado = prefijo && numeroSecuencial ? `${prefijo}${numeroFormateado(numeroSecuencial)}` : ''

    const mutation = useMutation({
        mutationFn: async (data: CreatePlantaDto | CreatePlantaDto[]) => {
            if (Array.isArray(data)) {
                // Execute sequentially to avoid race conditions on sequential IDs if any, 
                // and to allow the user to see progress if we wanted (though here it's all at once)
                const results = []
                for (const plant of data) {
                    const res = await addPlantaToCultivo(cultivoId, plant)
                    results.push(res)
                }
                return results
            } else if (isEdit && initialData) {
                return updatePlanta(initialData.id, data)
            } else {
                return addPlantaToCultivo(cultivoId, data)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cultivo', cultivoId] })
            queryClient.invalidateQueries({ queryKey: ['plantas', cultivoId] })
            if (isEdit) {
                queryClient.invalidateQueries({ queryKey: ['planta', initialData.id] })
            }
            showToast(
                isEdit
                    ? '¡Planta actualizada con éxito!'
                    : (isBulkMode ? `¡${bulkCount} plantas registradas con éxito!` : '¡Planta registrada con éxito!'),
                'success'
            )
            onSuccess()
        },
        onError: (error: any) => {
            showToast(isEdit ? 'Error al actualizar la planta' : 'Error al registrar la planta', 'error')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (isBulkMode && !isEdit) {
            const startFila = parseInt(filaStr) || 1
            const startCol = parseInt(columnaStr) || 1
            const startNum = parseInt(numeroSecuencial) || 1
            const plants: CreatePlantaDto[] = []

            for (let i = 0; i < bulkCount; i++) {
                const currentFila = bulkDirection === 'vertical' ? startFila + i : startFila
                const currentCol = bulkDirection === 'horizontal' ? startCol + i : startCol

                // Basic bounds check if max values are provided
                if (maxFilas && currentFila > maxFilas) continue
                if (maxColumnas && currentCol > maxColumnas) continue

                plants.push({
                    codigo: prefijo ? `${prefijo}${numeroFormateado(startNum + i)}` : '',
                    fila: currentFila,
                    columna: currentCol,
                    estado,
                    fecha_plantacion: fechaPlantacion,
                    notas,
                    variedadId
                })
            }

            if (plants.length === 0) {
                showToast('No se pudieron posicionar las plantas dentro de los límites de la cama', 'error')
                return
            }

            mutation.mutate(plants)
        } else {
            mutation.mutate({
                codigo: codigoGenerado,
                fila: parseInt(filaStr) || 1,
                columna: parseInt(columnaStr) || 1,
                estado,
                fecha_plantacion: fechaPlantacion,
                notas,
                variedadId
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Bulk Mode Toggle */}
                {!isEdit && (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-900">Modo Masivo</p>
                                <p className="text-[10px] text-emerald-600 font-medium">Registrar varias plantas a la vez</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsBulkMode(!isBulkMode)}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                                isBulkMode ? "bg-emerald-600" : "bg-slate-200"
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    isBulkMode ? "translate-x-6" : "translate-x-1"
                                )}
                            />
                        </button>
                    </div>
                )}

                {/* Variety Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-emerald-500" />
                        Variedad
                    </label>
                    <select
                        required
                        value={variedadId || ''}
                        onChange={(e) => setVariedadId(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
                    >
                        <option value="">Selecciona variedad</option>
                        {variedades.map(v => (
                            <option key={v.id} value={v.id}>{v.nombre}</option>
                        ))}
                    </select>
                </div>

                {isBulkMode && !isEdit && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Cantidad</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={bulkCount}
                                onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Dirección</label>
                            <select
                                value={bulkDirection}
                                onChange={(e) => setBulkDirection(e.target.value as any)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="horizontal">Horizontal (→)</option>
                                <option value="vertical">Vertical (↓)</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                    {/* Prefijo (auto-generated) */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-emerald-500" />
                            Prefijo
                        </label>
                        <input
                            type="text"
                            value={prefijo}
                            readOnly
                            placeholder="--"
                            className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 text-center"
                        />
                    </div>

                    {/* Número Secuencial */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-emerald-500" />
                            {isBulkMode ? 'Inicio' : 'Número'}
                        </label>
                        <input
                            required
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={numeroSecuencial}
                            onChange={(e) => {
                                if (e.target.value === '' || /^[0-9]*$/.test(e.target.value)) {
                                    setNumeroSecuencial(e.target.value)
                                }
                            }}
                            placeholder="1"
                            maxLength={3}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900 text-center"
                        />
                    </div>

                    {/* Código Generado / preview */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-emerald-500" />
                            Código
                        </label>
                        <input
                            type="text"
                            value={isBulkMode ? `${prefijo}...` : codigoGenerado}
                            readOnly
                            placeholder="..."
                            className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-700 text-center"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fecha Plantación */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-500" />
                            Fecha de Plantación
                        </label>
                        <input
                            required
                            type="date"
                            value={fechaPlantacion}
                            onChange={(e) => setFechaPlantacion(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
                        />
                    </div>

                    {/* Estado */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            Estado
                        </label>
                        <select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value as any)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
                        >
                            <option value="activa">Activa</option>
                            <option value="removida">Removida</option>
                            <option value="cosechada">Cosechada</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fila */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-500" />
                            {isBulkMode ? 'Fila Inicial' : 'Fila'}
                        </label>
                        <input
                            required
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={filaStr}
                            onChange={(e) => {
                                if (e.target.value === '' || /^[0-9]*$/.test(e.target.value)) {
                                    setFilaStr(e.target.value)
                                }
                            }}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
                        />
                    </div>

                    {/* Columna */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-500" />
                            {isBulkMode ? 'Columna Inicial' : 'Columna'}
                        </label>
                        <input
                            required
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={columnaStr}
                            onChange={(e) => {
                                if (e.target.value === '' || /^[0-9]*$/.test(e.target.value)) {
                                    setColumnaStr(e.target.value)
                                }
                            }}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
                        />
                    </div>
                </div>

                {/* Notas */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-emerald-500" />
                        Notas (Opcional)
                    </label>
                    <textarea
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        placeholder="Observaciones sobre la planta..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[80px] text-slate-900"
                    />
                </div>
            </div>

            {mutation.isError && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ErrorMessage
                        title={isEdit ? "No se pudo actualizar la planta" : "No se pudo registrar la planta"}
                        error={mutation.error}
                    />
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {mutation.isPending ? 'Guardando...' : (isEdit ? 'Guardar' : (isBulkMode ? 'Registrar Plantas' : 'Registrar Planta'))}
                    {!mutation.isPending && (isEdit ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                </button>
            </div>
        </form>
    )
}
