// src/components/ProyectosTab.jsx

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusCircle, FolderKanban, Search, Pencil, Trash2 } from 'lucide-react';

export function ProyectosTab({ proyectos = [], onRegistrarProyecto, onEditarProyecto, onEliminarProyecto }) {
  const initialState = { nombre: "", descripcion: "", inicio: "", fin: "", activo: true };
  const [formData, setFormData] = useState(initialState);
  const [proyectoAEditar, setProyectoAEditar] = useState(null);
  const [proyectoAEliminar, setProyectoAEliminar] = useState(null);
  const [filtro, setFiltro] = useState("");

  const handleRegistrarSubmit = (e) => {
    e.preventDefault();
    onRegistrarProyecto(formData);
    setFormData(initialState);
  };

  const handleEditarSubmit = (e) => {
    e.preventDefault();
    onEditarProyecto({ ...proyectoAEditar, ...formData });
    setProyectoAEditar(null);
  };

  const handleEliminarConfirm = () => {
    onEliminarProyecto(proyectoAEliminar.id);
    setProyectoAEliminar(null);
  };

  const openEditModal = (proyecto) => {
    setProyectoAEditar(proyecto);
    setFormData({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      inicio: proyecto.inicio || "",
      fin: proyecto.fin || "",
      activo: proyecto.activo
    });
  };

  const closeEditModal = () => {
    setProyectoAEditar(null);
    setFormData(initialState);
  };

  const proyectosFiltrados = useMemo(() =>
    proyectos.filter(p =>
      p.nombre.toLowerCase().includes(filtro.toLowerCase())
    ),
    [proyectos, filtro]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Registrar Nuevo Proyecto */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 text-primary">
              <PlusCircle className="h-6 w-6" />
              <CardTitle>Registrar Proyecto</CardTitle>
            </div>
            <CardDescription>Añadir un nuevo proyecto al sistema.</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegistrarSubmit}>
            <CardContent className="space-y-4">
              <Input placeholder="Nombre del proyecto *" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
              <Textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
              
              {/* Switch para el estado en el formulario de registro */}
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="estado-registro" 
                  checked={formData.activo} 
                  onCheckedChange={(isChecked) => setFormData({ ...formData, activo: isChecked })}
                />
                <Label htmlFor="estado-registro" className={formData.activo ? 'text-foreground' : 'text-muted-foreground'}>
                  {formData.activo ? 'Proyecto Activo' : 'Proyecto Inactivo'}
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="fecha-inicio-registro">Fecha de inicio</Label>
                  <Input id="fecha-inicio-registro" type="date" value={formData.inicio} onChange={(e) => setFormData({ ...formData, inicio: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fecha-fin-registro">Fecha de fin</Label>
                  <Input id="fecha-fin-registro" type="date" value={formData.fin} onChange={(e) => setFormData({ ...formData, fin: e.target.value })} />
                </div>
              </div>
            </CardContent>
            <CardContent>
              <Button type="submit" className="w-full" disabled={!formData.nombre}>
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Proyecto
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>

      {/* Columna Derecha: Lista de Proyectos */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <FolderKanban className="h-6 w-6" />
              <CardTitle>Proyectos Existentes</CardTitle>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre..." className="pl-9" value={filtro} onChange={e => setFiltro(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Descripción</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proyectosFiltrados.length > 0 ? (
                    proyectosFiltrados.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.nombre}</TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell max-w-xs truncate">{p.descripcion || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={p.activo ? 'secondary' : 'destructive'}>
                            {p.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setProyectoAEliminar(p)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        {filtro ? 'No se encontraron proyectos.' : 'No hay proyectos registrados.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para la edición de proyectos */}
      <Dialog open={!!proyectoAEditar} onOpenChange={(isOpen) => !isOpen && closeEditModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Proyecto: {proyectoAEditar?.nombre}</DialogTitle>
            <DialogDescription>Modifica los datos del proyecto y guarda los cambios.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditarSubmit} className="space-y-4 py-4">
            <Input placeholder="Nombre del proyecto *" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
            <Textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fecha-inicio-edit">Fecha de inicio</Label>
                <Input id="fecha-inicio-edit" type="date" value={formData.inicio} onChange={(e) => setFormData({ ...formData, inicio: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fecha-fin-edit">Fecha de fin</Label>
                <Input id="fecha-fin-edit" type="date" value={formData.fin} onChange={(e) => setFormData({ ...formData, fin: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="estado-proyecto-edit"
                checked={formData.activo}
                onCheckedChange={(isChecked) => setFormData({ ...formData, activo: isChecked })}
              />
              <Label htmlFor="estado-proyecto-edit" className={formData.activo ? 'text-foreground' : 'text-muted-foreground'}>
                {formData.activo ? 'Proyecto Activo' : 'Proyecto Inactivo'}
              </Label>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeEditModal}>Cancelar</Button>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!proyectoAEliminar} onOpenChange={(isOpen) => !isOpen && setProyectoAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el proyecto "{proyectoAEliminar?.nombre}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProyectoAEliminar(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminarConfirm}>Sí, eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}