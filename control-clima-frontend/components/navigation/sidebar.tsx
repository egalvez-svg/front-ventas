'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Home,
    Sprout,
    Database,
    Settings,
    ChevronRight,
    Menu,
    X,
    ThermometerSun,
    PackageSearch,
    Dna,
    LogOut
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/lib/auth/auth-context'
import { SessionTimer } from '@/components/auth/session-timer'

const menuItems = [
    {
        title: 'Principal',
        items: [
            { name: 'Mis Salas', href: '/salas', icon: Home },
            { name: 'Dispositivos', href: '/', icon: LayoutDashboard, slug: 'dispositivos' },
        ]
    },
    {
        title: 'Cultivos',
        items: [
            { name: 'Control de Cultivos', href: '/cultivos', icon: Sprout },
        ]
    },
    {
        title: 'Catálogos',
        items: [
            { name: 'Variedades', href: '/catalogos/variedades', icon: Dna },
            { name: 'Productos', href: '/catalogos/productos', icon: PackageSearch },
        ]
    },
    {
        title: 'Hardware',
        items: [
            { name: 'Administración', href: '/dispositivos', icon: ThermometerSun },
        ]
    }
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuthContext()
    const [isOpen, setIsOpen] = useState(true)

    // Filter menu items based on user modules
    const filteredMenuItems = menuItems.map(section => ({
        ...section,
        items: section.items.filter(item => {
            // Dispositivos only appears if user has the 'dispositivos' module
            if (item.slug === 'dispositivos') {
                return user?.modulos?.some(m => m.slug === 'dispositivos')
            }
            return true
        })
    })).filter(section => section.items.length > 0)

    return (
        <>
            {/* Mobile Toggle Button - Visible only when sidebar is closed on mobile */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed left-4 top-4 p-2 bg-white rounded-lg shadow-lg border border-slate-200 text-slate-600 hover:text-sky-600 transition-colors z-50 lg:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}

            {/* Mobile Backdrop - Visible only when sidebar is OPEN on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 flex flex-col shadow-xl lg:shadow-none",
                isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:translate-x-0 lg:w-20"
            )}>
                {/* Header/Logo */}
                <div className="h-16 flex items-center px-4 border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity">
                        <div className="flex-shrink-0">
                            <Image
                                src="/icons/omnigrow_clean.png"
                                alt="OmniGrow Logo"
                                width={32}
                                height={32}
                                className="rounded-lg object-contain"
                            />
                        </div>
                        {isOpen && (
                            <span className="font-bold text-slate-800 whitespace-nowrap tracking-tight">
                                OmniGrow
                            </span>
                        )}
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-hide">
                    {filteredMenuItems.map((section, idx) => (
                        <div key={idx} className="space-y-2">
                            {isOpen && (
                                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    {section.title}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href
                                    const Icon = item.icon

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => {
                                                // Close sidebar on mobile when navigating
                                                if (window.innerWidth < 1024) setIsOpen(false)
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                                                isActive
                                                    ? "bg-sky-50 text-sky-600 shadow-sm"
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <Icon className={cn(
                                                "w-5 h-5 transition-colors",
                                                isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"
                                            )} />
                                            {isOpen && (
                                                <span className="font-medium whitespace-nowrap">{item.name}</span>
                                            )}
                                            {isActive && isOpen && (
                                                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer/Logout */}
                <div className="p-4 border-t border-slate-100 space-y-4">
                    {isOpen && (
                        <div className="px-3">
                            <SessionTimer />
                        </div>
                    )}

                    <div className="space-y-2">
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors group"
                        >
                            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500 transition-colors" />
                            {isOpen && <span className="font-medium">Cerrar Sesión</span>}
                        </button>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 mx-auto" />}
                            {isOpen && <span className="font-medium">Contraer Menú</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
