import apiClient from '@/lib/api/client'
import type { Regla } from '@/lib/types/api'

export async function fetchDeviceRules(dispositivoId: number): Promise<Regla[]> {
    const response = await apiClient.get<Regla[]>(`/reglas/dispositivo/${dispositivoId}`)
    return response.data
}

export async function createRule(data: Partial<Regla>): Promise<Regla> {
    const response = await apiClient.post<Regla>('/reglas', data)
    return response.data
}

export async function updateRule(id: number, data: Partial<Regla>): Promise<Regla> {
    const response = await apiClient.patch<Regla>(`/reglas/${id}`, data)
    return response.data
}

export async function deleteRule(id: number): Promise<void> {
    await apiClient.delete(`/reglas/${id}`)
}

export async function toggleRule(id: number): Promise<Regla> {
    const response = await apiClient.patch<Regla>(`/reglas/${id}/toggle`)
    return response.data
}
