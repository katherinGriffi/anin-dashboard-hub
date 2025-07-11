import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const DashboardClickUp = () => {
  // URL para el botón que abre la aplicación completa de ClickUp
  const clickUpAppUrl = "https://app.clickup.com/90131815064/v/l/2ky4cpmr-173";

  return (
    // Contenedor principal para centrar la tarjeta vertical y horizontalmente
    <div className="flex items-center justify-center w-full h-full min-h-[70vh]">
      
      {/* Tarjeta de acción */}
      <div className="flex flex-col items-center max-w-md p-8 text-center border rounded-lg shadow-lg bg-card">
        
        <h1 className="text-2xl font-bold">
          Control de Actividades
        </h1>

        <p className="mt-2 text-muted-foreground">
          Haz clic en el botón para acceder a la gestión de proyectos y tareas en la aplicación completa de ClickUp.
        </p>

        <a
          href={clickUpAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6"
        >
          <Button size="lg">
            <ExternalLink className="w-5 h-5 mr-2" />
            Ir a ClickUp
          </Button>
        </a>
      </div>
    </div>
  );
};

export default DashboardClickUp;