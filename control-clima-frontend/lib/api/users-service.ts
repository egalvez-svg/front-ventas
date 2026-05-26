import apiClient from '@/lib/api/client'
import type { User, CreateUserDto, UpdateUserDto, Role } from '@/lib/types/api'

export async function fetchUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/usuario')
    return response.data
}

export async function createUser(data: Omit<CreateUserDto, 'roleIds'>): Promise<User> {
    const response = await apiClient.post<User>('/usuario', data)
    return response.data
}

export async function updateUser(id: number, data: UpdateUserDto): Promise<User> {
    const response = await apiClient.patch<User>(`/usuario/${id}`, data)
    return response.data
}

export async function deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/usuario/${id}`)
}

export async function assignRolesToUser(userId: number, rol_ids: number[]): Promise<void> {
    await apiClient.patch(`/usuario/${userId}/rol`, { rol_ids })
}

export async function fetchRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>('/rol')
    return response.data
}
