'use client'

import { useState } from 'react'
import { MedioCultivo, CreateMedioCultivoDto, UpdateMedioCultivoDto } from '@/lib/types/api'
import { Button } from '@/components/ui'
import { Sprout, AlignLeft } from 'lucide-react'

interface MedioCultivoFormProps {
    medio?: MedioCultivo
    onSubmit: (data: CreateMedioCultivoDto | UpdateMedioCultivoDto) => void
    onCancel: () => void
    isLoading?: boolean
}

export function MedioCultivoForm({ medio, onSubmit, onCancel, isLoading }: MedioCultivoFormProps) {
    const [formData, setFormData] = useState<CreateMedioCultivoDto>({
        nombre: medio?.nombre || '',
        descripcion: medio?.descripcion || ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Nombre */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-emerald-500" />
                        Nombre del Medio
                    </label>
                    <input
                        required
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Sustrato de Coco, Hidroponia, Tierra Fertilizada..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
                    />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-emerald-500" />
                        Descripción (Opcional)
                    </label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Detalles sobre la composición, pH recomendado, etc."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[120px] text-slate-900"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    disabled={isLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                >
                    {medio ? 'Guardar Cambios' : 'Crear Medio'}
                </Button>
            </div>
        </form>
    )
}
