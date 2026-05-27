import axios, { AxiosError } from 'axios'
import { getStoredAccessToken, getStoredRefreshToken, setStoredAccessToken, logoutUser } from '@/lib/auth/auth-service'

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://192.168.100.36:3069',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })

    failedQueue = []
}

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = getStoredAccessToken()
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - Enhanced error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If error is 401 and not already retrying, and NOT a login/refresh request
        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/refresh')) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return apiClient(originalRequest)
                    })
                    .catch((err) => {
                        return Promise.reject(err)
                    })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = getStoredRefreshToken()

            if (!refreshToken) {
                isRefreshing = false
                logoutUser()
                return Promise.reject(error)
            }

            try {
                // Use a standard axios instance to avoid infinite loop with interceptors
                const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
                    refreshToken: refreshToken
                })

                const { accessToken } = response.data
                setStoredAccessToken(accessToken)

                apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`

                processQueue(null, accessToken)
                return apiClient(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                logoutUser()
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        let errorMessage = 'Ha ocurrido un error inesperado'

        if (error.response) {
            const { status, data } = error.response

            // Extract backend error message
            if (data?.message) {
                if (typeof data.message === 'object' && data.message.message) {
                    // Handle nested NestJS style errors: { message: { message: [...], error: '...' } }
                    const nestedMessage = data.message.message;
                    errorMessage = Array.isArray(nestedMessage) ? nestedMessage.join(', ') : nestedMessage;
                } else {
                    errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message
                }
            } else if (data?.error) {
                errorMessage = data.error
            } else {
                // Default messages by status code
                switch (status) {
                    case 400:
                        errorMessage = 'Solicitud inválida. Verifica los datos enviados.'
                        break
                    case 401:
                        if (originalRequest?.url?.includes('/auth/login')) {
                            errorMessage = 'Usuario o contraseña incorrectos.'
                        } else {
                            errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.'
                        }
                        break
                    case 403:
                        errorMessage = 'No tienes permisos para realizar esta acción.'
                        break
                    case 404:
                        errorMessage = 'Recurso no encontrado.'
                        break
                    case 409:
                        errorMessage = 'Conflicto. El recurso ya existe.'
                        break
                    case 422:
                        errorMessage = 'Datos de validación incorrectos.'
                        break
                    case 500:
                        errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.'
                        break
                    case 503:
                        errorMessage = 'Servicio no disponible. Intenta nuevamente más tarde.'
                        break
                    default:
                        errorMessage = `Error del servidor (${status})`
                }
            }
        } else if (error.request) {
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
        } else {
            errorMessage = error.message || 'Error al procesar la solicitud'
        }

        // Create enhanced error with user-friendly message
        const enhancedError = new Error(errorMessage)
        Object.assign(enhancedError, { originalError: error, response: error.response })

        return Promise.reject(enhancedError)
    }
)

export default apiClient
