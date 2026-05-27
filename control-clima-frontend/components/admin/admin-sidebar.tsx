'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SessionTimer } from '@/components/auth/session-timer'

interface NavItem {
    name: string
    href: string
    icon: React.ReactNode
}

const navItems: NavItem[] = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        name: 'Usuarios',
        href: '/admin/usuarios',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )
    },
    {
        name: 'Dispositivos',
        href: '/admin/dispositivos',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
        )
    },
    {
        name: 'Medios de Cultivo',
        href: '/admin/medios-cultivo',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        )
    },
    {
        name: 'Módulos',
        href: '/admin/modulos',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        )
    }
]

interface AdminSidebarProps {
    className?: string
}

export function AdminSidebar({ className = '' }: AdminSidebarProps) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-cyan-600 text-white rounded-lg shadow-lg hover:bg-cyan-700 transition-colors"
                aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            <aside
                className={`bg-gradient-to-b from-cyan-900 to-cyan-800 text-white transition-all duration-300 flex flex-col min-h-screen fixed lg:relative z-50 ${isCollapsed ? 'w-20' : 'w-64'
                    } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${className}`}
            >
                {/* Header */}
                <div className={`border-b border-cyan-700 transition-all ${isCollapsed ? 'p-4' : 'p-6'}`}>
                    <div className={`flex items-center ${isCollapsed ? 'flex-col gap-4 justify-center' : 'justify-between'}`}>
                        {!isCollapsed && (
                            <div className="flex items-center gap-3">
                                <Image
                                    src="/icons/omnigrow_clean.png"
                                    alt="OmniGrow Logo"
                                    width={180}
                                    height={45}
                                    className="h-10 w-auto"
                                />
                            </div>
                        )}
                        {isCollapsed && (
                            <div className="w-10 h-10 flex items-center justify-center mx-auto flex-shrink-0">
                                <Image
                                    src="/icons/omnigrow_clean.png"
                                    alt="OmniGrow"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 hover:bg-cyan-700 rounded-lg transition-colors"
                            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                        >
                            <svg
                                className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/50'
                                    : 'text-cyan-100 hover:bg-cyan-700 hover:text-white'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                title={isCollapsed ? item.name : undefined}
                            >
                                {item.icon}
                                {!isCollapsed && <span className="font-medium">{item.name}</span>}
                            </Link>
                        )
                    })}

                    <div className="pt-4 mt-4 border-t border-cyan-700">
                        <Link
                            href="/select-role"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-cyan-100 hover:bg-cyan-700 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? 'Cambiar Rol' : undefined}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            {!isCollapsed && <span className="font-medium">Cambiar Rol</span>}
                        </Link>
                    </div>
                </nav>

                {!isCollapsed && (
                    <div className="p-4 border-t border-cyan-700 space-y-4">
                        <div className="px-3">
                            <SessionTimer />
                        </div>
                        <div className="text-xs text-cyan-300 text-center">
                            <p>Sistema de Control</p>
                            <p className="mt-1">v1.0.0</p>
                        </div>
                    </div>
                )}
            </aside>
        </>
    )
}
