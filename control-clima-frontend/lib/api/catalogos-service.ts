import apiClient from '@/lib/api/client'
import type { Variedad, CreateVariedadDto, Producto, CreateProductoDto } from '@/lib/types/api'

// Variedades
export async function fetchVariedades(): Promise<Variedad[]> {
    const response = await apiClient.get<Variedad[]>('/variedades')
    return response.data
}

export async function fetchVariedadById(id: number): Promise<Variedad> {
    const response = await apiClient.get<Variedad>(`/variedades/${id}`)
    return response.data
}

export async function createVariedad(data: CreateVariedadDto): Promise<Variedad> {
    const response = await apiClient.post<Variedad>('/variedades', data)
    return response.data
}

export async function updateVariedad(id: number, data: Partial<CreateVariedadDto>): Promise<Variedad> {
    const response = await apiClient.patch<Variedad>(`/variedades/${id}`, data)
    return response.data
}

export async function deleteVariedad(id: number): Promise<void> {
    await apiClient.delete(`/variedades/${id}`)
}

// Productos
export async function fetchProductos(soloActivos: boolean = true): Promise<Producto[]> {
    const response = await apiClient.get<Producto[]>('/productos', {
        params: { soloActivos }
    })
    return response.data
}

export async function createProducto(data: CreateProductoDto): Promise<Producto> {
    const response = await apiClient.post<Producto>('/productos', data)
    return response.data
}

export async function fetchProductoById(id: number): Promise<Producto> {
    const response = await apiClient.get<Producto>(`/productos/${id}`)
    return response.data
}

export async function updateProducto(id: number, data: Partial<CreateProductoDto>): Promise<Producto> {
    const response = await apiClient.patch<Producto>(`/productos/${id}`, data)
    return response.data
}

export async function deleteProducto(id: number): Promise<void> {
    await apiClient.delete(`/productos/${id}`)
}
