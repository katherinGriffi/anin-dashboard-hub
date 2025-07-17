import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
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

const ProtectedLayoutRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />

      <Route element={<ProtectedLayoutRoute />}>
        <Route path="/dashboard/general" element={<DashboardGeneral />} />
        <Route path="/dashboard/iren-norte" element={<DashboardIrenNorte />} />
        <Route path="/dashboard/iren-sur" element={<DashboardIrenSur />} />
        <Route path="/dashboard/la-caleta" element={<DashboardLaCaleta />} />
        <Route path="/dashboard/lanatta" element={<DashboardLanatta />} />
        <Route path="/dashboard/plan-mil" element={<DashboardPlanMil />} />
        <Route path="/dashboard/clickup" element={<DashboardClickUp />} />
        
        <Route path="/dashboard" element={<Navigate to="/dashboard/general" replace />} />
      </Route>

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
        {/* 👇 AQUÍ ESTÁ EL ÚNICO CAMBIO REALIZADO 👇 */}
        <BrowserRouter basename="/anin-dashboard-hub">
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;