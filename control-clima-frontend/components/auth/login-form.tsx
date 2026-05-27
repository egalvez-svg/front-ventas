'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/auth/auth-context'
import { Card, CardContent, Input, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { LoginCredentials } from '@/lib/types/api'
import { forgotPassword } from '@/lib/auth/auth-service'

export function LoginForm() {
    const router = useRouter()
    const { login, error, clearError, clearSelectedRole } = useAuthContext()

    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const [credentials, setCredentials] = useState<LoginCredentials>({
        usuario: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [validationErrors, setValidationErrors] = useState<Partial<LoginCredentials>>({})

    const validateForm = (): boolean => {
        const errors: Partial<LoginCredentials> = {}

        if (!credentials.usuario) {
            errors.usuario = 'El usuario es requerido'
        }

        if (!credentials.password) {
            errors.password = 'La contraseña es requerida'
        } else if (credentials.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setIsLoading(true)
            clearError()

            const user = await login(credentials)

            console.log('🔍 Login successful, user:', user)
            console.log('🔍 User roles:', user.roles)

            // Clear selected role to force role selection screen
            clearSelectedRole()

            // Redirect to role selection page
            router.push('/select-role')
        } catch (err) {
            console.error('Login error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!forgotEmail) return

        try {
            setIsLoading(true)
            setForgotStatus(null)
            const response = await forgotPassword(forgotEmail)

            if (response.token) {
                // For testing: redirect automatically when token is returned
                router.push(`/reset-password?token=${response.token}`)
                return
            }

            setForgotStatus({
                type: 'success',
                message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.'
            })
        } catch (err: any) {
            setForgotStatus({
                type: 'error',
                message: err.message || 'Error al procesar la solicitud'
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (field: keyof LoginCredentials) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setCredentials(prev => ({ ...prev, [field]: e.target.value }))
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }))
        }
        if (error) {
            clearError()
        }
    }

    if (isForgotPassword) {
        return (
            <Card className="shadow-xl">
                <CardContent className="pt-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recuperar Contraseña</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Ingresa tu correo electrónico para recibir un enlace de recuperación.
                        </p>
                    </div>

                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                        <Input
                            id="email"
                            type="email"
                            label="Correo Electrónico"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            disabled={isLoading}
                            placeholder="usuario@ejemplo.com"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            }
                            fullWidth
                            required
                        />

                        {forgotStatus && (
                            <div className={cn(
                                "rounded-lg p-3 text-sm flex items-start gap-2",
                                forgotStatus.type === 'success' ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
                            )}>
                                <p>{forgotStatus.message}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            Enviar Enlace
                        </Button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsForgotPassword(false)
                                setForgotStatus(null)
                            }}
                            className="w-full text-center text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
                        >
                            Volver al Inicio de Sesión
                        </button>
                    </form>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-xl">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">

                    <Input
                        id="usuario"
                        type="usuario"
                        label="usuario"
                        value={credentials.usuario}
                        onChange={handleChange('usuario')}
                        error={validationErrors.usuario}
                        disabled={isLoading}
                        placeholder="controlClimaAdmin"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 12a4 4 0 100-8 4 4 0 000 8z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 21v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1"
                                />
                            </svg>
                        }
                        fullWidth
                        autoComplete="usuario"
                    />

                    {/* Password field */}
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            label="Contraseña"
                            value={credentials.password}
                            onChange={handleChange('password')}
                            error={validationErrors.password}
                            disabled={isLoading}
                            placeholder="••••••••"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                            fullWidth
                            autoComplete="current-password"
                        />

                        {/* Toggle password visibility */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsForgotPassword(true)}
                            className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    {/* Auth error message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Submit button */}
                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={isLoading}
                        disabled={isLoading}
                        className="mt-2"
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
