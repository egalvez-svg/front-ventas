// Tipos compartidos con el backend

export interface Dispositivo {
    ultimaActualizacion: string | number | Date
    id: number
    nombre: string
    descripcion?: string
    ubicacion?: string
    ip?: string
    usuarioId?: number
    usuario?: User
    gpios?: Gpio[]
    salaId?: number
    sala?: Sala
    creado_en?: string
    actualizado_en?: string
}

export interface Gpio {
    unidad: number
    id: number
    dispositivoId?: number
    pin: number
    tipo: 'sensor' | 'actuador'
    nombre?: string
    activo: boolean
    dispositivo?: Dispositivo
    sensores?: Sensor[]
    actuadores?: Actuador[]
}

export interface Sensor {
    id: number
    gpioId: number
    tipo: string
    unidad: string
    activo: boolean
    gpio?: Gpio
}

export interface Actuador {
    id: number
    gpioId: number
    tipo: string
    estadoDefault: boolean
    estado?: boolean
    activo: boolean
    gpio?: Gpio
}

export interface Regla {
    id: number
    nombre: string
    tipo: 'sensor' | 'horario'
    // Campos para reglas basadas en sensores
    sensor?: Sensor
    sensorId?: number
    comparador?: '>' | '<' | '>=' | '<=' | '='
    valor_trigger?: number
    accion?: 'encender' | 'apagar' | 'toggle'
    delay_segundos: number
    // Campos para reglas basadas en horarios
    hora_inicio?: string
    hora_fin?: string
    diasSemana?: number[]
    accion_inicio?: 'encender' | 'apagar'
    accion_fin?: 'encender' | 'apagar'
    // Campos comunes
    dispositivoId: number
    actuador?: Actuador
    actuadorId: number
    habilitada: boolean
    creado_en?: string
}

export interface Lectura {
    id: number
    sensorId: number
    valor: number
    registrado_en: string
    sensor?: Sensor
}

export interface HistoricalDataPoint {
    timestamp: string
    valor: number
}

export interface HistoricalSensorData {
    sensorId: number
    tipo: string
    unidad: string
    datos: HistoricalDataPoint[]
}

export interface HistoricalDataResponse {
    dispositivoId: number
    nombre: string
    sensores: HistoricalSensorData[]
    rangoHoras: number
}

export interface Weather {
    temperatura: number
    humedad: number
    unidad_temp: string
    unidad_hum: string
    condicion: string
    codigo_clima: number
    ubicacion: {
        city: string
        region: string
        country: string
    }
}

// DTOs para formularios

export interface CreateDispositivoDto {
    nombre: string
    descripcion?: string
    ubicacion?: string
    ip?: string
    usuarioId?: number
}

export interface UpdateDispositivoDto {
    nombre?: string
    descripcion?: string
    ubicacion?: string
    ip?: string
    usuarioId?: number
}

export interface CreateSensorDto {
    gpioId: number
    tipo: string
    unidad: string
    activo?: boolean
}

export interface CreateActuadorDto {
    gpioId: number
    tipo: string
    estadoDefault?: boolean
    activo?: boolean
}

export interface CreateReglaDto {
    nombre: string
    sensorId: number
    actuadorId: number
    comparador: '>' | '<' | '>=' | '<=' | '='
    valorTrigger: number
    accion: 'encender' | 'apagar'
    delay_segundos?: number
    habilitada?: boolean
}

export interface EjecutarAccionDto {
    accion: 'encender' | 'apagar'
}

// Authentication Types
export interface Role {
    id: number
    nombre: string
}

export interface Modulo {
    id: number
    nombre: string
    slug: string
    descripcion?: string
    activo?: boolean
    creado_en?: string
}

export interface User {
    id: number
    nombre: string
    apellido_paterno: string
    apellido_materno: string
    usuario: string
    email: string
    roles: Role[]
    modulos?: Modulo[]
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
}

export interface LoginCredentials {
    usuario: string
    password: string
}

export interface ForgotPasswordDto {
    email: string
}

export interface ForgotPasswordResponse {
    message: string
    token?: string // Present in dev environments
}

export interface ResetPasswordDto {
    token: string
    password: string
}

// User Management DTOs
export interface CreateUserDto {
    nombre: string
    apellido_paterno: string
    apellido_materno: string
    email: string
    usuario: string
    password: string
    roleIds?: number[]
}

export interface UpdateUserDto {
    nombre?: string
    apellido_paterno?: string
    apellido_materno?: string
    email?: string
    usuario?: string
    password?: string
    roleIds?: number[]
}

export interface AsignarModulosDto {
    moduloIds: number[]
}

export interface CreateModuloDto {
    nombre: string
    slug: string
    descripcion?: string
    activo?: boolean
}

export interface UpdateModuloDto extends Partial<CreateModuloDto> { }


// --- Gestión de Salas y Camas ---

export interface Sala {
    id: number
    nombre: string
    descripcion?: string
    usuarioId?: number
    creado_en?: string
    actualizado_en?: string
    camas?: Cama[]
    dispositivos?: Dispositivo[]
}

export interface Cama {
    id: number
    nombre: string
    descripcion?: string
    capacidad_plantas?: number
    filas?: number
    columnas?: number
    salaId: number
    sala?: Sala
    creado_en?: string
    actualizado_en?: string
}

