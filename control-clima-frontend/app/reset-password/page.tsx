'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, Input, Button } from '@/components/ui'
import { resetPassword } from '@/lib/auth/auth-service'
import { cn } from '@/lib/utils'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [countdown, setCountdown] = useState(3)

    useEffect(() => {
        if (status?.type === 'success' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else if (status?.type === 'success' && countdown === 0) {
            router.push('/login')
        }
    }, [status, countdown, router])

    useEffect(() => {
        if (!token) {
            setStatus({
                type: 'error',
                message: 'El token de recuperación es inválido o ha expirado.'
            })
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) return

        if (password.length < 6) {
            setStatus({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres.' })
            return
        }

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Las contraseñas no coinciden.' })
            return
        }

        try {
            setIsLoading(true)
            setStatus(null)
            await resetPassword({ token, password })
            setStatus({ type: 'success', message: 'Tu contraseña ha sido restablecida exitosamente.' })
        } catch (err: any) {
            setStatus({
                type: 'error',
                message: err.message || 'Error al restablecer la contraseña'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="shadow-xl">
            <CardContent className="pt-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Nueva Contraseña</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Ingresa y confirma tu nueva contraseña para recuperar el acceso.
                    </p>
                </div>

                {/* Case 1: Error and no token (Invalid URL) */}
                {!token && status?.type === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-700 font-medium mb-4">{status.message}</p>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => router.push('/login')}
                        >
                            Volver al Login
                        </Button>
                    </div>
                )}

                {/* Case 2: Success (Show countdown transition) */}
                {token && status?.type === 'success' && (
                    <div className="py-8 text-center animate-in fade-in zoom-in duration-500">
                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Todo listo!</h3>
                        <p className="text-gray-600 mb-8">
                            {status.message}
                        </p>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">
                                Redirigiendo en {countdown}...
                            </p>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-green-500 h-full transition-all duration-1000 ease-linear"
                                    style={{ width: `${(countdown / 3) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Case 3: Editing (Form visible) */}
                {token && status?.type !== 'success' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                label="Nueva Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                placeholder="••••••••"
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                }
                                fullWidth
                                required
                            />
                            {/* Toggle password visibility */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <Input
                            id="confirmPassword"
                            type="password"
                            label="Confirmar Contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            placeholder="••••••••"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            }
                            fullWidth
                            required
                        />

                        {status?.type === 'error' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm flex items-start gap-2 text-red-700">
                                <p>{status.message}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            Restablecer Contraseña
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-6">
                        <img
                            src="/icons/omnigrow_clean.png"
                            alt="OmniGrow Logo"
                            className="w-20 h-20 drop-shadow-xl object-contain"
                        />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                        OmniGrow
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Sistema de Control de Clima
                    </p>
                </div>

                <Suspense fallback={<div>Cargando...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
