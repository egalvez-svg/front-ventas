'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCama, updateCama } from '@/lib/api/camas-service'
import { CreateCamaDto, Cama } from '@/lib/types/api'
import { Plus, Layers, AlignLeft, Grid, Hash, Save } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { useToast } from '@/providers/toast-provider'

interface CreateCamaFormProps {
    salaId: number
    initialData?: Cama
    onSuccess: () => void
    onCancel: () => void
}

export function CreateCamaForm({ salaId, initialData, onSuccess, onCancel }: CreateCamaFormProps) {
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const isEdit = !!initialData

    const [formData, setFormData] = useState<CreateCamaDto>({
        nombre: initialData?.nombre || '',
        descripcion: initialData?.descripcion || '',
        capacidad_plantas: initialData?.capacidad_plantas || 0,
        filas: initialData?.filas || 0,
        columnas: initialData?.columnas || 0,
        salaId: salaId
    })

    const mutation = useMutation({
        mutationFn: (data: CreateCamaDto) =>
            isEdit && initialData
                ? updateCama(initialData.id, data)
                : createCama(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['camas', salaId] })
            if (isEdit) {
                queryClient.invalidateQueries({ queryKey: ['cama', initialData.id] })
            }
            showToast(isEdit ? '¡Superficie actualizada con éxito!' : '¡Superficie creada con éxito!', 'success')
            onSuccess()
        },
        onError: () => {
            showToast(isEdit ? 'Error al actualizar la superficie' : 'Error al crear la superficie', 'error')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutation.mutate(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Nombre */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        Nombre de la Superficie / Cama
                    </label>
                    <input
                        required
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Cama 1, Mesa de Cultivo, Bancal..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                    />
                </div>

                {/* Grid Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-indigo-500" />
                            Capacidad
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.capacidad_plantas}
                            onChange={(e) => setFormData({ ...formData, capacidad_plantas: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Grid className="w-4 h-4 text-indigo-500" />
                            Filas
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.filas}
                            onChange={(e) => setFormData({ ...formData, filas: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Grid className="w-4 h-4 text-indigo-500" />
                            Columnas
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.columnas}
                            onChange={(e) => setFormData({ ...formData, columnas: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                        />
                    </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-indigo-500" />
                        Descripción (Opcional)
                    </label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Ubicación específica, dimensiones o detalles..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium min-h-[100px] text-slate-900"
                    />
                </div>
            </div>

            {mutation.isError && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ErrorMessage
                        title={isEdit ? "No se pudo actualizar la superficie" : "No se pudo crear la superficie"}
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
                    className={`flex-1 px-6 py-3 ${isEdit ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'} text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                    {mutation.isPending
                        ? (isEdit ? 'Guardando...' : 'Creando...')
                        : (isEdit ? 'Guardar Cambios' : 'Crear Superficie')}
                    {!mutation.isPending && (isEdit ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                </button>
            </div>
        </form>
    )
}
