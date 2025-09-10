import { useState } from 'react'; // 👈 PASO 1: Importar useState
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import logoAnin from '@/anin.png';
import {
  LayoutGrid,
  CheckSquare,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Hospital,
  HousePlugIcon,
  HousePlus,
  CuboidIcon,
  GlassWaterIcon,
  PenToolIcon,
  Ship,FileArchive,FileBadge, FileBox, Construction, ChevronDown, BarChart2Icon, LucideHospital,LineChartIcon,
  LucideFileArchive,
  CircuitBoard
  
} from 'lucide-react';
import { table } from 'console';

// Interfaz de propiedades
interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  className?: string;
}

// 👇 PASO 3: Nueva estructura de datos para el menú
const menuItems = [
 
  {
    title: 'GESTIÓN',
    icon: LayoutGrid,
    subItems: [
  
      { title: 'GESTIÓN SGD', url: '/dashboard/gestionsgd', icon: PenToolIcon },
       { title: 'GESTION OS', url: '/dashboard/gestionos', icon:  FileBox},
    ]
  },
  {
    title: 'PROYECTOS SALUD',
    icon: LucideHospital,
    subItems: [
      { title: 'SEGUIMIENTO DE ACTIVIDADES', url: '/dashboard/general', icon: BarChart2Icon },
      { title: 'LA CALETA', url: '/dashboard/la-caleta', icon: Hospital },
      { title: 'PLAN MIL', url: '/dashboard/plan-mil', icon: CuboidIcon },
      { title: 'IREN NORTE', url: '/dashboard/iren-norte', icon: HousePlugIcon },
      { title: 'IREN SUR', url: '/dashboard/iren-sur', icon: HousePlus },
     
     // { title: 'DRENAJE PIURA', url: '/dashboard/drenaje_piura', icon: GlassWaterIcon },
    ]
  },
 {
    title: 'PROYECTOS SI',
    icon: Construction,
    subItems: [
      //{ title: 'SEGUIMIENTO DE ACTIVIDADES', url: '/dashboard/general', icon: BarChart2Icon },
      //{ title: 'LA CALETA', url: '/dashboard/la-caleta', icon: Hospital },
       
     { title: 'DRENAJE PIURA', url: '/dashboard/drenajepiura', icon: GlassWaterIcon },
    ]
  },

  {
    title: 'PROYECTOS LINEALES',
    icon: LineChartIcon,
    subItems: [
      //{ title: 'SEGUIMIENTO DE ACTIVIDADES', url: '/dashboard/general', icon: BarChart2Icon },
      //{ title: 'LA CALETA', url: '/dashboard/la-caleta', icon: Hospital },
       
     { title: 'CANAL MIGUEL CHECA', url: '/dashboard/checa', icon: CircuitBoard },
    ]
  },

  { 
    title: 'ClickUp', 
    url: '/dashboard/clickup', 
    icon: CheckSquare 
  },
];


export function AppSidebar({ isCollapsed, setIsCollapsed, className }: AppSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // 👇 PASO 4: Estado para controlar qué menús están abiertos
  // Por defecto, abrimos el menú 'PROYECTOS'
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    'PROYECTOS': true,
  });

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center w-full p-3 gap-3 transition-colors duration-200 rounded-lg",
      isCollapsed ? "justify-center" : "",
      isActive
        ? "bg-primary/20 text-primary font-semibold"
        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground neon-hover"
    );
  
  const getSubNavClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center w-full p-2 gap-3 transition-colors duration-200 rounded-lg text-sm",
      isCollapsed ? "justify-center" : "pl-8", // Añade más padding a la izquierda
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
    );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={cn("hidden md:flex flex-col fixed inset-y-0 z-50 bg-sidebar", className)}>
      {/* Cabecera del Sidebar */}
      <div className={cn(
        "flex items-center border-b border-border/30 h-16 px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <img src={logoAnin} alt="Logo ANIN" className="h-14 w-18 mr-9" />
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
      </div>

      {/* 👇 PASO 5: Lógica de renderizado actualizada */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
        {menuItems.map((item) => (
          item.subItems && !isCollapsed ? (
            // Si el item tiene sub-items y la barra no está colapsada
            <div key={item.title}>
              <button
                onClick={() => toggleMenu(item.title)}
                className="flex items-center justify-between w-full p-3 gap-3 rounded-lg text-muted-foreground hover:bg-accent/30 hover:text-foreground"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-semibold">{item.title}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openMenus[item.title] ? 'rotate-180' : '')} />
              </button>
              {openMenus[item.title] && (
                <div className="pl-4 mt-1 space-y-1">
                  {item.subItems.map(subItem => (
                    <NavLink
                      key={subItem.title}
                      to={subItem.url}
                      end
                      className={getSubNavClass}
                    >
                      <subItem.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{subItem.title}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Si es un item normal o la barra está colapsada
            <NavLink
              key={item.title}
              to={item.url || '#'} // Usamos '#' si es un menú padre colapsado
              end
              className={getNavClass}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.title}</span>}
            </NavLink>
          )
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