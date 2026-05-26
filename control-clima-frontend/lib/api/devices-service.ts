import apiClient from '@/lib/api/client'
import type { Dispositivo, HistoricalDataResponse, CreateDispositivoDto, UpdateDispositivoDto } from '@/lib/types/api'

export async function fetchUserDevices(userId: number): Promise<Dispositivo[]> {
    const response = await apiClient.get<Dispositivo[]>(`/dispositivos/usuario/${userId}`)
    return response.data
}

export async function ejecutarAccionActuador(actuadorId: number, accion: 'encender' | 'apagar'): Promise<void> {
    await apiClient.post(`/actuadores/${actuadorId}/ejecutar`, { accion })
}

export async function fetchHistoricalData(dispositivoId: number, horas: number = 24): Promise<HistoricalDataResponse> {
    const response = await apiClient.get<HistoricalDataResponse>(`/dispositivos/${dispositivoId}/lecturas/historicas`, {
        params: { horas }
    })
    return response.data
}

export async function fetchDeviceById(id: number, horas?: number): Promise<Dispositivo> {
    const params = horas ? { horas } : {}
    const response = await apiClient.get<Dispositivo>(`/dispositivos/${id}`, { params })
    return response.data
}

// Admin CRUD Operations
export async function fetchDispositivos(): Promise<Dispositivo[]> {
    const response = await apiClient.get<Dispositivo[]>('/dispositivos')
    return response.data
}

export async function createDispositivo(data: CreateDispositivoDto): Promise<Dispositivo> {
    const response = await apiClient.post<Dispositivo>('/dispositivos', data)
    return response.data
}

export async function updateDispositivo(id: number, data: UpdateDispositivoDto): Promise<Dispositivo> {
    const response = await apiClient.patch<Dispositivo>(`/dispositivos/${id}`, data)
    return response.data
}

export async function deleteDispositivo(id: number): Promise<void> {
    await apiClient.delete(`/dispositivos/${id}`)
}
