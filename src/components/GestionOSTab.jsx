import React, { useMemo, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Calendar, Plus, User, Building, ArrowUpDown } from 'lucide-react';

export function GestionOSTab({ osList = [], personas = [], proyectos = [], onRegistrarOS }) {
  const initialState = {
    personaId: '',
    proyectoId: '',
    tipoContrato: '',
    duracion: '',
    fechaInicio: '',
    fechaFin: '',
    numeroEntregables: '',
    tiempoEntregable: '', // Frecuencia
    primerEntregable: '',
    segundoEntregable: '',
    tercerEntregable: '',
    cuartoEntregable: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [showModal, setShowModal] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'diasRestantes', direction: 'ascending' });
  const [dateError, setDateError] = useState('');

  const isCasContract = formData.tipoContrato === 'CAS';
  const isOsContract = formData.tipoContrato === 'OS';

  // --- LÓGICA DEL MODAL (SIN CAMBIOS) ---
  const handleSubmit = (e) => { e.preventDefault(); onRegistrarOS(formData); closeModal(); };
  const openModal = () => setShowModal(true);
  const closeModal = () => { setShowModal(false); setFormData(initialState); setDateError(''); };
  const parseDMY = (dateString) => {
    if (!dateString || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return null;
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // --- EFFECT PARA LÓGICA DE TIPO DE CONTRATO (SIN CAMBIOS) ---
  useEffect(() => {
    if (isCasContract) {
      setFormData(prev => ({
        ...prev, duracion: 'Indeterminado', fechaFin: 'Indeterminado', numeroEntregables: '', tiempoEntregable: '', primerEntregable: '', segundoEntregable: '', tercerEntregable: '', cuartoEntregable: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, duracion: '', fechaFin: '' }));
    }
  }, [formData.tipoContrato]);

  // --- EFFECT PARA CÁLCULO DE FECHA FIN (SIN CAMBIOS) ---
  useEffect(() => {
    if (isOsContract && formData.fechaInicio && formData.duracion > 0) {
      const startDate = new Date(formData.fechaInicio + 'T00:00:00');
      const durationDays = parseInt(formData.duracion, 10);
      startDate.setDate(startDate.getDate() + durationDays);
      const day = startDate.getDate().toString().padStart(2, '0');
      const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
      const year = startDate.getFullYear();
      setFormData(prev => ({ ...prev, fechaFin: `${day}/${month}/${year}` }));
    }
  }, [formData.fechaInicio, formData.duracion, isOsContract]);

  // --- ✨ NUEVO EFFECT AUTOMATIZADO PARA ENTREGABLES ✨ ---
  // Este único effect ahora maneja el cálculo de frecuencia, número y fechas de entregables.
  useEffect(() => {
    setDateError(''); // Limpia errores previos

    const clearDeliverables = (prev) => ({
      ...prev, numeroEntregables: '', tiempoEntregable: '', primerEntregable: '', segundoEntregable: '', tercerEntregable: '', cuartoEntregable: ''
    });

    if (isOsContract && formData.fechaInicio && formData.duracion > 0) {
      const duration = parseInt(formData.duracion, 10);

      // 1. Determinar frecuencia automáticamente
      let frequency = 0;
      if (duration >= 60) {
        frequency = 30; // Para contratos de 2 meses o más, entregables mensuales.
      } else if (duration >= 30) {
        frequency = 15; // Para contratos de 1 mes o más, entregables quincenales.
      } else if (duration > 0) {
        frequency = duration; // Para contratos cortos, un único entregable al final.
      }
      
      if (frequency === 0) {
        setFormData(clearDeliverables);
        return;
      }
      
      // 2. Calcular número de entregables
      const numEntregables = Math.floor(duration / frequency);
      const fields = ['primerEntregable', 'segundoEntregable', 'tercerEntregable', 'cuartoEntregable'];
      const newEntregables = {};
      
      // 3. Calcular fechas
      let lastDate = new Date(formData.fechaInicio + 'T00:00:00');
      for (let i = 0; i < numEntregables && i < fields.length; i++) {
        lastDate.setDate(lastDate.getDate() + frequency);
        const day = lastDate.getDate().toString().padStart(2, '0');
        const month = (lastDate.getMonth() + 1).toString().padStart(2, '0');
        const year = lastDate.getFullYear();
        newEntregables[fields[i]] = `${day}/${month}/${year}`;
      }
      
      // 4. Limpiar campos no usados
      for (let i = numEntregables; i < fields.length; i++) {
        newEntregables[fields[i]] = '';
      }
      
      // 5. Validar fecha de último entregable vs. fecha fin
      const lastEntregableField = fields[numEntregables - 1];
      const lastEntregableDateString = newEntregables[lastEntregableField];
      const lastDeliverableDate = parseDMY(lastEntregableDateString);
      const contractEndDate = parseDMY(formData.fechaFin);

      if (lastDeliverableDate && contractEndDate && lastDeliverableDate > contractEndDate) {
        setDateError('🚨 La fecha del último entregable no puede ser posterior a la fecha de fin del contrato.');
      }
      
      // 6. Actualizar el estado con toda la información calculada
      setFormData(prev => ({
        ...prev,
        numeroEntregables: numEntregables,
        tiempoEntregable: frequency,
        ...newEntregables,
      }));

    } else {
      setFormData(clearDeliverables);
    }
  }, [formData.fechaInicio, formData.duracion, formData.fechaFin, isOsContract]);

  
  // --- LÓGICA DE LA TABLA (SIN CAMBIOS) ---
  const calcularDiasRestantes = (fechaFin) => { if (!fechaFin || fechaFin === 'Indeterminado') return null; const hoy = new Date(); const fin = new Date(fechaFin + 'T23:59:59'); const diffTime = fin.getTime() - hoy.getTime(); return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); };
  const getEstadoFechaBadge = (diasRestantes) => { if (diasRestantes === null) return { variant: 'secondary' }; if (diasRestantes < 0) return { variant: 'destructive' }; if (diasRestantes <= 7) return { variant: 'warning' }; return { variant: 'success' }; };
  const getEstadoOS = (diasRestantes, tipoContrato) => { if (tipoContrato === 'CAS') { return { text: 'Vigente', variant: 'success' }; } if (diasRestantes === null) return { text: 'Indefinido', variant: 'secondary' }; if (diasRestantes < 0) return { text: 'No Vigente', variant: 'destructive' }; return { text: 'Vigente', variant: 'success' }; };
  const sortedAndFilteredOsList = useMemo(() => { const enrichedList = osList.map(os => { const persona = personas.find(p => p.id === os.personaId); const proyecto = proyectos.find(p => p.id === os.proyectoId); return { ...os, personaNombre: persona ? `${persona.nombre} ${persona.apellido}` : '', proyectoNombre: proyecto ? proyecto.nombre : '', diasRestantes: calcularDiasRestantes(os.fechaFin) }; }); const filtered = enrichedList.filter(os => { const searchStr = filtro.toLowerCase(); return ((os.id && os.id.toString().toLowerCase().includes(searchStr)) || os.personaNombre.toLowerCase().includes(searchStr) || os.proyectoNombre.toLowerCase().includes(searchStr) || (os.tipoContrato && os.tipoContrato.toLowerCase().includes(searchStr))); }); if (sortConfig.key) { filtered.sort((a, b) => { const valA = a[sortConfig.key]; const valB = b[sortConfig.key]; if (valA === null) return 1; if (valB === null) return -1; let comparison = 0; if (valA > valB) { comparison = 1; } else if (valA < valB) { comparison = -1; } return sortConfig.direction === 'descending' ? comparison * -1 : comparison; }); } return filtered; }, [osList, personas, proyectos, filtro, sortConfig]);
  const handleSort = (key) => { let direction = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; } setSortConfig({ key, direction }); };
  const SortableHeader = ({ children, columnKey }) => { const isSorting = sortConfig.key === columnKey; const directionIcon = sortConfig.direction === 'ascending' ? '🔼' : '🔽'; return ( <TableHead className="font-semibold cursor-pointer hover:bg-secondary/50" onClick={() => handleSort(columnKey)}> <div className="flex items-center gap-2"> {children} {isSorting ? <span>{directionIcon}</span> : <ArrowUpDown className="h-4 w-4 text-muted-foreground" />} </div> </TableHead> ); };

  const isFormValid = () => {
    const baseValid = formData.personaId && formData.proyectoId && formData.tipoContrato && formData.fechaInicio;
    if (isOsContract) {
      return baseValid && formData.duracion > 0 && !dateError;
    }
    return baseValid;
  };

  return (
    <div className="space-y-6">
      {/* Header y Buscador (sin cambios) */}
      <Card className="shadow-sm border-0 bg-card/80 backdrop-blur-sm"><CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-full"><FileText className="h-6 w-6 text-primary" /></div><div><CardTitle className="text-primary">Gestión de Órdenes de Servicio</CardTitle><CardDescription>{osList.length} orden(es) de servicio registrada(s)</CardDescription></div></div><div className="flex gap-3"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar OS, persona o proyecto..." className="pl-9 bg-background/50" value={filtro} onChange={e => setFiltro(e.target.value)} /></div><Button onClick={openModal} className="shrink-0"><Plus className="mr-2 h-4 w-4" /> Nueva OS</Button></div></div></CardHeader></Card>
      {/* Tabla de Órdenes de Servicio (sin cambios) */}
      <Card className="shadow-sm border-0 bg-card/80 backdrop-blur-sm"><CardContent className="p-0"><div className="rounded-md"><Table><TableHeader><TableRow className="bg-secondary/20 hover:bg-secondary/30"><TableHead className="font-semibold">ID</TableHead><SortableHeader columnKey="personaNombre">Persona</SortableHeader><SortableHeader columnKey="proyectoNombre">Proyecto</SortableHeader><TableHead className="font-semibold">Tipo</TableHead><TableHead className="font-semibold">Estado</TableHead><TableHead className="font-semibold">Fecha Fin</TableHead><SortableHeader columnKey="diasRestantes">Días Restantes</SortableHeader></TableRow></TableHeader><TableBody>{sortedAndFilteredOsList.length > 0 ? (sortedAndFilteredOsList.map((os) => { const estadoOS = getEstadoOS(os.diasRestantes, os.tipoContrato); return (<TableRow key={os.id} className="hover:bg-secondary/20 transition-colors"><TableCell className="font-medium text-primary">{os.id}</TableCell><TableCell><div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{os.personaNombre || 'N/A'}</span></div></TableCell><TableCell><div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /><span>{os.proyectoNombre || 'N/A'}</span></div></TableCell><TableCell><Badge variant={os.tipoContrato === 'OS' ? 'default' : 'secondary'} className="font-medium">{os.tipoContrato}</Badge></TableCell><TableCell><Badge variant={estadoOS.variant} className="capitalize">{estadoOS.text}</Badge></TableCell><TableCell>{os.fechaFin && os.fechaFin !== 'Indeterminado' ? os.fechaFin : 'Indeterminado'}</TableCell><TableCell className="text-right">{os.diasRestantes !== null && os.diasRestantes < 0 ? ( <span className="text-sm text-muted-foreground">Finalizado</span> ) : os.diasRestantes !== null ? ( <Badge variant={getEstadoFechaBadge(os.diasRestantes).variant}>{os.diasRestantes} días</Badge> ) : ( <Badge variant="secondary">N/A</Badge> )}</TableCell></TableRow>); })) : (<TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground bg-secondary/10">{filtro ? 'No se encontraron órdenes de servicio con ese criterio.' : 'No hay órdenes de servicio registradas aún.'}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
      
      {/* --- MODAL CON LÓGICA AUTOMATIZADA --- */}
      <Dialog open={showModal} onOpenChange={(isOpen) => !isOpen && closeModal()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-sm border-0 shadow-xl">
          <DialogHeader className="text-left"><DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Registrar Nueva Orden de Servicio</DialogTitle><DialogDescription className="text-muted-foreground">Complete los datos para crear una nueva orden de servicio en el sistema.</DialogDescription></DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Sección de Información Básica */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2"><FileText className="h-4 w-4" />Información Básica</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Persona *</Label><Select onValueChange={(value) => setFormData({ ...formData, personaId: value })} required><SelectTrigger className="bg-background/50"><SelectValue placeholder="Seleccionar persona" /></SelectTrigger><SelectContent>{personas.filter(p => p.activo).map(persona => (<SelectItem key={persona.id} value={persona.id.toString()}>{persona.nombre} {persona.apellido}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Proyecto *</Label><Select onValueChange={(value) => setFormData({ ...formData, proyectoId: value })} required><SelectTrigger className="bg-background/50"><SelectValue placeholder="Seleccionar proyecto" /></SelectTrigger><SelectContent>{proyectos.filter(p => p.activo).map(proyecto => (<SelectItem key={proyecto.id} value={proyecto.id.toString()}>{proyecto.nombre}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Tipo de Contrato *</Label><Select onValueChange={(value) => setFormData({ ...formData, tipoContrato: value })} required><SelectTrigger className="bg-background/50"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger><SelectContent><SelectItem value="OS">OS - Orden de Servicio</SelectItem><SelectItem value="CAS">CAS - Contrato Administrativo</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="duracion">Duración (días) *</Label><Input id="duracion" type={isCasContract ? "text" : "number"} placeholder={isCasContract ? "" : "Ej. 90"} value={formData.duracion} onChange={(e) => setFormData({ ...formData, duracion: e.target.value })} required disabled={isCasContract} className="bg-background/50"/></div>
              </div>
            </div>

            {/* Sección de Fechas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2"><Calendar className="h-4 w-4" />Fechas Importantes</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="fecha-inicio">Fecha de Inicio *</Label><Input id="fecha-inicio" type="date" value={formData.fechaInicio} onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })} required className="bg-background/50"/></div>
                <div className="space-y-2"><Label htmlFor="fecha-fin">Fecha de Fin (Calculada)</Label><Input id="fecha-fin" type="text" value={formData.fechaFin} readOnly disabled className="bg-background/50 cursor-not-allowed"/></div>
              </div>
            </div>

            {/* Sección de Entregables (Solo para OS y ahora 100% automático) */}
            {isOsContract && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2"><FileText className="h-4 w-4" />Plan de Entregables (Automático)</div>
                
                {/* Campos informativos de la planificación */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nro. de Entregables</Label><Input value={formData.numeroEntregables || '...'} disabled className="bg-background/50 font-bold text-center"/></div>
                  <div className="space-y-2"><Label>Frecuencia (días)</Label><Input value={formData.tiempoEntregable || '...'} disabled className="bg-background/50 font-bold text-center"/></div>
                </div>

                {dateError && (<div className="p-3 my-2 bg-destructive/10 border border-destructive/20 rounded-md"><p className="text-sm font-medium text-destructive">{dateError}</p></div>)}

                {/* Muestra los inputs dinámicamente */}
                {formData.numeroEntregables > 0 && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {Array.from({ length: formData.numeroEntregables }).map((_, index) => {
                      const fieldName = ['primerEntregable', 'segundoEntregable', 'tercerEntregable', 'cuartoEntregable'][index];
                      const label = ['1er', '2do', '3er', '4to'][index] + ' Entregable';
                      return (
                        <div className="space-y-2" key={fieldName}>
                          <Label>{label}</Label>
                          <Input value={formData[fieldName]} disabled className="bg-background/50"/>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter className="pt-6 border-t"><Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button><Button type="submit" disabled={!isFormValid()}><Plus className="mr-2 h-4 w-4" />Registrar Orden de Servicio</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}