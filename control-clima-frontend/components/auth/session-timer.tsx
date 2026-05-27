'use client'

import React from 'react'
import { useAuthContext } from '@/lib/auth/auth-context'
import { Clock } from 'lucide-react'

export function SessionTimer() {
    const { timeLeft, isAuthenticated } = useAuthContext()

    if (!isAuthenticated || timeLeft === null) return null

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const isUrgent = timeLeft < 300 // 5 minutes

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${isUrgent
                ? 'bg-red-100 text-red-700 animate-pulse'
                : 'bg-green-100 text-green-700'
            }`}>
            <Clock size={14} />
            <span>Sesión: {formatTime(timeLeft)}</span>
        </div>
    )
}
