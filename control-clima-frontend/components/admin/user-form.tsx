'use client'

import React, { useState, useEffect } from 'react'
import { Input, Button } from '@/components/ui'
import type { User, CreateUserDto, UpdateUserDto } from '@/lib/types/api'

interface UserFormProps {
    user?: User | null
    onSubmit: (data: CreateUserDto | UpdateUserDto) => void
    onCancel: () => void
    isLoading?: boolean
}

export function UserForm({ user, onSubmit, onCancel, isLoading = false }: UserFormProps) {
    const isEditMode = !!user

    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        apellido_paterno: user?.apellido_paterno || '',
        apellido_materno: user?.apellido_materno || '',
        usuario: user?.usuario || '',
        email: user?.email || '',
        password: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre,
                apellido_paterno: user.apellido_paterno,
                apellido_materno: user.apellido_materno,
                usuario: user.usuario,
                email: user.email,
                password: ''
            })
        }
    }, [user])

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido'
        }

        if (!formData.apellido_paterno.trim()) {
            newErrors.apellido_paterno = 'El apellido paterno es requerido'
        }

        if (!formData.apellido_materno.trim()) {
            newErrors.apellido_materno = 'El apellido materno es requerido'
        }

        if (!formData.usuario.trim()) {
            newErrors.usuario = 'El usuario es requerido'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El email no es válido'
        }

        if (!isEditMode && !formData.password) {
            newErrors.password = 'La contraseña es requerida'
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        // Prepare data based on mode
        const submitData: CreateUserDto | UpdateUserDto = {
            nombre: formData.nombre,
            apellido_paterno: formData.apellido_paterno,
            apellido_materno: formData.apellido_materno,
            usuario: formData.usuario,
            email: formData.email
        }

        // Only include password if provided
        if (formData.password) {
            submitData.password = formData.password
        }

        onSubmit(submitData)
    }

    const handleChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <Input
                id="nombre"
                label="Nombre"
                value={formData.nombre}
                onChange={handleChange('nombre')}
                error={errors.nombre}
                disabled={isLoading}
                placeholder="Juan"
                fullWidth
            />

            {/* Apellido Paterno */}
            <Input
                id="apellido_paterno"
                label="Apellido Paterno"
                value={formData.apellido_paterno}
                onChange={handleChange('apellido_paterno')}
                error={errors.apellido_paterno}
                disabled={isLoading}
                placeholder="Pérez"
                fullWidth
            />

            {/* Apellido Materno */}
            <Input
                id="apellido_materno"
                label="Apellido Materno"
                value={formData.apellido_materno}
                onChange={handleChange('apellido_materno')}
                error={errors.apellido_materno}
                disabled={isLoading}
                placeholder="González"
                fullWidth
            />

            {/* Usuario */}
            <Input
                id="usuario"
                label="Usuario"
                value={formData.usuario}
                onChange={handleChange('usuario')}
                error={errors.usuario}
                disabled={isLoading}
                placeholder="jperez"
                fullWidth
            />

            {/* Email */}
            <Input
                id="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange('email')}
                error={errors.email}
                disabled={isLoading}
                placeholder="juan.perez@example.com"
                fullWidth
            />

            {/* Password */}
            <Input
                id="password"
                type="password"
                label={isEditMode ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                value={formData.password}
                onChange={handleChange('password')}
                error={errors.password}
                disabled={isLoading}
                placeholder="••••••••"
                fullWidth
            />

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    disabled={isLoading}
                >
                    {isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
                </Button>
            </div>
        </form>
    )
}
