
import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header con trigger para mobile */}
          <header className="h-14 flex items-center justify-between px-4 border-b border-border/50 bg-card/50 backdrop-blur-sm lg:hidden">
            <SidebarTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SidebarTrigger>
            
            <h1 className="anin-logo text-lg">ANIN</h1>
            <div className="w-8" /> {/* Spacer for centering */}
          </header>

          {/* Contenido principal */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
