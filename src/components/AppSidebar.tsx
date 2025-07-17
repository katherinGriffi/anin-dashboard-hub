import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import logoAnin from '@/anin.png'; 
import {
  LayoutGrid,
  Compass,
  MapPin,
  Anchor,
  Ship,
  Zap,
  CheckSquare,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  HospitalIcon,
  HousePlugIcon,
  HousePlus,
  Hospital,
  HouseIcon,
  SquareActivityIcon,
  CuboidIcon
} from 'lucide-react';

// Interfaz de propiedades que el componente espera recibir
interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  className?: string;
}

// Configuración de los elementos del menú de navegación
const dashboardItems = [
  { title: 'GESTION DE ACTIVIDADES', url: '/dashboard/general', icon: LayoutGrid },
  { title: 'PLAN MIL', url: '/dashboard/plan-mil', icon: CuboidIcon },
   { title: 'LA CALETA', url: '/dashboard/la-caleta', icon: Hospital },
 { title: 'IREN NORTE', url: '/dashboard/iren-norte', icon: HousePlugIcon },
  { title: 'IREN SUR', url: '/dashboard/iren-sur', icon: HousePlus },
   { title: 'LANATTA', url: '/dashboard/lanatta', icon: HouseIcon },
 { title: 'ClickUp', url: '/dashboard/clickup', icon: CheckSquare },
];

export function AppSidebar({ isCollapsed, setIsCollapsed, className }: AppSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center w-full p-3 gap-3 transition-colors duration-200 rounded-lg",
      isCollapsed ? "justify-center" : "",
      isActive
        ? "bg-primary/20 text-primary font-semibold"
        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground neon-hover"
    );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={cn(
      "hidden md:flex flex-col fixed inset-y-0 z-50 bg-sidebar", 
      className
    )}>
      {/* Cabecera del Sidebar */}
      <div className={cn(
        "flex items-center border-b border-border/30 h-16 px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        
        {/* ✨ LOGO AÑADIDO AQUÍ ✨ */}
       {!isCollapsed && (
  <img 
    // 👇 CAMBIA ESTA LÍNEA 👇
    src={logoAnin} 
    alt="Logo ANIN" 
    className="h-14 w-18  mr-9"
  />
)}
        
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2">
        {dashboardItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end
            className={getNavClass}
            title={isCollapsed ? item.title : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Pie del Sidebar con el botón de Logout */}
      <div className="p-3 mt-auto border-t border-border/30">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-center hover:bg-destructive/20 hover:text-destructive"
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Cerrar Sesión"}
        </Button>
      </div>
    </aside>
  );
}