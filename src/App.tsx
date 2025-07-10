
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Componente principal de rutas
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Rutas protegidas de dashboards */}
      <Route path="/dashboard/general" element={
        <ProtectedRoute>
          <DashboardGeneral />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/iren-norte" element={
        <ProtectedRoute>
          <DashboardIrenNorte />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/iren-sur" element={
        <ProtectedRoute>
          <DashboardIrenSur />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/la-caleta" element={
        <ProtectedRoute>
          <DashboardLaCaleta />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/lanatta" element={
        <ProtectedRoute>
          <DashboardLanatta />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/plan-mil" element={
        <ProtectedRoute>
          <DashboardPlanMil />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/clickup" element={
        <ProtectedRoute>
          <DashboardClickUp />
        </ProtectedRoute>
      } />

      {/* Redirección por defecto a dashboard general para usuarios autenticados */}
      <Route path="/dashboard" element={<Navigate to="/dashboard/general" replace />} />
      
      {/* Página 404 */}
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
