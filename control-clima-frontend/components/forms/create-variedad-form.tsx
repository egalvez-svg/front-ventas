'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createVariedad, updateVariedad } from '@/lib/api/catalogos-service'
import { CreateVariedadDto, Variedad } from '@/lib/types/api'
import { Plus, Dna, AlignLeft, Bookmark, Tag, Save } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { useToast } from '@/providers/toast-provider'

interface CreateVariedadFormProps {
    onSuccess: () => void
    onCancel: () => void
    initialData?: Variedad | null
}

export function CreateVariedadForm({ onSuccess, onCancel, initialData }: CreateVariedadFormProps) {
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [formData, setFormData] = useState<CreateVariedadDto>({
        nombre: initialData?.nombre || '',
        descripcion: initialData?.descripcion || '',
        banco: initialData?.banco || '',
        tipo: initialData?.tipo || 'hibrida'
    })

    const mutation = useMutation({
        mutationFn: (data: CreateVariedadDto) => {
            if (initialData?.id) {
                return updateVariedad(initialData.id, data)
            }
            return createVariedad(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['variedades'] })
            queryClient.invalidateQueries({ queryKey: ['cultivos'] })
            queryClient.invalidateQueries({ queryKey: ['cultivo'] })
            queryClient.invalidateQueries({ queryKey: ['camas'] })
            queryClient.invalidateQueries({ queryKey: ['cama'] })

            showToast(
                initialData ? '¡Variedad actualizada con éxito!' : '¡Variedad guardada con éxito!',
                'success'
            )
            onSuccess()
        },
        onError: () => {
            showToast(
                initialData ? 'Error al actualizar la variedad' : 'Error al guardar la variedad',
                'error'
            )
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
                        <Dna className="w-4 h-4 text-indigo-500" />
                        Nombre de la Variedad
                    </label>
                    <input
                        required
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Gorilla Glue #4"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Banco */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Bookmark className="w-4 h-4 text-indigo-500" />
                            Banco de Semillas
                        </label>
                        <input
                            type="text"
                            value={formData.banco}
                            onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                            placeholder="Ej: Barney's Farm"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                        />
                    </div>

                    {/* Tipo Genético */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-indigo-500" />
                            Tipo Genético
                        </label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                        >
                            <option value="sativa">Sativa</option>
                            <option value="indica">Indica</option>
                            <option value="hibrida">Híbrida</option>
                            <option value="rudelaris">Rudelaris</option>
                        </select>
                    </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-indigo-500" />
                        Descripción / Notas
                    </label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Características específicas, aromas, efectos..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium min-h-[100px] text-slate-900"
                    />
                </div>
            </div>

            {mutation.isError && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ErrorMessage
                        title="No se pudo guardar la variedad"
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
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {mutation.isPending ? 'Guardando...' : initialData ? 'Actualizar Variedad' : 'Guardar Variedad'}
                    {!mutation.isPending && (initialData ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                </button>
            </div>
        </form>
    )
}
