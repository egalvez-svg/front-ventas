'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/auth/auth-context'
import { LoadingSpinner } from '@/components/ui'
import type { Role } from '@/lib/types/api'

export default function SelectRolePage() {
    const router = useRouter()
    const { user, selectRole, isLoading, refreshUser, logout } = useAuthContext()
    const [isRefreshing, setIsRefreshing] = useState(true)

    // Refresh user data ONCE when page loads to get latest roles
    const [hasRefreshed, setHasRefreshed] = useState(false)

    useEffect(() => {
        if (!isLoading && user && !hasRefreshed) {
            setHasRefreshed(true)
            refreshUser().finally(() => {
                setIsRefreshing(false)
            })
        } else if (!isLoading && !user) {
            setIsRefreshing(false)
        }
    }, [isLoading, user, refreshUser, hasRefreshed])

    const handleRoleSelect = useCallback((role: Role) => {
        selectRole(role)
        // Redirect based on role
        const isAdmin = role.nombre.toLowerCase() === 'admin'
        router.push(isAdmin ? '/admin' : '/salas')
    }, [selectRole, router])

    // Auto-select if user has only one role
    useEffect(() => {
        const rolesCount = user?.roles?.length || 0

        if (!isLoading && !isRefreshing && user && rolesCount === 1) {
            const singleRole = user.roles[0]
            handleRoleSelect(singleRole)
        }
    }, [isLoading, isRefreshing, user, handleRoleSelect])

    if (isLoading || !user || isRefreshing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <LoadingSpinner size="lg" text={isRefreshing ? "Actualizando roles..." : "Cargando..."} />
            </div>
        )
    }

    // While auto-selecting, show a redirecting state
    if (user.roles.length === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <LoadingSpinner size="lg" text="Redirigiendo..." />
            </div>
        )
    }

    const handleLogout = () => {
        logout()
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Bienvenido, {user.nombre}
                    </h1>
                    <p className="text-gray-600">
                        Selecciona el rol con el que deseas ingresar
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(user?.roles || []).map((role) => {
                        const isAdmin = role.nombre.toLowerCase() === 'admin'

                        return (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role)}
                                className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                {/* Icon */}
                                <div className="mb-4 flex justify-center">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isAdmin
                                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                        : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                                        }`}>
                                        {isAdmin ? (
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Role Name */}
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {role.nombre}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-600">
                                    {isAdmin
                                        ? 'Acceso completo al panel de administración'
                                        : 'Acceso al panel de usuario'}
                                </p>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500 transition-colors duration-300"></div>
                            </button>
                        )
                    })}
                </div>

                {/* Logout Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                    >
                        ← Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    )
}
