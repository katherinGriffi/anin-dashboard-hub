// --- IMPORTACIONES ---
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "sonner";
import { LayoutDashboard, Users, FolderKanban, FileText, LogOut, LogIn } from "lucide-react";

// --- IMPORTACIONES DE TUS COMPONENTES DE PESTAÑAS ---
import { DashboardTab } from '@/components/DashboardTab';
import { ProyectosTab } from '@/components/ProyectosTab';
import { PersonasTab } from '@/components/PersonasTab';
import { GestionOSTab } from '@/components/GestionOSTab';

// --- DECLARACIONES GLOBALES ---
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// --- VARIABLES DE ENTORNO ---
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// ===================================================================================
// --- COMPONENTE PRINCIPAL ---
// ===================================================================================
export default function GestionOS() {
  // --- ESTADOS ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [osList, setOsList] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]); 
  const [activeTab, setActiveTab] = useState("dashboard");
  const [proyectosSheetId, setProyectosSheetId] = useState<number | null>(null);
  const [personasSheetId, setPersonasSheetId] = useState<number | null>(null)

  // --- LÓGICA DE AUTENTICACIÓN Y DATOS ---
  const handleLogout = useCallback((showToast = true) => {
    const token = window.gapi?.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        window.gapi.client.setToken(null);
        setIsLoggedIn(false);
        setProyectos([]); setPersonas([]); setOsList([]); setRoles([]); // ✅ LIMPIAR ROLES
        if (showToast) toast.info("Has cerrado sesión.");
      });
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const cargarDatos = useCallback(async () => {
    if (!window.gapi?.client.getToken()) {
      setIsLoggedIn(false);
      return;
    }
    setLoading(true);
    try {
      // ✅ SOLUCIÓN ELIMINAR: 1. Obtenemos los metadatos del spreadsheet
      const metaDataResponse = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      const sheets = metaDataResponse.result.sheets;

      // Buscamos la pestaña "Proyectos" y "Personas" por su nombre y guardamos su ID real
      const proyectosSheet = sheets.find(s => s.properties.title === "Proyectos");
      const personasSheet = sheets.find(s => s.properties.title === "Personas");

      if (!proyectosSheet || !personasSheet) {
        toast.error("Error: No se encontraron las pestañas 'Proyectos' o 'Personas'.");
        setLoading(false);
        return;
      }
      setProyectosSheetId(proyectosSheet.properties.sheetId);
      setPersonasSheetId(personasSheet.properties.sheetId);

      // 2. Ahora sí, cargamos los valores de las celdas
      const ranges = ["Proyectos!A2:F", "Personas!A2:H", "OS!A2:K", "Roles!A2:A"];
      const response = await window.gapi.client.sheets.spreadsheets.values.batchGet({ spreadsheetId: SPREADSHEET_ID, ranges });
      const [proyectosData, personasData, osData, rolesData] = response.result.valueRanges.map((r) => r.values || []);

      setProyectos(proyectosData.map((row, index) => ({ id: parseInt(row[0]), nombre: row[1], activo: row[2] === "TRUE", inicio: row[3], fin: row[4], descripcion: row[5], rowIndex: index + 2 })));
      setPersonas(personasData.map((row, index) => ({ id: parseInt(row[0]), nombre: row[1], apellido: row[2], email: row[3], activo: row[4] === "TRUE", rol: row[5], nro_celular: row[6] || "", valor: row[7] || "", rowIndex: index + 2 })));
setOsList(osData.map((row) => ({ 
    id: row[0], 
    personaId: parseInt(row[1]), 
    proyectoId: parseInt(row[2]), 
    tipoContrato: row[3], 
    duracion: parseInt(row[4]), 
    fechaNotificacion: row[5], 
    fechaFin: row[6], 
    primerEntregable: row[7], 
    segundoEntregable: row[8], 
    tercerEntregable: row[9], 
    activa: row[10] === "TRUE",
    areaCargo: row[11], // Nuevo
    condicion: row[12]  // Nuevo
})));
      const rolesValidos = rolesData.filter(row => row && row[0] && row[0].trim() !== "");
      setRoles(rolesValidos.map(row => ({ nombre: row[0] })));

    } catch (err) {
      console.error("Error cargando datos:", err);
      toast.error("Error al cargar los datos. Sesión expirada.");
      handleLogout(false);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  const initializeGoogleClients = useCallback(async () => {
    const loadScript = (src: string) => new Promise(resolve => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      document.body.appendChild(script);
    });
    await Promise.all([loadScript("https://apis.google.com/js/api.js"), loadScript("https://accounts.google.com/gsi/client")]);
    await new Promise<void>(resolve => window.gapi.load("client", resolve));
    await window.gapi.client.init({ apiKey: API_KEY });
    await window.gapi.client.load("sheets", "v4");
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          window.gapi.client.setToken({ access_token: tokenResponse.access_token });
          setIsLoggedIn(true);
          await cargarDatos();
        }
      },
    });
    setTokenClient(client);
    setLoading(false);
  }, [cargarDatos]);

  useEffect(() => {
    initializeGoogleClients();
  }, [initializeGoogleClients]);

  useEffect(() => {
    document.body.classList.add('theme-clean-light');
    return () => {
      document.body.classList.remove('theme-clean-light');
    };
  }, []);

  const handleLogin = () => tokenClient?.requestAccessToken({ prompt: '' });

  const ensureAccessToken = useCallback(async () => {
    if (!window.gapi?.client.getToken()) {
      return new Promise<void>((resolve, reject) => {
        if (tokenClient) {
          tokenClient.callback = (resp: any) => {
            if (resp.error) return reject(new Error("No se pudo obtener el token de acceso."));
            resolve();
          };
          tokenClient.requestAccessToken();
        } else {
          reject(new Error("Cliente de token no inicializado."));
        }
      });
    }
  }, [tokenClient]);

  const ejecutarOperacion = async (operacion: () => Promise<any>, { successMessage, errorMessage }: { successMessage: string; errorMessage: string }) => {
    try {
      await ensureAccessToken();
      await operacion();
      toast.success(successMessage);
      await cargarDatos();
    } catch (error) {
      console.error(errorMessage, error);
      toast.error(errorMessage);
    }
  };

  // --- FUNCIONES CRUD COMPLETAS ---
  // Proyectos
  const registrarProyecto = (data) => ejecutarOperacion(async () => { const id = proyectos.length > 0 ? Math.max(...proyectos.map(p => p.id)) + 1 : 1; const values = [[id, data.nombre, data.activo, data.inicio, data.fin, data.descripcion]]; await window.gapi.client.sheets.spreadsheets.values.append({ spreadsheetId: SPREADSHEET_ID, range: "Proyectos!A:F", valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS", resource: { values } }); }, { successMessage: "Proyecto registrado.", errorMessage: "Error al registrar proyecto." });
  const handleEditarProyecto = (proyectoEditado) => ejecutarOperacion(async () => { if (!proyectoEditado.rowIndex) throw new Error("Proyecto sin rowIndex, no se puede editar."); const values = [[proyectoEditado.id, proyectoEditado.nombre, proyectoEditado.activo, proyectoEditado.inicio, proyectoEditado.fin, proyectoEditado.descripcion]]; await window.gapi.client.sheets.spreadsheets.values.update({ spreadsheetId: SPREADSHEET_ID, range: `Proyectos!A${proyectoEditado.rowIndex}:F${proyectoEditado.rowIndex}`, valueInputOption: "USER_ENTERED", resource: { values } }); }, { successMessage: "Proyecto actualizado.", errorMessage: "Error al actualizar proyecto." });
  const handleEliminarProyecto = (proyectoAEliminar: any) => ejecutarOperacion(async () => { if (!proyectoAEliminar.rowIndex) throw new Error("Proyecto sin rowIndex, no se puede eliminar."); if (proyectos.length === 1) { await window.gapi.client.sheets.spreadsheets.values.clear({ spreadsheetId: SPREADSHEET_ID, range: `Proyectos!A${proyectoAEliminar.rowIndex}:F${proyectoAEliminar.rowIndex}` }); } else { const sheetId = 0; await window.gapi.client.sheets.spreadsheets.batchUpdate({ spreadsheetId: SPREADSHEET_ID, resource: { requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: proyectoAEliminar.rowIndex - 1, endIndex: proyectoAEliminar.rowIndex } } }] } }); } }, { successMessage: "Proyecto eliminado.", errorMessage: "Error al eliminar proyecto." });

  // Personas
  // ✅ ACTUALIZADO para escribir los 8 campos (A:H)
