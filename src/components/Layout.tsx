
import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Header Fijo Superior */}
        <header className="fixed top-0 left-0 right-0 h-16 z-50 glass-header">
          <div className="flex items-center justify-between h-full px-6">
            {/* Logo ANIN a la izquierda */}
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <div className="flex items-center gap-3">
                {/* TODO: Reemplazar con logo real de ANIN */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  A
                </div>
                <h1 className="anin-logo hidden sm:block">ANIN</h1>
              </div>
            </div>

            {/* Ícono de perfil a la derecha */}
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full neon-hover"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Sidebar */}
        <AppSidebar />
        
        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col pt-16">
          <main className="flex-1 overflow-hidden fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
