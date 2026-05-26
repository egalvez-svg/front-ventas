'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { LoginForm } from '@/components/auth'
import { LoadingSpinner } from '@/components/ui'

export default function LoginPage() {
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

                {/* Login Form */}
                <LoginForm />

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Sistema de Monitoreo y Control de Clima
                </p>
            </div>
        </div>
    )
}
