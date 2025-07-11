import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"; // ✨ 1. Importa Outlet
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardGeneral from './pages/DashboardGeneral';
import DashboardIrenNorte from './pages/DashboardIrenNorte';
import DashboardIrenSur from './pages/DashboardIrenSur';
import DashboardLaCaleta from './pages/DashboardLaCaleta';
import DashboardLanatta from './pages/DashboardLanatta';
import DashboardPlanMil from './pages/DashboardPlanMil';
import DashboardClickUp from './pages/DashboardClickUp';

const queryClient = new QueryClient();

// ✨ 2. Componente de Ruta de Layout Protegido
// Este componente se renderiza UNA SOLA VEZ para todas las rutas del dashboard.
const ProtectedLayoutRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Si no está autenticado, lo redirige a la página de inicio/login
    return <Navigate to="/" replace />;
  }

  // Si está autenticado, renderiza el Layout.
  // El <Outlet /> es el espacio donde se cargarán las páginas hijas (los dashboards).
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// Componente principal de rutas
const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta pública para el login/inicio */}
      <Route path="/" element={<Index />} />

      {/* ✨ 3. Rutas anidadas para el dashboard */}
      {/* Todas las rutas de dashboard ahora son hijas de ProtectedLayoutRoute */}
      <Route element={<ProtectedLayoutRoute />}>
        <Route path="/dashboard/general" element={<DashboardGeneral />} />
        <Route path="/dashboard/iren-norte" element={<DashboardIrenNorte />} />
        <Route path="/dashboard/iren-sur" element={<DashboardIrenSur />} />
        <Route path="/dashboard/la-caleta" element={<DashboardLaCaleta />} />
        <Route path="/dashboard/lanatta" element={<DashboardLanatta />} />
        <Route path="/dashboard/plan-mil" element={<DashboardPlanMil />} />
        <Route path="/dashboard/clickup" element={<DashboardClickUp />} />
        
        {/* Redirección por defecto */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/general" replace />} />
      </Route>

      {/* Página 404 para cualquier otra ruta */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;