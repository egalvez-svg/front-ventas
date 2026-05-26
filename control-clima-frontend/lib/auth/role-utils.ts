import type { User, Role } from '@/lib/types/api'

/**
 * Verifica si un usuario tiene un rol específico
 */
export function hasRole(user: User | null, roleName: string): boolean {
    if (!user || !user.roles) return false
    return user.roles.some(role => role.nombre.toLowerCase() === roleName.toLowerCase())
}

/**
 * Verifica si un usuario es administrador
 */
export function isAdmin(user: User | null): boolean {
    const result = hasRole(user, 'admin')
    return result
}

/**
 * Obtiene los nombres de todos los roles de un usuario
 */
export function getRoleNames(user: User | null): string[] {
    if (!user || !user.roles) return []
    return user.roles.map(role => role.nombre)
}

/**
 * Obtiene los IDs de todos los roles de un usuario
 */
export function getRoleIds(user: User | null): number[] {
    if (!user || !user.roles) return []
    return user.roles.map(role => role.id)
}
