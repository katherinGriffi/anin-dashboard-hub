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
import { PlusCircle, FolderKanban, Search, Pencil, Trash2, Plus } from 'lucide-react';

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
    onEliminarProyecto(proyectoAEliminar);
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
      {/* Professional Registration Form */}
      <div className="lg:col-span-1">
        <Card className="shadow-sm border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-primary">Registrar Proyecto</CardTitle>
                <CardDescription>Añadir un nuevo proyecto al sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleRegistrarSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="nombre-proyecto">Nombre del Proyecto *</Label>
                <Input 
                  id="nombre-proyecto"
                  placeholder="Ingresa el nombre del proyecto" 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                  required 
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descripcion-proyecto">Descripción</Label>
                <Textarea 
                  id="descripcion-proyecto"
                  placeholder="Describe el proyecto..." 
                  value={formData.descripcion} 
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
                  className="bg-background/50"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/20">
                <Switch 
                  id="estado-registro" 
                  checked={formData.activo} 
                  onCheckedChange={(isChecked) => setFormData({ ...formData, activo: isChecked })}
                />
                <Label htmlFor="estado-registro" className={`font-medium ${formData.activo ? 'text-success' : 'text-muted-foreground'}`}>
                  {formData.activo ? 'Proyecto Activo' : 'Proyecto Inactivo'}
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha-inicio-registro">Fecha de inicio</Label>
                  <Input 
                    id="fecha-inicio-registro" 
                    type="date" 
                    value={formData.inicio} 
                    onChange={(e) => setFormData({ ...formData, inicio: e.target.value })} 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha-fin-registro">Fecha de fin</Label>
                  <Input 
                    id="fecha-fin-registro" 
                    type="date" 
                    value={formData.fin} 
                    onChange={(e) => setFormData({ ...formData, fin: e.target.value })} 
                    className="bg-background/50"
                  />
                </div>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!formData.nombre}
                variant="professional"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Agregar Proyecto
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>

      {/* Professional Projects List */}
      <div className="lg:col-span-2">
        <Card className="shadow-sm border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-primary">Proyectos Existentes</CardTitle>
                  <CardDescription>{proyectos.length} proyecto(s) registrado(s)</CardDescription>
                </div>
              </div>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nombre..." 
                  className="pl-9 bg-background/50" 
                  value={filtro} 
                  onChange={e => setFiltro(e.target.value)} 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/20 hover:bg-secondary/30">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Descripción</TableHead>
                    <TableHead className="text-center font-semibold">Estado</TableHead>
                    <TableHead className="text-right pr-6 font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proyectosFiltrados.length > 0 ? (
                    proyectosFiltrados.map((p) => (
                      <TableRow key={p.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-medium text-foreground">{p.nombre}</TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell max-w-xs truncate">
                          {p.descripcion || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={p.activo ? 'success' : 'destructive'} className="font-medium">
                            {p.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditModal(p)}
                              className="hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="hover:bg-destructive/10 hover:text-destructive" 
                              onClick={() => setProyectoAEliminar(p)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground bg-secondary/10">
                        {filtro ? 'No se encontraron proyectos con ese criterio.' : 'No hay proyectos registrados aún.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Edit Modal */}
      <Dialog open={!!proyectoAEditar} onOpenChange={(isOpen) => !isOpen && closeEditModal()}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-0 shadow-xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Editar Proyecto
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Modifica los datos del proyecto "{proyectoAEditar?.nombre}" y guarda los cambios.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditarSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-edit">Nombre del Proyecto *</Label>
              <Input 
                id="nombre-edit"
                placeholder="Nombre del proyecto" 
                value={formData.nombre} 
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                required 
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descripcion-edit">Descripción</Label>
              <Textarea 
                id="descripcion-edit"
                placeholder="Descripción del proyecto" 
                value={formData.descripcion} 
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
                className="bg-background/50"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha-inicio-edit">Fecha de inicio</Label>
                <Input 
                  id="fecha-inicio-edit" 
                  type="date" 
                  value={formData.inicio} 
                  onChange={(e) => setFormData({ ...formData, inicio: e.target.value })} 
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha-fin-edit">Fecha de fin</Label>
                <Input 
                  id="fecha-fin-edit" 
                  type="date" 
                  value={formData.fin} 
                  onChange={(e) => setFormData({ ...formData, fin: e.target.value })} 
                  className="bg-background/50"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/20">
              <Switch
                id="estado-proyecto-edit"
                checked={formData.activo}
                onCheckedChange={(isChecked) => setFormData({ ...formData, activo: isChecked })}
              />
              <Label htmlFor="estado-proyecto-edit" className={`font-medium ${formData.activo ? 'text-success' : 'text-muted-foreground'}`}>
                {formData.activo ? 'Proyecto Activo' : 'Proyecto Inactivo'}
              </Label>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeEditModal}>
                Cancelar
              </Button>
              <Button type="submit" variant="professional">
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Professional Delete Confirmation */}
      <AlertDialog open={!!proyectoAEliminar} onOpenChange={(isOpen) => !isOpen && setProyectoAEliminar(null)}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-sm border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              ¿Estás absolutamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. Esto eliminará permanentemente el proyecto 
              <span className="font-semibold text-foreground"> "{proyectoAEliminar?.nombre}"</span> 
              {" "}y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProyectoAEliminar(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEliminarConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar proyecto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}