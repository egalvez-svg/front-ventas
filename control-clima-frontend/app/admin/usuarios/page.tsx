'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserForm } from '@/components/admin'
import { Button, LoadingSpinner, ErrorMessage } from '@/components/ui'
import { fetchUsers, fetchRoles, createUser, updateUser, deleteUser, assignRolesToUser } from '@/lib/api/users-service'
import { fetchModulos, asignarModulosAUsuario } from '@/lib/api/modulos-service'
import type { User, Role, CreateUserDto, UpdateUserDto, Modulo } from '@/lib/types/api'

export default function UsuariosPage() {
    const queryClient = useQueryClient()
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false)
    const [isAssignModulesModalOpen, setIsAssignModulesModalOpen] = useState(false)
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
    const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([])

    // Fetch users
    const { data: users, isLoading, isError, error } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: fetchUsers,
    })

    // Fetch roles
    const { data: roles = [] } = useQuery<Role[]>({
        queryKey: ['roles'],
        queryFn: fetchRoles,
    })

    // Fetch modules
    const { data: modulos = [] } = useQuery<Modulo[]>({
        queryKey: ['modulos'],
        queryFn: fetchModulos,
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setIsCreateModalOpen(false)
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) => updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setIsEditModalOpen(false)
            setSelectedUser(null)
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setIsDeleteModalOpen(false)
            setSelectedUser(null)
        },
    })

    // Assign roles mutation
    const assignRoleMutation = useMutation({
        mutationFn: ({ userId, rol_ids }: { userId: number; rol_ids: number[] }) => assignRolesToUser(userId, rol_ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setIsAssignRoleModalOpen(false)
            setSelectedUser(null)
            setSelectedRoleIds([])
        },
    })

    // Assign modules mutation
    const assignModulesMutation = useMutation({
        mutationFn: ({ userId, moduloIds }: { userId: number; moduloIds: number[] }) =>
            asignarModulosAUsuario(userId, { moduloIds }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setIsAssignModulesModalOpen(false)
            setSelectedUser(null)
            setSelectedModuleIds([])
        },
    })

    const handleDelete = (user: User) => {
        setSelectedUser(user)
        setIsDeleteModalOpen(true)
    }

    const handleAssignRole = (user: User) => {
        setSelectedUser(user)
        setSelectedRoleIds(user.roles?.map(r => r.id) || [])
        setIsAssignRoleModalOpen(true)
    }

    const handleAssignModules = (user: User) => {
        setSelectedUser(user)
        setSelectedModuleIds(user.modulos?.map(m => m.id) || [])
        setIsAssignModulesModalOpen(true)
    }

    const confirmDelete = () => {
        if (selectedUser) {
            deleteMutation.mutate(selectedUser.id)
        }
    }

    const confirmAssignRole = () => {
        if (selectedUser && selectedRoleIds.length > 0) {
            assignRoleMutation.mutate({ userId: selectedUser.id, rol_ids: selectedRoleIds })
        }
    }

    const confirmAssignModules = () => {
        if (selectedUser) {
            assignModulesMutation.mutate({ userId: selectedUser.id, moduloIds: selectedModuleIds })
        }
    }

    const toggleRoleSelection = (roleId: number) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        )
    }

    const toggleModuleSelection = (moduloId: number) => {
        setSelectedModuleIds(prev =>
            prev.includes(moduloId)
                ? prev.filter(id => id !== moduloId)
                : [...prev, moduloId]
        )
    }

    const handleCreateSubmit = (data: CreateUserDto | UpdateUserDto) => {
        createMutation.mutate(data as CreateUserDto)
    }

    const handleEditSubmit = (data: CreateUserDto | UpdateUserDto) => {
        if (selectedUser) {
            updateMutation.mutate({ id: selectedUser.id, data: data as UpdateUserDto })
        }
    }

    return (
        <>
            <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-sky-50 via-cyan-25 to-blue-50">
                <div className="max-w-7xl mx-auto">
                    {/* Header Actions */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-semibold text-slate-800">Usuarios del Sistema</h2>
                            <p className="text-slate-600 mt-1.5">
                                Administra los usuarios y sus permisos
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Usuario
                        </Button>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-16">
                            <LoadingSpinner size="lg" text="Cargando usuarios..." />
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <ErrorMessage
                            title="Error al cargar usuarios"
                            message={error instanceof Error ? error.message : 'Error desconocido'}
                            onRetry={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
                        />
                    )}

                    {/* Users Table */}
                    {!isLoading && !isError && users && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Nombre
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Usuario
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Roles
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Módulos
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-600">{user.id}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-slate-800">
                                                        {user.nombre} {user.apellido_paterno} {user.apellido_materno}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-600">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-600">{user.usuario}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {user.roles.map((role) => (
                                                            <span
                                                                key={role.id}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800"
                                                            >
                                                                {role.nombre}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {user.modulos?.map((modulo) => (
                                                            <span
                                                                key={modulo.id}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                                                            >
                                                                {modulo.nombre}
                                                            </span>
                                                        ))}
                                                        {(!user.modulos || user.modulos.length === 0) && (
                                                            <span className="text-xs text-slate-400 italic">Ninguno</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleAssignRole(user)}
                                                            className="text-green-600 hover:text-green-800 transition-colors"
                                                        >
                                                            Roles
                                                        </button>
                                                        <button
                                                            onClick={() => handleAssignModules(user)}
                                                            className="text-emerald-600 hover:text-emerald-800 transition-colors"
                                                        >
                                                            Módulos
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user)
                                                                setIsEditModalOpen(true)
                                                            }}
                                                            className="text-cyan-600 hover:text-cyan-800 transition-colors"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {users.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500">No hay usuarios registrados</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Confirmar Eliminación
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser.nombre}</strong>?
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsDeleteModalOpen(false)
                                    setSelectedUser(null)
                                }}
                                disabled={deleteMutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={confirmDelete}
                                loading={deleteMutation.isPending}
                                disabled={deleteMutation.isPending}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Roles Modal */}
            {isAssignRoleModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Asignar Roles: {selectedUser.nombre}
                        </h3>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Seleccionar Roles
                            </label>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {roles.map(role => (
                                    <label
                                        key={role.id}
                                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRoleIds.includes(role.id)}
                                            onChange={() => toggleRoleSelection(role.id)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-900">
                                            {role.nombre}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {selectedRoleIds.length === 0 && (
                                <p className="mt-2 text-sm text-red-600">Debe seleccionar al menos un rol</p>
                            )}
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsAssignRoleModalOpen(false)
                                    setSelectedUser(null)
                                    setSelectedRoleIds([])
                                }}
                                disabled={assignRoleMutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={confirmAssignRole}
                                loading={assignRoleMutation.isPending}
                                disabled={assignRoleMutation.isPending || selectedRoleIds.length === 0}
                            >
                                {assignRoleMutation.isPending ? 'Asignando...' : 'Asignar Roles'}
                            </Button>
                        </div>
                        {assignRoleMutation.isError && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-700">
                                    Error al asignar roles: {assignRoleMutation.error instanceof Error ? assignRoleMutation.error.message : 'Error desconocido'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Crear Nuevo Usuario
                        </h3>
                        <UserForm
                            onSubmit={handleCreateSubmit}
                            onCancel={() => setIsCreateModalOpen(false)}
                            isLoading={createMutation.isPending}
                        />
                        {createMutation.isError && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-700">
                                    Error al crear usuario: {createMutation.error instanceof Error ? createMutation.error.message : 'Error desconocido'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Editar Usuario: {selectedUser.nombre}
                        </h3>
                        <UserForm
                            user={selectedUser}
                            onSubmit={handleEditSubmit}
                            onCancel={() => {
                                setIsEditModalOpen(false)
                                setSelectedUser(null)
                            }}
                            isLoading={updateMutation.isPending}
                        />
                        {updateMutation.isError && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-700">
                                    Error al actualizar usuario: {updateMutation.error instanceof Error ? updateMutation.error.message : 'Error desconocido'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Assign Modules Modal */}
            {isAssignModulesModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] shadow-xl max-w-md w-full p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Módulos de Usuario</h3>
                                <p className="text-sm text-slate-500">{selectedUser.nombre} {selectedUser.apellido_paterno}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                Seleccionar Módulos Activos
                            </label>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {modulos.map(modulo => (
                                    <label
                                        key={modulo.id}
                                        className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all cursor-pointer ${selectedModuleIds.includes(modulo.id)
                                            ? 'bg-emerald-50 border-emerald-500'
                                            : 'bg-white border-slate-100 hover:border-emerald-200'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedModuleIds.includes(modulo.id)
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'bg-white border-slate-200'
                                            }`}>
                                            {selectedModuleIds.includes(modulo.id) && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedModuleIds.includes(modulo.id)}
                                                onChange={() => toggleModuleSelection(modulo.id)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm font-bold text-slate-700 block">{modulo.nombre}</span>
                                            {modulo.descripcion && (
                                                <span className="text-xs text-slate-400 line-clamp-1">{modulo.descripcion}</span>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsAssignModulesModalOpen(false)
                                    setSelectedUser(null)
                                    setSelectedModuleIds([])
                                }}
                                disabled={assignModulesMutation.isPending}
                                className="rounded-2xl"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={confirmAssignModules}
                                loading={assignModulesMutation.isPending}
                                disabled={assignModulesMutation.isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-600/20"
                            >
                                Guardar Cambios
                            </Button>
                        </div>

                        {assignModulesMutation.isError && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4">
                                <p className="text-sm text-red-700">
                                    Error al asignar módulos: {assignModulesMutation.error instanceof Error ? assignModulesMutation.error.message : 'Error desconocido'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
