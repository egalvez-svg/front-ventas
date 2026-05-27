'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/auth/auth-context'
import { LoadingSpinner } from '@/components/ui'

interface DashboardHeaderProps {
    title?: string
    isFetching?: boolean
    className?: string
}

export function DashboardHeader({
    title = 'Dashboard',
    isFetching = false,
    className = ''
}: DashboardHeaderProps) {
    const router = useRouter()
    const { user, selectedRole, logout } = useAuthContext()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        setIsDropdownOpen(false)
        logout()
    }

    const handleChangeRole = () => {
        setIsDropdownOpen(false)
        router.push('/select-role')
    }

    const getUserInitials = () => {
        if (!user) return '?'
        const names = user.nombre.split(' ')
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase()
        }
        return user.nombre.substring(0, 2).toUpperCase()
    }

    return (
        <div className={`bg-white border-b border-gray-200 ${className}`}>
            <div className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center gap-4">

                </div>

                <div className="flex items-center gap-4">
                    {isFetching && (
                        <LoadingSpinner
                            size="md"
                            variant="primary"
                            text="Actualizando..."
                        />
                    )}

                    {user && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                    {getUserInitials()}
                                </div>

                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                                    {selectedRole && (
                                        <p className="text-xs text-gray-500">Rol: {selectedRole.nombre}</p>
                                    )}
                                </div>

                                <svg
                                    className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        {selectedRole && (
                                            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                                                {selectedRole.nombre}
                                            </div>
                                        )}
                                    </div>

                                    <div className="py-1">
                                        <button
                                            onClick={handleChangeRole}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                            Cambiar Rol
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
