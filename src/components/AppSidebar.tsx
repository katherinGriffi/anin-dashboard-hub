
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  MapPin, 
  Compass, 
  Anchor, 
  Ship, 
  Zap,
  LogOut,
  Shield
} from 'lucide-react';

// Configuración de rutas de dashboards
const dashboardItems = [
  { 
    title: 'Gestión General', 
    url: '/dashboard/general', 
    icon: BarChart3,
    description: 'Vista general de actividades'
  },
  { 
    title: 'IREN Norte', 
    url: '/dashboard/iren-norte', 
    icon: Compass,
    description: 'Dashboard IREN Norte'
  },
  { 
    title: 'IREN Sur', 
    url: '/dashboard/iren-sur', 
    icon: MapPin,
    description: 'Dashboard IREN Sur'
  },
  { 
    title: 'La Caleta', 
    url: '/dashboard/la-caleta', 
    icon: Anchor,
    description: 'Dashboard La Caleta'
  },
  { 
    title: 'Lanatta', 
    url: '/dashboard/lanatta', 
    icon: Ship,
    description: 'Dashboard Lanatta'
  },
  { 
    title: 'Plan Mil', 
    url: '/dashboard/plan-mil', 
    icon: Zap,
    description: 'Dashboard Plan Mil'
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/20 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground";

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-border/50`}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Header con logo */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="anin-logo text-xl">ANIN</h1>
                <p className="text-xs text-muted-foreground">Dashboard System</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu de dashboards */}
        <div className="flex-1 overflow-auto">
          <SidebarGroup>
            <SidebarGroupLabel className={isCollapsed ? "hidden" : ""}>
              Dashboards
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {dashboardItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={getNavClass}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
                        {!isCollapsed && (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{item.title}</span>
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer con logout */}
        <div className="p-4 border-t border-border/50">
          <Button
            onClick={handleLogout}
            variant="outline"
            size={isCollapsed ? "icon" : "default"}
            className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
            title={isCollapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`} />
            {!isCollapsed && "Cerrar Sesión"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
