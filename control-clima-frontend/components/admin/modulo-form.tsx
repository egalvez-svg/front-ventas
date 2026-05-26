'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui'
import type { Modulo, CreateModuloDto, UpdateModuloDto } from '@/lib/types/api'
import { useEffect } from 'react'

const moduloSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(50),
    slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(50),
    descripcion: z.string().optional(),
    activo: z.boolean().default(true),
})

type ModuloFormValues = z.infer<typeof moduloSchema>

interface ModuloFormProps {
    modulo?: Modulo
    onSubmit: (data: CreateModuloDto | UpdateModuloDto) => void
    onCancel: () => void
    isLoading?: boolean
}

export function ModuloForm({ modulo, onSubmit, onCancel, isLoading }: ModuloFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ModuloFormValues>({
        resolver: zodResolver(moduloSchema),
        defaultValues: {
            nombre: modulo?.nombre || '',
            slug: modulo?.slug || '',
            descripcion: modulo?.descripcion || '',
            activo: modulo?.activo ?? true,
        }
    })

    const nombreValue = watch('nombre')

    useEffect(() => {
        if (!modulo && nombreValue) {
            const slug = nombreValue
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            setValue('slug', slug)
        }
    }, [nombreValue, setValue, modulo])

    useEffect(() => {
        if (modulo) {
            reset({
                nombre: modulo.nombre,
                slug: modulo.slug,
                descripcion: modulo.descripcion || '',
                activo: modulo.activo ?? true,
            })
        }
    }, [modulo, reset])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Nombre del Módulo
                    </label>
                    <input
                        {...register('nombre')}
                        type="text"
                        placeholder="Ej: Control de Clima"
                        className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl focus:ring-4 transition-all outline-none ${errors.nombre
                                ? 'border-red-100 focus:border-red-500 focus:ring-red-500/10 text-red-900 placeholder:text-red-200'
                                : 'border-slate-100 focus:border-cyan-500 focus:ring-cyan-500/10 text-slate-700'
                            }`}
                    />
                    {errors.nombre && (
                        <p className="mt-2 text-sm text-red-500 font-medium px-1 flex items-center gap-2 animate-in slide-in-from-left-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {errors.nombre.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                        Slug (URL/ID interno)
                    </label>
                    <input
                        {...register('slug')}
                        type="text"
                        placeholder="ej-control-clima"
                        className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl focus:ring-4 transition-all outline-none ${errors.slug
                                ? 'border-red-100 focus:border-red-500 focus:ring-red-500/10 text-red-900'
                                : 'border-slate-100 focus:border-cyan-500 focus:ring-cyan-500/10 text-slate-700'
                            }`}
                    />
                    {errors.slug && (
                        <p className="mt-2 text-sm text-red-500 font-medium px-1">{errors.slug.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                    Descripción
                </label>
                <textarea
                    {...register('descripcion')}
                    rows={3}
                    placeholder="Acceso a hardware y análisis automático..."
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none text-slate-700 resize-none"
                />
            </div>

            <div className="flex items-center gap-3 px-1">
                <input
                    {...register('activo')}
                    type="checkbox"
                    id="activo-check"
                    className="w-5 h-5 text-cyan-500 border-2 border-slate-200 rounded-lg focus:ring-cyan-500 transition-all"
                />
                <label htmlFor="activo-check" className="text-sm font-bold text-slate-600 cursor-pointer select-none uppercase tracking-wider">
                    Módulo Activo
                </label>
            </div>

            <div className="flex gap-4 pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="flex-1 rounded-2xl py-6 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading}
                    className="flex-1 rounded-2xl py-6 font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 transition-all"
                >
                    {modulo ? 'Guardar Cambios' : 'Crear Módulo'}
                </Button>
            </div>
        </form>
    )
}