const registrarPersona = (data) => ejecutarOperacion(
  async () => {
    const id = personas.length > 0 ? Math.max(...personas.map(p => p.id)) + 1 : 1;
    // ✅ ORDEN CORREGIDO: Se intercambió data.rol y data.activo para que coincidan con las columnas de la hoja.
    const values = [[id, data.nombre, data.apellido, data.email,data.nro_celular, data.activo, data.rol, data.valor]];
    await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Personas!A:H", // Asegúrate que el rango cubra hasta la columna H
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: { values }
    });
  },
  { successMessage: "Persona registrada.", errorMessage: "Error al registrar persona." }
);
const handleEditarPersona = (personaEditada) => ejecutarOperacion(
  async () => {
    if (!personaEditada.rowIndex) throw new Error("Persona sin rowIndex.");

    const values = [[personaEditada.id, personaEditada.nombre, personaEditada.apellido, personaEditada.email, personaEditada.activo, personaEditada.rol, personaEditada.nro_celular, personaEditada.valor]];
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Personas!A${personaEditada.rowIndex}:H${personaEditada.rowIndex}`, // Asegúrate que el rango cubra hasta la H
      valueInputOption: "USER_ENTERED",
      resource: { values }
    });
  },
  { successMessage: "Persona actualizada.", errorMessage: "Error al actualizar persona." }
);

const handleEliminarPersona = (personaAEliminar: any) => ejecutarOperacion(
    async () => {
      if (!personaAEliminar.rowIndex) throw new Error("Persona sin rowIndex.");
      if (personas.length === 1) {
        await window.gapi.client.sheets.spreadsheets.values.clear({ spreadsheetId: SPREADSHEET_ID, range: `Personas!A${personaAEliminar.rowIndex}:H${personaAEliminar.rowIndex}` });
      } else {
        // ✅ SOLUCIÓN ELIMINAR: 3. Usamos el ID real guardado en el estado
        if (personasSheetId === null) throw new Error("ID de la hoja 'Personas' no encontrado.");
        await window.gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          resource: { requests: [{ deleteDimension: { range: { sheetId: personasSheetId, dimension: "ROWS", startIndex: personaAEliminar.rowIndex - 1, endIndex: personaAEliminar.rowIndex } } }] }
        });
      }
    },
    { successMessage: "Persona eliminada.", errorMessage: "Error al eliminar persona." }
  );


  // Órdenes de Servicio
  const registrarOS = (data) => ejecutarOperacion(
  async () => {
    let finalId = data.id;
    if (!finalId) {
      const nextIdNumber = osList.length > 0 ? Math.max(...osList.map(os => parseInt(os.id.split('-')[1], 10) || 0)) + 1 : 1;
      finalId = `OS-${String(nextIdNumber).padStart(3, '0')}`;
    }

    // Lógica para guardar la condición correcta (si es "Otros", guarda el texto, si no, guarda la opción)
    const condicionFinal = data.condicion === 'Otros' ? data.condicionOtros : data.condicion;

    // Array de valores actualizado con los nuevos campos al final
    const values = [[
        finalId, 
        data.personaId, 
        data.proyectoId, 
        data.tipoContrato, 
        data.duracion, 
        data.fechaInicio, // Asumiendo que esta es la fecha de notificación
        data.fechaFin, 
        data.primerEntregable, 
        data.segundoEntregable, 
        data.tercerEntregable, 
        true, // activa
        data.areaCargo, // Nuevo campo
        condicionFinal   // Nuevo campo
    ]];
    
    // Rango actualizado para escribir hasta la columna M
    await window.gapi.client.sheets.spreadsheets.values.append({ 
        spreadsheetId: SPREADSHEET_ID, 
        range: "OS!A:M", 
        valueInputOption: "USER_ENTERED", 
        insertDataOption: "INSERT_ROWS", 
        resource: { values } 
    });
  },
  { successMessage: "Orden de Servicio registrada.", errorMessage: "Error al registrar la OS." }
);
  // --- RENDERIZADO CONDICIONAL ---
  if (!isLoggedIn) {
    return (
      <div> 
        <Toaster richColors position="top-center" />
        <div className="min-h-screen bg-secondary">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-screen">
          <header className="flex items-center h-16 px-4 md:px-8 bg-background border-b shadow-sm flex-shrink-0">
            {/* ... Header content ... */}
          <div className="flex h-screen items-center justify-center bg-secondary p-4">
            <Card className="max-w-md w-full text-center p-8 shadow-lg border">
              <h1 className="text-2xl font-bold text-foreground mb-2">Sistema de Gestión DEO</h1>
              <p className="text-muted-foreground mb-6">Inicia sesión con Google para continuar</p>
            
              <Button onClick={handleLogin} size="lg" className="w-full" disabled={loading}>
                <LogIn className="mr-2 h-5 w-5" />
                {loading ? "Inicializando..." : "Iniciar Sesión con Google"}
              </Button>
            </Card>
          </div>
            </header>
          </Tabs>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
        <div className="theme-clean-light">
          <div className="h-screen bg-background p-4 md:p-8">
            <header className="h-16 flex items-center border-b mb-8">
              <Skeleton className="h-8 w-32" />
              <div className="flex-grow flex justify-center">
                <Skeleton className="h-10 w-96" />
              </div>
              <Skeleton className="h-10 w-32" />
            </header>
            <main>
              <Skeleton className="h-[70vh] w-full rounded-xl" />
            </main>
          </div>
        </div>
    );
  }

  const navItems = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "proyectos", label: "Proyectos", icon: FolderKanban },
    { value: "personas", label: "Personas", icon: Users },
    { value: "os", label: "Órdenes de Servicio", icon: FileText },
  ];

  return (
    <div className="theme-clean-light">
      <Toaster richColors position="top-center" />
      <div className="min-h-screen bg-secondary">
        <Tabs defaultValue="dashboard" className="flex flex-col h-screen">
          <header className="flex items-center h-16 px-4 md:px-8 bg-background border-b shadow-sm flex-shrink-0">
            <h1 className="text-xl font-bold text-foreground hidden md:block">Gestión DEO</h1>
            <div className="flex-grow flex justify-center md:ml-10">
              <TabsList>
                {navItems.map(item => (
                  <TabsTrigger key={item.value} value={item.value} className="gap-2 px-4">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <Button onClick={() => handleLogout(true)} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </header>

          <main className="w-full">
            <TabsContent value="dashboard">
              <DashboardTab proyectos={proyectos} personas={personas} osList={osList} />
            </TabsContent>
            <TabsContent value="proyectos">
              <ProyectosTab proyectos={proyectos} onRegistrarProyecto={registrarProyecto} onEditarProyecto={handleEditarProyecto} onEliminarProyecto={handleEliminarProyecto} />
            </TabsContent>
            <TabsContent value="personas">
              {/* ✅ SE PASA LA PROP roles AL COMPONENTE */}
              <PersonasTab 
                roles={roles} 
                personas={personas} 
                onRegistrarPersona={registrarPersona} 
                onEditarPersona={handleEditarPersona} 
                onEliminarPersona={handleEliminarPersona} 
              />
            </TabsContent>
            <TabsContent value="os">
              <GestionOSTab osList={osList} personas={personas} proyectos={proyectos} onRegistrarOS={registrarOS} />
            </TabsContent>
          </main>
        </Tabs>
      </div>
    </div>
  );
}