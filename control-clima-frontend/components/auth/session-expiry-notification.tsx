'use client'

import React, { useState, useEffect } from 'react'
import { useAuthContext } from '@/lib/auth/auth-context'
import { AlertTriangle, Clock, RefreshCw, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SessionExpiryNotification() {
    const { timeLeft, refreshSession, logout, isAuthenticated } = useAuthContext()
    const [show, setShow] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Show when less than 2 minutes (120 seconds) and not already refreshing
    useEffect(() => {
        if (isAuthenticated && timeLeft !== null && timeLeft > 0 && timeLeft < 120) {
            setShow(true)
        } else {
            setShow(false)
        }
    }, [timeLeft, isAuthenticated])

    if (!show || !isAuthenticated) return null

    const handleExtend = async () => {
        try {
            setIsRefreshing(true)
            await refreshSession()
        } catch (error) {
            console.error('Error extending session:', error)
        } finally {
            setIsRefreshing(false)
            setShow(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white border-2 border-amber-200 rounded-lg shadow-xl p-4 max-w-sm flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-full">
                        <AlertTriangle className="text-amber-600" size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">Tu sesión está por expirar</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Te quedan menos de 2 minutos de sesión. ¿Deseas continuar navegando?
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-amber-50 px-3 py-2 rounded-md">
                    <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                        <Clock size={16} />
                        <span>{Math.floor(timeLeft! / 60)}:{(timeLeft! % 60).toString().padStart(2, '0')}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleExtend}
                        disabled={isRefreshing}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {isRefreshing ? <RefreshCw className="animate-spin mr-2" size={16} /> : null}
                        Mantener abierta
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => logout()}
                        className="flex-1 text-gray-600"
                        icon={<LogOut size={16} />}
                    >
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    )
}
