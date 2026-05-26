import api from './client'
import { MedioCultivo, CreateMedioCultivoDto, UpdateMedioCultivoDto } from '../types/api'

export async function fetchMediosCultivo(): Promise<MedioCultivo[]> {
    const response = await api.get<MedioCultivo[]>('/medios-cultivo')
    return response.data
}

export async function createMedioCultivo(data: CreateMedioCultivoDto): Promise<MedioCultivo> {
    const response = await api.post<MedioCultivo>('/medios-cultivo', data)
    return response.data
}

export async function updateMedioCultivo(id: number, data: UpdateMedioCultivoDto): Promise<MedioCultivo> {
    const response = await api.patch<MedioCultivo>(`/medios-cultivo/${id}`, data)
    return response.data
}

export async function deleteMedioCultivo(id: number): Promise<void> {
    await api.delete(`/medios-cultivo/${id}`)
}
