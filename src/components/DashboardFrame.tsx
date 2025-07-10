
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
    <div className="h-full flex flex-col bg-card">
      {/* Header del dashboard */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        <Button
          onClick={openInNewTab}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir en nueva pestaña
        </Button>
      </div>

      {/* Contenido del iframe */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando dashboard...</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
            <Alert className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="mt-2">
                No se pudo cargar el dashboard. Verifique la URL en el código fuente.
                <br />
                <span className="text-xs text-muted-foreground mt-2 block">
                  URL actual: {dashboardUrl}
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