// --- Gestión de Cultivos y Variedades ---

export type CropStatus = 'activo' | 'esqueje' | 'vegetativo' | 'floracion' | 'cosecha' | 'finalizado' | 'cancelado'

export interface Cultivo {
    id: number
    nombre: string
    fecha_inicio: string
    fecha_fin?: string
    estado: CropStatus
    variedadId?: number // Deprecated, kept for backward compatibility
    variedadIds?: number[]
    salaId: number
    camaId?: number
    variedad?: Variedad // Deprecated, kept for backward compatibility
    variedades?: Variedad[]
    sala?: Sala
    plantas?: Planta[]
    nutriciones?: NutricionSemanal[]
    cantidad_plantas?: number
    creado_en?: string
    actualizado_en?: string,
    dias_ciclo?: number,
    cama?: Cama
    medioCultivoId?: number
    medioCultivo?: MedioCultivo
}

export interface MedioCultivo {
    id: number
    nombre: string
    descripcion?: string
}

export interface Variedad {
    id: number
    nombre: string
    descripcion?: string
    banco?: string
    tipo?: string
    creado_en?: string
}

export interface Planta {
    id: number
    codigo?: string
    fila: number
    columna: number
    posicion?: string
    estado?: 'activa' | 'removida' | 'cosechada'
    fecha_plantacion: string
    notas?: string
    variedadId?: number
    cultivoId: number
    creado_en?: string
    actualizado_en?: string
}

// --- Nutrición y Productos ---

export interface Producto {
    id: number
    nombre: string
    fabricante?: string
    descripcion?: string
    activo: boolean
}

export interface NutricionSemanal {
    id: number
    cultivoId: number
    semana?: number
    tipo_riego?: 'nutricion' | 'solo_agua' | 'lavado_raices' | 'agua_esquejes'
    fecha_aplicacion: string
    litros_agua: number
    ph?: number
    ec?: number
    notas?: string
    productos?: NutricionDetalle[]
    creado_en?: string
}

export interface NutricionDetalle {
    id: number
    nutricionSemanalId: number
    productoNutricionId: number
    dosis_por_litro: number
    productoNutricion?: Producto
}

// --- DTOs para nuevas entidades ---

export interface CreateSalaDto {
    nombre: string
    descripcion?: string
    dispositivoIds?: number[]
}

export interface UpdateSalaDto extends Partial<CreateSalaDto> { }

export interface CreateCamaDto {
    nombre: string
    descripcion?: string
    capacidad_plantas?: number
    filas?: number
    columnas?: number
    salaId: number
}

export interface UpdateCamaDto extends Partial<Omit<CreateCamaDto, 'salaId'>> { }

export interface CreateCultivoDto {
    nombre: string
    fecha_inicio: string
    variedadIds: number[]
    salaId: number
    camaId?: number
    cantidad_plantas: number
    estado?: CropStatus
    medioCultivoId?: number
}

export interface CreateMedioCultivoDto {
    nombre: string
    descripcion?: string
}

export interface UpdateMedioCultivoDto extends Partial<CreateMedioCultivoDto> { }

export interface CreateVariedadDto {
    nombre: string
    descripcion?: string
    banco?: string
    tipo?: string
}

export interface UpdateVariedadDto extends Partial<CreateVariedadDto> { }

export interface CreatePlantaDto {
    fila: number
    columna: number
    estado?: 'activa' | 'removida' | 'cosechada'
    codigo?: string
    variedadId?: number
    fecha_plantacion: string
    notas?: string
}

export interface UpdatePlantaDto extends Partial<CreatePlantaDto> { }

export interface CreateProductoDto {
    nombre: string
    fabricante?: string
    descripcion?: string
    activo?: boolean
}

export interface UpdateProductoDto extends Partial<CreateProductoDto> { }

export interface ProductoRiegoDto {
    productoNutricionId: number
    dosis_por_litro: number
}

export interface CreateNutricionDto {
    semana?: number
    tipo_riego?: 'nutricion' | 'solo_agua' | 'lavado_raices' | 'agua_esquejes'
    fecha_aplicacion: string
    litros_agua: number
    ph?: number
    ec?: number
    notas?: string
    productos: ProductoRiegoDto[]
}

export interface UpdateNutricionDto extends Partial<CreateNutricionDto> { }

// --- IA y Análisis ---

export interface AnalisisIA {
    id: number
    cultivoId: number
    snapshot: {
        cultivo: {
            nombre: string
            estado: string
            dias_ciclo: number
            sala: string
            medio_cultivo?: string
        }
        dispositivos: any[]
        nutricion: {
            semana: number
            tipo: string
            ph: string
            ec: string
            litros: string
        }[]
    }
    analisis: string
    fecha: string
}

export interface AnalisisIAActual {
    id: number
    snapshot: {
        cultivo: {
            nombre: string
            estado: string
            dias_ciclo: number
            sala: string
            medio_cultivo?: string
        }
        dispositivos: any[]
        nutricion: {
            semana: number
            tipo: string
            ph: string
            ec: string
            litros: string
        }[]
    }
    analisis_prediccion: string
    es_cache: boolean
    fecha: string
}

export interface ManualAIAnalysisDto {
    temperatura: number
    humedad: number
    ph?: number
    ec?: number
    notas_usuario?: string
}

