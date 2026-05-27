import apiClient from '@/lib/api/client'
import type { Cama, CreateCamaDto } from '@/lib/types/api'

export async function fetchCamasBySala(salaId: number): Promise<Cama[]> {
    const response = await apiClient.get<Cama[]>(`/camas/sala/${salaId}`)
    return response.data
}

export async function fetchCamaById(id: number): Promise<Cama> {
    const response = await apiClient.get<Cama>(`/camas/${id}`)
    return response.data
}

export async function createCama(data: CreateCamaDto): Promise<Cama> {
    const response = await apiClient.post<Cama>('/camas', data)
    return response.data
}

export async function updateCama(id: number, data: Partial<CreateCamaDto>): Promise<Cama> {
    const response = await apiClient.patch<Cama>(`/camas/${id}`, data)
    return response.data
}

export async function deleteCama(id: number): Promise<void> {
    await apiClient.delete(`/camas/${id}`)
}
