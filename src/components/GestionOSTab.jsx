// src/components/GestionOSTab.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, FileText, Search, MoreHorizontal } from 'lucide-react';

// --- FUNCIONES AUXILIARES (sin cambios) ---
const addDaysAndFormat = (dateString, days) => {
  if (!dateString || !days) return "";
  const date = new Date(dateString + 'T00:00:00');
  date.setDate(date.getDate() + parseInt(days));
  return date.toISOString().split('T')[0];
};

const getEstadoOS = (fechaFin) => {
    if (!fechaFin) return { texto: 'Indefinido', variant: 'secondary' };
    const hoy = new Date();
    const fin = new Date(fechaFin + 'T23:59:59');
    hoy.setHours(0, 0, 0, 0);
    
    if (hoy <= fin) {
        return { texto: 'Vigente', variant: 'default' };
    } else {
        return { texto: 'Finalizada', variant: 'destructive' };
    }
};

export function GestionOSTab({ osList = [], personas = [], proyectos = [], onRegistrarOS }) {
  // ✅ 1. ESTADO INICIAL ACTUALIZADO con los nuevos campos
  const initialState = {
    id: "",
    personaId: "",
    proyectoId: "",
    tipoContrato: "",
    condicion: "", // Nuevo
    condicionOtros: "", // Nuevo
    areaCargo: "", // Nuevo
    duracion: "",
    fechaInicio: "",
    fechaFin: "",
    primerEntregable: "",
    segundoEntregable: "",
    tercerEntregable: ""
  };
  const [nuevaOS, setNuevaOS] = useState(initialState);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const { tipoContrato, fechaInicio, duracion } = nuevaOS;
    if (tipoContrato === 'OS' && fechaInicio && duracion) {
      const fin = addDaysAndFormat(fechaInicio, duracion);
      const entregable1 = addDaysAndFormat(fechaInicio, 30);
      const entregable2 = addDaysAndFormat(fechaInicio, 60);
      const entregable3 = addDaysAndFormat(fechaInicio, 90);
      setNuevaOS(prev => ({ ...prev, fechaFin: fin, primerEntregable: entregable1, segundoEntregable: entregable2, tercerEntregable: entregable3 }));
    } else if (nuevaOS.tipoContrato !== 'OS') {
      setNuevaOS(prev => ({ ...prev, fechaFin: "", duracion: "", fechaInicio: "", primerEntregable: "", segundoEntregable: "", tercerEntregable: "" }));
    }
  }, [nuevaOS.tipoContrato, nuevaOS.fechaInicio, nuevaOS.duracion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nuevaOS.personaId || !nuevaOS.proyectoId || !nuevaOS.tipoContrato) return;
    onRegistrarOS(nuevaOS);
    setNuevaOS(initialState);
  };

  const getPersonaNombre = (id) => {
    const persona = personas.find(p => p.id === parseInt(id));
    return persona ? `${persona.nombre} ${persona.apellido}` : 'Desconocido';
  };
  const getProyectoNombre = (id) => proyectos.find(p => p.id === parseInt(id))?.nombre || 'Desconocido';
  
  const osFiltradas = useMemo(() => osList.filter(os => 
    getPersonaNombre(os.personaId).toLowerCase().includes(filtro.toLowerCase()) ||
    getProyectoNombre(os.proyectoId).toLowerCase().includes(filtro.toLowerCase()) ||
    (os.id && os.id.toLowerCase().includes(filtro.toLowerCase())) ||
    (os.areaCargo && os.areaCargo.toLowerCase().includes(filtro.toLowerCase()))
  ), [osList, filtro, personas, proyectos]);

