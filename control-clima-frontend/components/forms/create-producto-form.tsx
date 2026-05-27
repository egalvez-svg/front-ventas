'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProducto, updateProducto } from '@/lib/api/catalogos-service'
import { CreateProductoDto, Producto } from '@/lib/types/api'
import { Plus, ShoppingBag, AlignLeft, Tag, Activity, Save } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { useToast } from '@/providers/toast-provider'

interface CreateProductoFormProps {
    onSuccess: () => void
    onCancel: () => void
    initialData?: Producto | null
}

export function CreateProductoForm({ onSuccess, onCancel, initialData }: CreateProductoFormProps) {
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [formData, setFormData] = useState<CreateProductoDto>({
        nombre: initialData?.nombre || '',
        fabricante: initialData?.fabricante || '',
        descripcion: initialData?.descripcion || '',
        activo: initialData?.activo ?? true
    })

    const mutation = useMutation({
        mutationFn: (data: CreateProductoDto) => {
            if (initialData?.id) {
                return updateProducto(initialData.id, data)
            }
            return createProducto(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] })
            showToast(
                initialData ? '¡Producto actualizado con éxito!' : '¡Producto guardado con éxito!',
                'success'
            )
            onSuccess()
        },
        onError: () => {
            showToast(
                initialData ? 'Error al actualizar el producto' : 'Error al guardar el producto',
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
                        <ShoppingBag className="w-4 h-4 text-emerald-500" />
                        Nombre del Producto
                    </label>
                    <input
                        required
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Bio-Grow"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
                    />
                </div>

                {/* Marca */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-500" />
                        Marca / Fabricante
                    </label>
                    <input
                        type="text"
                        value={formData.fabricante}
                        onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                        placeholder="Ej: BioBizz"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
                    />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-emerald-500" />
                        Descripción / Uso
                    </label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Dosis recomendada o fase de aplicación..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[100px] text-slate-900"
                    />
                </div>

                {/* Estado */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-500" />
                        <div>
                            <p className="text-sm font-bold text-slate-800">Producto Activo</p>
                            <p className="text-xs text-slate-500">Disponible para planes de nutrición</p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-emerald-200 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                </div>
            </div>

            {mutation.isError && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ErrorMessage
                        title="No se pudo guardar el producto"
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
                    {mutation.isPending ? 'Guardando...' : initialData ? 'Actualizar Producto' : 'Guardar'}
                    {!mutation.isPending && (initialData ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                </button>
            </div>
        </form>
    )
}
