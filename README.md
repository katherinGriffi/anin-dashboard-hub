
# ANIN - Sistema de Gestión de Dashboards

![ANIN Logo](https://img.shields.io/badge/ANIN-Dashboard%20System-007BFF?style=for-the-badge)

Una aplicación web moderna (SPA) desarrollada con React + Vite para la gestión de dashboards de monitoreo de actividades.

## 🚀 Características

- **Login Simulado**: Sistema de autenticación frontend-only
- **Layout Responsive**: Barra lateral colapsable para dispositivos móviles
- **6 Dashboards**: Páginas con iframes para embeber dashboards externos
- **Tema Oscuro**: Diseño moderno con colores personalizados
- **Tipografía**: Fuente Inter para una experiencia visual profesional

## 🎯 Credenciales de Acceso

```
Usuario: admin
Contraseña: Anin.2025*
```

## 📋 Dashboards Disponibles

| Dashboard | Ruta | Descripción |
|-----------|------|-------------|
| Gestión General | `/dashboard/general` | Vista general de actividades |
| IREN Norte | `/dashboard/iren-norte` | Dashboard IREN Norte |
| IREN Sur | `/dashboard/iren-sur` | Dashboard IREN Sur |
| La Caleta | `/dashboard/la-caleta` | Dashboard La Caleta |
| Lanatta | `/dashboard/lanatta` | Dashboard Lanatta |
| Plan Mil | `/dashboard/plan-mil` | Dashboard Plan Mil |

## 🛠️ Tecnologías

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Enrutamiento**: React Router DOM
- **Estado**: React Hooks + Context API
- **Iconos**: Lucide React

## 📦 Instalación

### Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd anin-dashboard
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm run preview      # Vista previa de la build de producción

# Utilidades
npm run lint         # Ejecuta ESLint para verificar el código
```

## 🌐 Despliegue en GitHub Pages

### Configuración Automática

1. **Configurar GitHub Pages**
   - Ve a Settings > Pages en tu repositorio
   - Selecciona "GitHub Actions" como fuente

2. **Crear archivo de workflow**
   Crea `.github/workflows/deploy.yml`:
   
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       
       steps:
       - name: Checkout
         uses: actions/checkout@v4
         
       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'
           
       - name: Install dependencies
         run: npm ci
         
       - name: Build
         run: npm run build
         
       - name: Deploy to GitHub Pages
         uses: peaceiris/actions-gh-pages@v3
         if: github.ref == 'refs/heads/main'
         with:
           github_token: ${{ secrets.GITHUB_TOKEN }}
           publish_dir: ./dist
   ```

3. **Configurar base URL en vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/nombre-del-repositorio/',
     // ... resto de la configuración
   });
   ```

### Despliegue Manual

```bash
# 1. Construir la aplicación
npm run build

# 2. Subir la carpeta dist/ a la rama gh-pages
# (o usar gh-pages package)
npm install -g gh-pages
gh-pages -d dist
```

## ⚙️ Configuración de URLs de Dashboards

Para configurar las URLs reales de los dashboards, edita los archivos en `src/pages/`:

```typescript
// Ejemplo: src/pages/DashboardGeneral.tsx
<DashboardFrame
  title="Gestión de Actividades General"
  description="Vista general del sistema de gestión de actividades"
  url="https://tu-dashboard-real.com" // ← Cambiar esta URL
/>
```

### TODO: URLs a Configurar

- [ ] `DashboardGeneral.tsx` - URL del dashboard de Gestión General
- [ ] `DashboardIrenNorte.tsx` - URL del dashboard de IREN Norte  
- [ ] `DashboardIrenSur.tsx` - URL del dashboard de IREN Sur
- [ ] `DashboardLaCaleta.tsx` - URL del dashboard de La Caleta
- [ ] `DashboardLanatta.tsx` - URL del dashboard de Lanatta
- [ ] `DashboardPlanMil.tsx` - URL del dashboard de Plan Mil

## 🎨 Personalización de Estilos

### Colores del Tema

Los colores están definidos en `src/index.css`:

```css
:root {
  --background: 220 13% 10%;        /* #1a1a1a */
  --primary: 213 94% 68%;           /* #007BFF */
  --sidebar-background: 220 13% 8%; /* Sidebar más oscura */
  /* ... más colores */
}
```

### Fuentes

La fuente principal es **Inter**, configurada en:
- `src/index.css` (import de Google Fonts)
- `tailwind.config.ts` (configuración de Tailwind)

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes UI base (shadcn)
│   ├── AppSidebar.tsx   # Barra lateral de navegación
│   ├── DashboardFrame.tsx # Componente iframe para dashboards
│   ├── Layout.tsx       # Layout principal
│   └── Login.tsx        # Componente de login
├── hooks/               # Hooks personalizados
│   └── useAuth.tsx      # Hook de autenticación
├── pages/               # Páginas de la aplicación
│   ├── Index.tsx        # Página principal/login
│   ├── NotFound.tsx     # Página 404
│   └── Dashboard*.tsx   # Páginas de dashboards
├── lib/                 # Utilidades
│   └── utils.ts         # Funciones helper
├── App.tsx              # Componente principal
├── main.tsx             # Punto de entrada
└── index.css            # Estilos globales
```

## 🔒 Seguridad

- **Autenticación**: Solo frontend, no persiste en servidor
- **Rutas Protegidas**: Redirección automática al login si no autenticado
- **Iframe Sandbox**: Los iframes tienen restricciones de seguridad configuradas

## 🐛 Depuración

### Logs de Consola

La aplicación incluye logs útiles:
- Login exitoso/fallido
- Navegación de rutas
- Errores 404

### Problemas Comunes

1. **Dashboard no carga**: Verificar URL en el componente correspondiente
2. **Sidebar no colapsa**: Verificar que SidebarProvider esté configurado
3. **Estilos no aplican**: Verificar importación de CSS en main.tsx

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para reportar problemas o solicitar características:
- Crea un **Issue** en GitHub
- Contacta al equipo de desarrollo

---

**ANIN Dashboard System** - Desarrollado con ❤️ usando React + Vite
```

La aplicación ANIN está ahora completamente configurada con todas las funcionalidades solicitadas. Incluye autenticación simulada, 6 dashboards con iframes, tema oscuro moderno, sidebar responsive y está preparada para GitHub Pages.
