import apiClient from '@/lib/api/client'
import type { LoginCredentials, LoginResponse, User, ForgotPasswordResponse, ResetPasswordDto } from '@/lib/types/api'
import Cookies from 'js-cookie'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'auth_user'
const ROLES_KEY = 'user_roles'
const MODULES_KEY = 'user_modules'

export async function fetchCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/user')
    return response.data
}

export function decodeToken(token: string): any {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(jsonPayload)
    } catch (error) {
        console.error('Error decoding token:', error)
        return null
    }
}

export async function loginUser(credentials: LoginCredentials): Promise<User> {
    const loginResponse = await apiClient.post<LoginResponse>('/auth/login', credentials)
    const { accessToken, refreshToken } = loginResponse.data

    setStoredAccessToken(accessToken)
    setStoredRefreshToken(refreshToken)

    const user = await fetchCurrentUser()

    // Debug: Log user object to see structure
    console.log('🔍 User object from backend:', user)

    setStoredUser(user)

    return user
}

export async function logoutUser(): Promise<void> {
    try {
        await apiClient.post('/auth/logout')
    } catch (error) {
        console.error('Error during backend logout:', error)
    } finally {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(ACCESS_TOKEN_KEY)
            localStorage.removeItem(REFRESH_TOKEN_KEY)
            localStorage.removeItem(USER_KEY)

            Cookies.remove(ACCESS_TOKEN_KEY)
            Cookies.remove(REFRESH_TOKEN_KEY)
            Cookies.remove(ROLES_KEY)
            Cookies.remove(MODULES_KEY)
        }
    }
}

export function getStoredAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setStoredAccessToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(ACCESS_TOKEN_KEY, token)

    // Calculate expiry from token if possible
    const decoded = decodeToken(token)
    if (decoded && decoded.exp) {
        localStorage.setItem('auth_expiry', (decoded.exp * 1000).toString())
    }

    // Set cookie for middleware access (7 days expiry)
    Cookies.set(ACCESS_TOKEN_KEY, token, { expires: 7, path: '/' })
}

export function getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setStoredRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
    // Refresh token should also be available via cookie for consistency, though primarily for client-side refresh logic
    Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 30, path: '/' })
}

// Helper to check for existing token (used by legacy components)
export function getStoredToken(): string | null {
    return getStoredAccessToken()
}

// Helper to set token (used by legacy components)
export function setStoredToken(token: string): void {
    setStoredAccessToken(token)
}

export function getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    const userJson = localStorage.getItem(USER_KEY)
    if (!userJson) return null

    try {
        return JSON.parse(userJson) as User
    } catch (error) {
        console.error('Error parsing stored user:', error)
        return null
    }
}

export function setStoredUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(USER_KEY, JSON.stringify(user))

    // Set roles and modules in cookies for middleware
    const roles = user.roles?.map(r => r.nombre.toLowerCase()) || []
    const modules = user.modulos?.map(m => m.slug) || []

    Cookies.set(ROLES_KEY, JSON.stringify(roles), { expires: 7, path: '/' })
    Cookies.set(MODULES_KEY, JSON.stringify(modules), { expires: 7, path: '/' })
}

export function isAuthenticated(): boolean {
    return !!getStoredToken()
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email })
    return response.data
}

export async function resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', dto)
    return response.data
}
