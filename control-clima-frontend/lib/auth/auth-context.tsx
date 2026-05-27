'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User, LoginCredentials, Role } from '@/lib/types/api'
import { loginUser as loginUserService, logoutUser as logoutUserService, getStoredToken, getStoredUser, fetchCurrentUser, setStoredUser, getStoredRefreshToken, setStoredAccessToken, decodeToken } from './auth-service'
import apiClient from '../api/client'

interface AuthContextType {
    user: User | null
    selectedRole: Role | null
    isLoading: boolean
    isAuthenticated: boolean
    error: string | null
    login: (credentials: LoginCredentials) => Promise<User>
    logout: () => void
    clearError: () => void
    selectRole: (role: Role) => void
    clearSelectedRole: () => void
    refreshUser: () => Promise<void>
    timeLeft: number | null // in seconds
    sessionExpiry: number | null // timestamp
    refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sessionExpiry, setSessionExpiry] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)

    // Check for existing session on mount
    useEffect(() => {
        const token = getStoredToken()
        const storedUser = getStoredUser()
        const storedRoleStr = localStorage.getItem('selectedRole')

        if (token && storedUser) {
            setUser(storedUser)

            if (storedRoleStr) {
                try {
                    const storedRole = JSON.parse(storedRoleStr)
                    setSelectedRole(storedRole)
                } catch (e) {
                }
            }

            // Check for stored expiry
            const storedExpiry = localStorage.getItem('auth_expiry')
            if (storedExpiry) {
                setSessionExpiry(parseInt(storedExpiry, 10))
            }
        }

        setIsLoading(false)
    }, [])

    // Timer logic
    useEffect(() => {
        if (!sessionExpiry || !user) {
            setTimeLeft(null)
            return
        }

        const updateTimer = () => {
            const now = Date.now()
            const diff = Math.floor((sessionExpiry - now) / 1000)

            if (diff <= 0) {
                setTimeLeft(0)
                // Optionally trigger logout or refresh here
                // For now, let the interceptor handle it if they make a request
                // or the UI show it's expired
            } else {
                setTimeLeft(diff)
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [sessionExpiry, user])

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true)
            setError(null)

            const user = await loginUserService(credentials)

            setUser(user)
            return user  // Return user so it can be used immediately
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
            setError(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const logout = useCallback(() => {
        logoutUserService()
        setUser(null)
        setSelectedRole(null)
        setError(null)
        localStorage.removeItem('selectedRole')
        window.location.href = '/login'
    }, [])

    const selectRole = useCallback((role: Role) => {
        setSelectedRole(role)
        localStorage.setItem('selectedRole', JSON.stringify(role))
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    const clearSelectedRole = useCallback(() => {
        setSelectedRole(null)
        localStorage.removeItem('selectedRole')
    }, [])

    const refreshSession = useCallback(async () => {
        try {
            const refreshToken = getStoredRefreshToken()
            if (!refreshToken) throw new Error('No refresh token available')

            // Trigger the refresh manually via the API client logic or directly
            // Our apiClient already has logic to refresh, but we want to force it or get the result
            const response = await apiClient.post('/auth/refresh', { refreshToken })
            const { accessToken } = response.data

            // setStoredAccessToken inside apiClient or here will update localStorage
            setStoredAccessToken(accessToken)

            const decoded = decodeToken(accessToken)
            if (decoded && decoded.exp) {
                setSessionExpiry(decoded.exp * 1000)
            }
        } catch (error) {
            console.error('Failed to refresh session:', error)
            logout()
        }
    }, [logout])

    const refreshUser = useCallback(async () => {
        try {
            const token = getStoredToken()
            if (!token) {
                console.warn('No token found, cannot refresh user')
                return
            }

            const updatedUser = await fetchCurrentUser()

            // Defensive: if for some reason the refresh response doesn't have roles but we already have them, keep them
            if (!updatedUser.roles && user?.roles) {
                updatedUser.roles = user.roles
            }

            setUser(updatedUser)
            setStoredUser(updatedUser)

            // Update expiry from token if it changed
            const decoded = decodeToken(token)
            if (decoded && decoded.exp) {
                setSessionExpiry(decoded.exp * 1000)
            }

            // Check if selected role still exists in updated user roles
            if (selectedRole) {
                const availableRoles = updatedUser.roles || []
                const roleStillExists = availableRoles.some(r => r.id === selectedRole.id)

                if (!roleStillExists && availableRoles.length > 0) {
                    clearSelectedRole()
                }
            }
        } catch (error) {
            setError('Error al actualizar información del usuario')
        }
    }, [selectedRole, clearSelectedRole, user])

    const value: AuthContextType = {
        user,
        selectedRole,
        isLoading,
        isAuthenticated: !!user,
        error,
        login,
        logout,
        clearError,
        selectRole,
        clearSelectedRole,
        refreshUser,
        timeLeft,
        sessionExpiry,
        refreshSession,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}
