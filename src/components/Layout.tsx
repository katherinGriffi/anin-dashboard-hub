import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-72';
  const mainContentPadding = isCollapsed ? 'md:pl-20' : 'md:pl-72';
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        
        <AppSidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
          className={`${sidebarWidth} transition-all duration-300`}
        />

        <div className="flex flex-1 flex-col">
          <header className={`fixed top-0 right-0 z-40 h-16 glass-header transition-all duration-300 md:left-0 ${mainContentPadding}`}>
            <div className="flex h-full items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden p-2 -ml-2">
                  <Menu className="h-8 w-8" />
                </SidebarTrigger>

               <h1 className="text-xl font-semibold hidden md:block">
                  DEO
                </h1>
              </div>

              <Button 




                variant="ghost" 
                size="icon"
                className="rounded-full neon-hover"
              >
                <User className="h-8 w-8" />
              </Button>
            </div>
          </header>

          <div className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${mainContentPadding}`}>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 fade-in">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;