const isFormInvalido = useMemo(() => {
    const baseInvalido = !nuevaOS.personaId || !nuevaOS.proyectoId || !nuevaOS.tipoContrato || !nuevaOS.areaCargo || !nuevaOS.condicion;
    const osInvalido = nuevaOS.tipoContrato === 'OS' && (!nuevaOS.duracion || !nuevaOS.fechaInicio);
    const casInvalido = nuevaOS.tipoContrato === 'CAS' && !nuevaOS.fechaInicio;
    const otrosInvalido = nuevaOS.condicion === 'Otros' && !nuevaOS.condicionOtros;
    return baseInvalido || osInvalido || casInvalido || otrosInvalido;
  }, [nuevaOS]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* --- FORMULARIO DE REGISTRO --- */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 text-primary">
                <PlusCircle className="h-6 w-6" />
                <CardTitle>Registrar Nueva OS</CardTitle>
              </div>
              <CardDescription>Completa los datos para generar una nueva Orden de Servicio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>N° de OS (Opcional)</Label>
                <Input value={nuevaOS.id} onChange={(e) => setNuevaOS({ ...nuevaOS, id: e.target.value })} placeholder="Ej: OS-050" />
              </div>
              <Select onValueChange={(value) => setNuevaOS({ ...nuevaOS, personaId: value })} value={nuevaOS.personaId} required>
                <SelectTrigger><SelectValue placeholder="Seleccionar Persona *" /></SelectTrigger>
                <SelectContent>{personas.filter(p => p.activo).map(p => (<SelectItem key={p.id} value={String(p.id)}>{p.nombre} {p.apellido}</SelectItem>))}</SelectContent>
              </Select>
              <Select onValueChange={(value) => setNuevaOS({ ...nuevaOS, proyectoId: value })} value={nuevaOS.proyectoId} required>
                <SelectTrigger><SelectValue placeholder="Seleccionar Proyecto *" /></SelectTrigger>
                <SelectContent>{proyectos.filter(p => p.activo).map(p => (<SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>))}</SelectContent>
              </Select>
              
              {/* ✅ 2. NUEVO CAMPO: Área a Cargo */}
              <Select onValueChange={(value) => setNuevaOS({ ...nuevaOS, areaCargo: value })} value={nuevaOS.areaCargo} required>
                  <SelectTrigger><SelectValue placeholder="Área a Cargo *" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="DEO">DEO</SelectItem>
                      <SelectItem value="Transversal">Transversal</SelectItem>
                      {proyectos.filter(p => p.activo).map(p => (
                          <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              
              <Select onValueChange={(value) => setNuevaOS({ ...nuevaOS, tipoContrato: value })} value={nuevaOS.tipoContrato} required>
                <SelectTrigger><SelectValue placeholder="Tipo de Contrato *" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAS">CAS</SelectItem>
                  <SelectItem value="OS">Orden de Servicio (OS)</SelectItem>
                </SelectContent>
              </Select>

               {/* ✅ CORREGIDO: Campo 'Fecha de Inicio' ahora aparece para CAS y OS */}
              {(nuevaOS.tipoContrato === 'CAS' || nuevaOS.tipoContrato === 'OS') && (
                <div className="space-y-1">
                  <Label htmlFor="fecha-inicio">Fecha de Inicio *</Label>
                  <Input 
                    id="fecha-inicio" 
                    type="date" 
                    value={nuevaOS.fechaInicio} 
                    onChange={(e) => setNuevaOS({ ...nuevaOS, fechaInicio: e.target.value })} 
                    required 
                  />
                </div>
              )}

              {/* ✅ 3. NUEVO CAMPO: Condición (con lógica condicional) */}
              <Select onValueChange={(value) => setNuevaOS({ ...nuevaOS, condicion: value })} value={nuevaOS.condicion} required>
                  <SelectTrigger><SelectValue placeholder="Condición *" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Nuevo">Nuevo</SelectItem>
                      <SelectItem value="Renovación">Renovación</SelectItem>
                      <SelectItem value="Transversal">Transversal</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
              </Select>
              
              {/* Input que aparece solo si se selecciona "Otros" */}
              {nuevaOS.condicion === 'Otros' && (
                <div className="space-y-1">
                  <Label>Especificar Otra Condición</Label>
                  <Input value={nuevaOS.condicionOtros} onChange={(e) => setNuevaOS({ ...nuevaOS, condicionOtros: e.target.value })} placeholder="Escribe la condición" required />
                </div>
              )}

              {/* Campos que aparecen solo si el tipo de contrato es "OS" */}
              {nuevaOS.tipoContrato === 'OS' && (
                <>
                  <Select onValueChange={(value) => setNuevaOS({ ...nuevaOS, duracion: value })} value={nuevaOS.duracion} required>
                    <SelectTrigger><SelectValue placeholder="Duración *" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">3 Meses</SelectItem>
                      <SelectItem value="180">6 Meses</SelectItem>
                      <SelectItem value="365">12 Meses</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-y-1">
                    <Label htmlFor="fecha-inicio">Fecha de Inicio *</Label>
                    <Input id="fecha-inicio" type="date" value={nuevaOS.fechaInicio} onChange={(e) => setNuevaOS({ ...nuevaOS, fechaInicio: e.target.value })} required={nuevaOS.tipoContrato === 'OS'}/>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={!nuevaOS.personaId || !nuevaOS.proyectoId || !nuevaOS.tipoContrato || !nuevaOS.areaCargo || !nuevaOS.condicion}><PlusCircle className="mr-2 h-4 w-4" />Registrar OS</Button>
            </CardFooter>
          </Card>
          {nuevaOS.tipoContrato === 'OS' && (
            <Card className="mt-6 bg-secondary/50">{/* ... Fechas Calculadas ... */}</Card>
          )}
        </form>
      </div>
      {/* --- TABLA DE ÓRDENES DE SERVICIO --- */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>{/* ... (sin cambios) ... */}</CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Persona</TableHead>
                    <TableHead>Área a Cargo</TableHead> {/* ✅ NUEVA COLUMNA */}
                    <TableHead>Condición</TableHead> {/* ✅ NUEVA COLUMNA */}
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {osFiltradas.length > 0 ? (
                    osFiltradas.map((os) => {
                      const estado = getEstadoOS(os.fechaFin);
                      return (
                        <TableRow key={os.id || os.personaId}>
                          <TableCell className="font-mono text-xs">{os.id || 'N/A'}</TableCell>
                          <TableCell className="font-medium">{getPersonaNombre(os.personaId)}</TableCell>
                          <TableCell className="text-muted-foreground">{os.areaCargo || '-'}</TableCell> {/* ✅ NUEVA CELDA */}
                          <TableCell className="text-muted-foreground">{os.condicion || '-'}</TableCell> {/* ✅ NUEVA CELDA */}
                          <TableCell className="text-muted-foreground">{getProyectoNombre(os.proyectoId)}</TableCell>
                          <TableCell className="text-muted-foreground">{os.fechaNotificacion || '-'}</TableCell>

                          <TableCell className="text-muted-foreground">{os.fechaFin || '-'}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={estado.variant}>{estado.texto}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{/* ... Dropdown ... */}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      {/* ✅ colSpan actualizado a 8 */}
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        {filtro ? 'No se encontraron órdenes de servicio.' : 'No hay órdenes de servicio registradas.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}