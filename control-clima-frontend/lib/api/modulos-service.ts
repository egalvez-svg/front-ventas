import apiClient from '@/lib/api/client'
import type { Modulo, AsignarModulosDto, CreateModuloDto, UpdateModuloDto } from '@/lib/types/api'

export async function fetchModulos(): Promise<Modulo[]> {
    const response = await apiClient.get<Modulo[]>('/modulos')
    return response.data
}

export async function createModulo(data: CreateModuloDto): Promise<Modulo> {
    const response = await apiClient.post<Modulo>('/modulos', data)
    return response.data
}

export async function updateModulo(id: number, data: UpdateModuloDto): Promise<Modulo> {
    const response = await apiClient.patch<Modulo>(`/modulos/${id}`, data)
    return response.data
}

export async function deleteModulo(id: number): Promise<void> {
    await apiClient.delete(`/modulos/${id}`)
}

export async function asignarModulosAUsuario(userId: number, data: AsignarModulosDto): Promise<void> {
    await apiClient.patch(`/usuario/${userId}/modulos`, data)
}
