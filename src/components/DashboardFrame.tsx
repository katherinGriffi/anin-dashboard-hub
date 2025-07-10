
import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardFrameProps {
  title: string;
  description: string;
  // TODO: Reemplazar con la URL real del dashboard
  url?: string;
}

const DashboardFrame = ({ title, description, url }: DashboardFrameProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // TODO: Reemplazar esta URL de ejemplo con la URL real del dashboard
  const dashboardUrl = url || "https://www.example.com";

  useEffect(() => {
    // Simular tiempo de carga
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const openInNewTab = () => {
    window.open(dashboardUrl, '_blank');
  };

  return (
    <div className="h-full flex flex-col m-4">
      {/* Header del dashboard con glassmorphism */}
      <div className="glass-effect rounded-t-xl p-6 border-b-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          
          <Button
            onClick={openInNewTab}
            variant="outline"
            size="sm"
            className="neon-hover border-primary/30 hover:border-primary"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir en nueva pestaña
          </Button>
        </div>
      </div>

      {/* Contenido del iframe con glassmorphism */}
      <div className="flex-1 relative glass-effect rounded-b-xl border-t-0 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-md z-10 rounded-b-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-primary/20"></div>
              </div>
              <p className="text-muted-foreground font-medium">Cargando dashboard...</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10 rounded-b-xl">
            <Alert className="max-w-md glass-effect border-destructive/30">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="mt-2">
                <span className="font-medium">No se pudo cargar el dashboard.</span>
                <br />
                Verifique la URL en el código fuente.
                <br />
                <span className="text-xs text-muted-foreground mt-2 block font-mono">
                  URL: {dashboardUrl}
                </span>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* TODO: Configurar la URL real del dashboard aquí */}
        <iframe
          src={dashboardUrl}
          className="dashboard-iframe"
          title={title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default DashboardFrame;
