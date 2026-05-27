# 🌡️ Control de Clima - Frontend

Dashboard web para el sistema de control y monitoreo de clima construido con Next.js 14.

## 🚀 Stack Tecnológico

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **TanStack Query** (gestión de datos)
- **Axios** (HTTP client)

## 📦 Instalación

Las dependencias ya están instaladas. Si necesitas reinstalar:

```bash
npm install
```

## 🏃 Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_API_URL=http://localhost:3069
```

> ⚠️ **Importante:** El backend NestJS debe estar corriendo en el puerto 3069

## 📁 Estructura del Proyecto

```
frontend/
├── app/                      # App Router de Next.js
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Dashboard principal
├── components/
│   ├── ui/                  # Componentes UI (futuro shadcn/ui)
│   └── dashboard/           # Componentes del dashboard
├── lib/
│   ├── api/
│   │   └── client.ts        # Cliente Axios configurado
│   └── types/
│       └── api.ts           # Tipos TypeScript compartidos
├── providers/
│   └── query-provider.tsx   # Provider de TanStack Query
└── public/                  # Archivos estáticos
```

## 🎯 Features Implementadas

### ✅ Dashboard Principal
- Vista general del sistema
- Cards con estadísticas
- Lista de sensores activos
- Lista de actuadores activos
- Actualización automática cada 5 segundos

### 🔄 TanStack Query
- Cache inteligente de datos
- Refetch automático
- Estados de loading
- Error handling

### 🎨 UI/UX
- Diseño responsive
- Tailwind CSS
- Loading states
- Cards interactivos

## 📡 API Endpoints Usados

### Sensores
- `GET /sensores` - Lista de sensores
- Actualización automática cada 5s

### Actuadores
- `GET /actuadores` - Lista de actuadores

## 🔧 Próximos Pasos

### Features Pendientes
- [ ] Control de actuadores (ejecutar acciones)
- [ ] Gráficos con Recharts
- [ ] Página de sensores con historial
- [ ] Gestión de reglas (CRUD)
- [ ] Gestión de dispositivos
- [ ] WebSocket para tiempo real
- [ ] Notificaciones/Alerts
- [ ] Login/Autenticación

### Componentes a Agregar
- [ ] Shadcn/ui components
- [ ] Charts (temperatura, humedad)
- [ ] Formularios con react-hook-form
- [ ] Sidebar navigation
- [ ] Header con user info

## 🎨 Personalización

### Colores
Edita `tailwind.config.ts` para cambiar la paleta de colores.

### Fuentes
El proyecto usa las fuentes Geist Sans y Geist Mono de Vercel.

## 📝 Scripts Disponibles

```bash
npm run dev      # Modo desarrollo
npm run build    # Build para producción
npm start        # Servidor de producción
npm run lint     # Linter ESLint
```

## 🐛 Troubleshooting

### Error: Cannot connect to API
- Verifica que el backend esté corriendo en `localhost:3069`
- Revisa la variable `NEXT_PUBLIC_API_URL` en `.env.local`

### CORS Error
- Asegúrate de que NestJS tenga CORS habilitado
- En `main.ts` debe tener: `app.enableCors()`

### TypeScript errors
- Ejecuta: `npm run lint`
- Verifica que los tipos en `lib/types/api.ts` coincidan con tu backend

## 🔗 Links Útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 Licencia

Proyecto educativo.
