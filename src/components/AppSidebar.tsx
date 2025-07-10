
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
  LayoutGrid, 
  Compass, 
  MapPin, 
  Anchor, 
  Ship, 
  Zap,
  CheckSquare,
  LogOut,
  ChevronRight
} from 'lucide-react';

// Configuración de rutas de dashboards con nuevos iconos modernos
const dashboardItems = [
  { 
    title: 'Gestión General', 
    url: '/dashboard/general', 
    icon: LayoutGrid,
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
  { 
    title: 'ClickUp', 
    url: '/dashboard/clickup', 
    icon: CheckSquare,
    description: 'Gestión de proyectos ClickUp'
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
      ? "bg-primary/20 text-primary font-medium border-r-2 border-primary pulse-neon rounded-lg" 
      : "hover:bg-accent/30 text-muted-foreground hover:text-foreground neon-hover rounded-lg";

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-72"} smooth-transition glass-sidebar fixed left-0 top-16 h-[calc(100vh-4rem)] z-40`}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col h-full pt-6">
        {/* Menu de dashboards */}
        <div className="flex-1 overflow-auto px-3">
          <SidebarGroup>
            <SidebarGroupLabel className={`${isCollapsed ? "hidden" : "px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"}`}>
              Dashboards
            </SidebarGroupLabel>

            <SidebarGroupContent className="mt-2">
              <SidebarMenu className="space-y-2">
                {dashboardItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={getNavClass}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <div className="flex items-center gap-3 p-3 w-full">
                          <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""}`} />
                          {!isCollapsed && (
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium">{item.title}</span>
                              <span className="text-xs text-muted-foreground/80">{item.description}</span>
                            </div>
                          )}
                          {!isCollapsed && isActive(item.url) && (
                            <ChevronRight className="h-4 w-4 ml-auto" />
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer con logout */}
        <div className="p-4 border-t border-border/30">
          <Button
            onClick={handleLogout}
            variant="outline"
            size={isCollapsed ? "icon" : "default"}
            className="w-full hover:bg-destructive/20 hover:text-destructive hover:border-destructive/40 smooth-transition neon-hover"
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
