import React, { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// --- CAMBIO: Se importan nuevos íconos para el ordenamiento ---
import { FileText, Users, Search, Calendar, Plus, User, Building, ArrowUpDown } from 'lucide-react';

export function GestionOSTab({ osList = [], personas = [], proyectos = [], onRegistrarOS }) {
  const initialState = {
    personaId: '',
    proyectoId: '',
    tipoContrato: '',
    duracion: '',
    fechaInicio: '',
    fechaFin: '',
    primerEntregable: '',
    segundoEntregable: '',
    tercerEntregable: '',
    areaCargo: '',
    condicion: '',
    condicionOtros: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [showModal, setShowModal] = useState(false);
  const [filtro, setFiltro] = useState("");
  
  // --- CAMBIO: Estado para manejar la configuración del ordenamiento ---
  const [sortConfig, setSortConfig] = useState({ key: 'diasRestantes', direction: 'ascending' });

  // --- Funciones del Modal (sin cambios) ---
  const handleSubmit = (e) => { e.preventDefault(); onRegistrarOS(formData); setFormData(initialState); setShowModal(false); };
  const openModal = () => setShowModal(true);
  const closeModal = () => { setShowModal(false); setFormData(initialState); };
  
  // --- Funciones de Cálculo (sin cambios) ---
  const calcularDiasRestantes = (fechaFin) => {
    if (!fechaFin) return null;
    const hoy = new Date();
    const fin = new Date(fechaFin + 'T23:59:59');
    const diffTime = fin.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const getEstadoFechaBadge = (diasRestantes) => { if (diasRestantes === null) return { variant: 'secondary' }; if (diasRestantes < 0) return { variant: 'destructive' }; if (diasRestantes <= 7) return { variant: 'warning' }; return { variant: 'success' }; };
  const getEstadoOS = (diasRestantes, tipoContrato) => { if (tipoContrato === 'CAS') { return { text: 'Vigente', variant: 'success' }; } if (diasRestantes === null) { return { text: 'Indefinido', variant: 'secondary' }; } if (diasRestantes < 0) { return { text: 'No Vigente', variant: 'destructive' }; } return { text: 'Vigente', variant: 'success' }; };

  // --- CAMBIO: Lógica de ordenamiento y filtrado optimizada ---
  const sortedAndFilteredOsList = useMemo(() => {
    // 1. Enriquece la lista con los datos necesarios para evitar búsquedas repetidas
    const enrichedList = osList.map(os => {
      const persona = personas.find(p => p.id === os.personaId);
      const proyecto = proyectos.find(p => p.id === os.proyectoId);
      return {
        ...os,
        personaNombre: persona ? `${persona.nombre} ${persona.apellido}` : '',
        proyectoNombre: proyecto ? proyecto.nombre : '',
        diasRestantes: calcularDiasRestantes(os.fechaFin)
      };
    });

    // 2. Filtra la lista enriquecida
    const filtered = enrichedList.filter(os => {
      const searchStr = filtro.toLowerCase();
      return (
        (os.id && os.id.toString().toLowerCase().includes(searchStr)) ||
        os.personaNombre.toLowerCase().includes(searchStr) ||
        os.proyectoNombre.toLowerCase().includes(searchStr) ||
        (os.tipoContrato && os.tipoContrato.toLowerCase().includes(searchStr))
      );
    });

    // 3. Ordena la lista filtrada
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        // Manejo de nulos para que siempre vayan al final
        if (valA === null) return 1;
        if (valB === null) return -1;
        
        let comparison = 0;
        if (valA > valB) {
          comparison = 1;
        } else if (valA < valB) {
          comparison = -1;
        }
        
        return sortConfig.direction === 'descending' ? comparison * -1 : comparison;
      });
    }
    
    return filtered;
  }, [osList, personas, proyectos, filtro, sortConfig]);

  // --- CAMBIO: Función para manejar el clic en las cabeceras ---
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // --- CAMBIO: Componente auxiliar para las cabeceras ordenables ---
  const SortableHeader = ({ children, columnKey }) => {
    const isSorting = sortConfig.key === columnKey;
    const directionIcon = sortConfig.direction === 'ascending' ? '🔼' : '🔽';
    return (
      <TableHead className="font-semibold cursor-pointer hover:bg-secondary/50" onClick={() => handleSort(columnKey)}>
        <div className="flex items-center gap-2">
          {children}
          {isSorting ? <span>{directionIcon}</span> : <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </TableHead>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header y Buscador (sin cambios) */}
      <Card className="shadow-sm border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full"><FileText className="h-6 w-6 text-primary" /></div>
              <div>
                <CardTitle className="text-primary">Gestión de Órdenes de Servicio</CardTitle>
                <CardDescription>{osList.length} orden(es) de servicio registrada(s)</CardDescription>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar OS, persona o proyecto..." className="pl-9 bg-background/50" value={filtro} onChange={e => setFiltro(e.target.value)} />
              </div>
              <Button onClick={openModal} className="shrink-0"><Plus className="mr-2 h-4 w-4" /> Nueva OS</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabla de Órdenes de Servicio */}
      <Card className="shadow-sm border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/20 hover:bg-secondary/30">
                  <TableHead className="font-semibold">ID</TableHead>
                  {/* --- CAMBIO: Cabeceras ahora son ordenables --- */}
                  <SortableHeader columnKey="personaNombre">Persona</SortableHeader>
                  <SortableHeader columnKey="proyectoNombre">Proyecto</SortableHeader>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold">Fecha Fin</TableHead>
                  <SortableHeader columnKey="diasRestantes">Días Restantes</SortableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredOsList.length > 0 ? (
                  sortedAndFilteredOsList.map((os) => {
                    const estadoOS = getEstadoOS(os.diasRestantes, os.tipoContrato);
                    return (
                      <TableRow key={os.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-medium text-primary">{os.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{os.personaNombre || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{os.proyectoNombre || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={os.tipoContrato === 'OS' ? 'default' : 'secondary'} className="font-medium">{os.tipoContrato}</Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant={estadoOS.variant} className="capitalize">{estadoOS.text}</Badge>
                        </TableCell>
                        <TableCell>
                          {os.fechaFin ? new Date(os.fechaFin + 'T05:00:00').toLocaleDateString('es-PE', { timeZone: 'America/Lima' }) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {os.diasRestantes !== null && os.diasRestantes < 0 ? (
                            <span className="text-sm text-muted-foreground">Finalizado</span>
                          ) : os.diasRestantes !== null ? (
                            <Badge variant={getEstadoFechaBadge(os.diasRestantes).variant}>{os.diasRestantes} días</Badge>
                          ) : (
                            <Badge variant="secondary">N/A</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground bg-secondary/10">
                      {filtro ? 'No se encontraron órdenes de servicio con ese criterio.' : 'No hay órdenes de servicio registradas aún.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Modal de Registro */}
      <Dialog open={showModal} onOpenChange={(isOpen) => !isOpen && closeModal()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-sm border-0 shadow-xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Registrar Nueva Orden de Servicio
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Complete los datos para crear una nueva orden de servicio en el sistema.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Sección de Información Básica */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2">
                <FileText className="h-4 w-4" />
                Información Básica
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Persona *</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, personaId: value })} required>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Seleccionar persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.filter(p => p.activo).map(persona => (
                        <SelectItem key={persona.id} value={persona.id.toString()}>
                          {persona.nombre} {persona.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Proyecto *</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, proyectoId: value })} required>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Seleccionar proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {proyectos.filter(p => p.activo).map(proyecto => (
                        <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                          {proyecto.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Contrato *</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, tipoContrato: value })} required>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OS">OS - Orden de Servicio</SelectItem>
                      <SelectItem value="CAS">CAS - Contrato Administrativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracion">Duración (días) *</Label>
                  <Input 
                    id="duracion"
                    type="number" 
                    placeholder="30" 
                    value={formData.duracion} 
                    onChange={(e) => setFormData({ ...formData, duracion: e.target.value })} 
                    required 
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>

            {/* Sección de Fechas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2">
                <Calendar className="h-4 w-4" />
                Fechas Importantes
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha-inicio">Fecha de Inicio *</Label>
                  <Input 
                    id="fecha-inicio"
                    type="date" 
                    value={formData.fechaInicio} 
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })} 
                    required 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha-fin">Fecha de Fin *</Label>
                  <Input 
                    id="fecha-fin"
                    type="date" 
                    value={formData.fechaFin} 
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })} 
                    required 
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>

            {/* Sección de Entregables */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2">
                <FileText className="h-4 w-4" />
                Entregables
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="primer-entregable">Primer Entregable</Label>
                  <Input 
                    id="primer-entregable"
                    type="date" 
                    value={formData.primerEntregable} 
                    onChange={(e) => setFormData({ ...formData, primerEntregable: e.target.value })} 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segundo-entregable">Segundo Entregable</Label>
                  <Input 
                    id="segundo-entregable"
                    type="date" 
                    value={formData.segundoEntregable} 
                    onChange={(e) => setFormData({ ...formData, segundoEntregable: e.target.value })} 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tercer-entregable">Tercer Entregable</Label>
                  <Input 
                    id="tercer-entregable"
                    type="date" 
                    value={formData.tercerEntregable} 
                    onChange={(e) => setFormData({ ...formData, tercerEntregable: e.target.value })} 
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>

            {/* Sección de Información Adicional */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2">
                <Building className="h-4 w-4" />
                Información Adicional
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="area-cargo">Área a Cargo</Label>
                  <Input 
                    id="area-cargo"
                    placeholder="Ej. Tecnología, Recursos Humanos..." 
                    value={formData.areaCargo} 
                    onChange={(e) => setFormData({ ...formData, areaCargo: e.target.value })} 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Condición</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, condicion: value })}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Seleccionar condición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Especialista">Especialista</SelectItem>
                      <SelectItem value="Coordinador">Coordinador</SelectItem>
                      <SelectItem value="Consultor">Consultor</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.condicion === 'Otros' && (
                  <div className="space-y-2">
                    <Label htmlFor="condicion-otros">Especificar Condición</Label>
                    <Input 
                      id="condicion-otros"
                      placeholder="Especifica la condición..." 
                      value={formData.condicionOtros} 
                      onChange={(e) => setFormData({ ...formData, condicionOtros: e.target.value })} 
                      className="bg-background/50"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="pt-6 border-t">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.personaId || !formData.proyectoId || !formData.tipoContrato || !formData.duracion || !formData.fechaInicio || !formData.fechaFin}
              >
                <Plus className="mr-2 h-4 w-4" />
                Registrar Orden de Servicio
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}