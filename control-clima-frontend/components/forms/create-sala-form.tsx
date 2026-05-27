'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createSala, updateSala } from '@/lib/api/salas-service'
import { fetchUserDevices } from '@/lib/api/devices-service'
import { CreateSalaDto, Sala, Dispositivo } from '@/lib/types/api'
import { Plus, Home, AlignLeft, Save, Cpu, CheckCircle2, Circle } from 'lucide-react'
import { ErrorMessage } from '@/components/ui/error-message'
import { useToast } from '@/providers/toast-provider'
import { useAuthContext } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'

interface CreateSalaFormProps {
    initialData?: Sala
    onSuccess: () => void
    onCancel: () => void
}

export function CreateSalaForm({ initialData, onSuccess, onCancel }: CreateSalaFormProps) {
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const { user } = useAuthContext()
    const isEdit = !!initialData

    const [formData, setFormData] = useState<CreateSalaDto>({
        nombre: initialData?.nombre || '',
        descripcion: initialData?.descripcion || '',
        dispositivoIds: initialData?.dispositivos?.map(d => d.id) || []
    })

    // Fetch user devices
    const { data: userDevices = [], isLoading: devicesLoading } = useQuery({
        queryKey: ['userDevices', user?.id],
        queryFn: () => user?.id ? fetchUserDevices(user.id) : Promise.resolve([]),
        enabled: !!user?.id
    })

    const mutation = useMutation({
        mutationFn: (data: CreateSalaDto) =>
            isEdit && initialData
                ? updateSala(initialData.id, data)
                : createSala(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salas'] })
            queryClient.invalidateQueries({ queryKey: ['userDevices', user?.id] })
            if (isEdit) {
                queryClient.invalidateQueries({ queryKey: ['sala', initialData.id] })
            }
            showToast(isEdit ? '¡Espacio actualizado con éxito!' : '¡Espacio creado con éxito!', 'success')
            onSuccess()
        },
        onError: (error: any) => {
            showToast(isEdit ? 'Error al actualizar la sala' : 'Error al crear la sala', 'error')
        }
    })

    const toggleDevice = (deviceId: number) => {
        const currentIds = [...(formData.dispositivoIds || [])]
        const index = currentIds.indexOf(deviceId)

        if (index > -1) {
            currentIds.splice(index, 1)
        } else {
            currentIds.push(deviceId)
        }

        setFormData({ ...formData, dispositivoIds: currentIds })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutation.mutate(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna Izquierda: Datos Básicos */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Información del Espacio
                    </h3>

                    <div className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                                Nombre del Espacio de Cultivo
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej: Indoor A, Pieza 1, Galpón Central..."
                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-bold text-slate-800"
                            />
                            <p className="text-[10px] text-slate-400 font-medium px-1">
                                El nombre identificará este espacio físico (Indoor, Pieza, Invernadero, etc.)
                            </p>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                                Descripción (Opcional)
                            </label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                placeholder="Detalles sobre las dimensiones, ubicación o propósito..."
                                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium min-h-[120px] text-slate-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Dispositivos Asociados */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        Dispositivos Disponibles
                    </h3>

                    <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 min-h-[300px]">
                        {devicesLoading ? (
                            <div className="flex items-center justify-center h-full py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                            </div>
                        ) : userDevices.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <Cpu className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold text-sm">No tienes dispositivos registrados aún.</p>
                                <p className="text-slate-300 text-xs mt-1">Regístralos en el panel de administrador.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {userDevices.map((device) => {
                                    const isSelected = formData.dispositivoIds?.includes(device.id)
                                    return (
                                        <button
                                            key={device.id}
                                            type="button"
                                            onClick={() => toggleDevice(device.id)}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left group",
                                                isSelected
                                                    ? "bg-white border-sky-500 shadow-md shadow-sky-500/5"
                                                    : "bg-white/50 border-white hover:border-sky-200"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                    isSelected ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-400"
                                                )}>
                                                    <Cpu className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={cn("text-sm font-black", isSelected ? "text-slate-900" : "text-slate-500")}>
                                                        {device.nombre}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                        {device.ubicacion || 'Sin ubicación'}
                                                    </p>
                                                </div>
                                            </div>
                                            {isSelected ? (
                                                <CheckCircle2 className="w-5 h-5 text-sky-500" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-slate-200 group-hover:text-sky-200" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {mutation.isError && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ErrorMessage
                        title={isEdit ? "No se pudo actualizar el espacio" : "No se pudo crear el espacio"}
                        error={mutation.error}
                    />
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-8 py-4 border border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className={cn(
                        "flex-[2] px-8 py-4 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]",
                        isEdit ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20" : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/10"
                    )}
                >
                    {mutation.isPending
                        ? (isEdit ? 'Procesando...' : 'Creando...')
                        : (isEdit ? 'Guardar Cambios' : 'Crear Espacio')}
                    {!mutation.isPending && (isEdit ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                </button>
            </div>
        </form>
    )
}
