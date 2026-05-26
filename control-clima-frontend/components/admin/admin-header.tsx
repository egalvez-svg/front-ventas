'use client'

import { useAuth } from '@/hooks'
import { Button } from '@/components/ui'

interface AdminHeaderProps {
    title: string
    className?: string
}

export function AdminHeader({ title, className = '' }: AdminHeaderProps) {
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        window.location.href = '/login'
    }

    return (
        <header className={`bg-white border-b border-gray-200 ${className}`}>
            <div className="px-6 py-4 flex items-center justify-between">
                {/* Title */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500 mt-1">Panel de Administración</p>
                </div>

                {/* User info and logout */}
                <div className="flex items-center gap-4">
                    {user && (
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-gray-900">
                                {user.nombre} {user.apellido_paterno} {user.apellido_materno}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    )}

                    <Button
                        variant="secondary"
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="hidden sm:inline">Cerrar Sesión</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}
