import apiClient from '@/lib/api/client'
import type { Sala, CreateSalaDto } from '@/lib/types/api'

export async function fetchUserSalas(): Promise<Sala[]> {
    const response = await apiClient.get<Sala[]>('/salas/usuario')
    return response.data
}

export async function fetchSalaById(id: number): Promise<Sala> {
    const response = await apiClient.get<Sala>(`/salas/${id}`)
    return response.data
}

export async function createSala(data: CreateSalaDto): Promise<Sala> {
    const response = await apiClient.post<Sala>('/salas', data)
    return response.data
}

export async function updateSala(id: number, data: Partial<CreateSalaDto>): Promise<Sala> {
    const response = await apiClient.patch<Sala>(`/salas/${id}`, data)
    return response.data
}

export async function deleteSala(id: number): Promise<void> {
    await apiClient.delete(`/salas/${id}`)
}
