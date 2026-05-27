'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/auth/auth-context'
import { AdminSidebar } from '@/components/admin'
import { DashboardHeader } from '@/components/dashboard'
import { LoadingSpinner } from '@/components/ui'
import { SessionExpiryNotification } from '@/components/auth/session-expiry-notification'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { user, selectedRole, isLoading, isAuthenticated } = useAuthContext()

    useEffect(() => {
        if (!isLoading) {
            // Not authenticated, redirect to login
            if (!isAuthenticated) {
                router.push('/login')
                return
            }

            // Authenticated but no role selected, redirect to role selection
            if (!selectedRole) {
                router.push('/select-role')
                return
            }

            const isAdmin = selectedRole.nombre.toLowerCase() === 'admin'
            if (!isAdmin) {
                router.push('/')
            }
        }
    }, [isAuthenticated, isLoading, selectedRole, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
                <LoadingSpinner size="xl" text="Verificando permisos..." />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    if (!selectedRole) {
        return null
    }

    const isAdmin = selectedRole.nombre.toLowerCase() === 'admin'
    if (!isAdmin) {
        return null
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-sky-50 via-cyan-25 to-blue-50">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader title="Panel de Administración" />

                {children}
            </div>
            <SessionExpiryNotification />
        </div>
    )
}
