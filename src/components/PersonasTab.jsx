// src/components/PersonasTab.jsx

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserPlus, Users, Search, Pencil, Trash2 } from 'lucide-react';

export function PersonasTab({ personas = [], roles = [], onRegistrarPersona, onEditarPersona, onEliminarPersona }) {
  const initialState = { 
    nombre: "", 
    apellido: "", 
    email: "", 
    rol: "", 
    nro_celular: "",
    valor: "",
    activo: true 
  };
  
  // Estado para el formulario de REGISTRO
  const [formData, setFormData] = useState(initialState);
  
  // ✅ NUEVO: Estado separado para el formulario de EDICIÓN
  const [editFormData, setEditFormData] = useState(null);

  const [personaAEditar, setPersonaAEditar] = useState(null);
  const [personaAEliminar, setPersonaAEliminar] = useState(null);
  const [filtro, setFiltro] = useState("");

  const rolesAsignados = useMemo(() => new Set(personas.map(p => p.rol)), [personas]);
  const rolesDisponiblesParaRegistro = useMemo(() => roles.filter(rol => !rolesAsignados.has(rol.nombre)), [roles, rolesAsignados]);
  const rolesDisponiblesParaEdicion = useMemo(() => {
    if (!personaAEditar) return [];
    return roles.filter(rol => !rolesAsignados.has(rol.nombre) || rol.nombre === personaAEditar.rol);
  }, [roles, rolesAsignados, personaAEditar]);

  const handleRegistrarSubmit = (e) => {
    e.preventDefault();
    onRegistrarPersona(formData);
    setFormData(initialState); // Resetea solo el formulario de registro
  };

  // ✅ ACTUALIZADO: Usa el estado de edición
  const handleEditarSubmit = (e) => {
    e.preventDefault();
    onEditarPersona(editFormData);
    setPersonaAEditar(null); // Cierra el modal
  };

  const handleEliminarConfirm = () => {
    onEliminarPersona(personaAEliminar);
    setPersonaAEliminar(null);
  };

  // ✅ ACTUALIZADO: Ahora llena el estado de edición
  const openEditModal = (persona) => {
    setPersonaAEditar(persona);
    setEditFormData({ // Llena el formulario de edición con los datos de la persona
      ...persona,
      nro_celular: persona.nro_celular || "",
      valor: persona.valor || "",
    });
  };

  // ✅ ACTUALIZADO: Limpia el estado de edición
  const closeEditModal = () => {
    setPersonaAEditar(null);
    setEditFormData(null); 
  };

  const personasFiltradas = useMemo(() =>
    personas.filter(p =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(filtro.toLowerCase()) ||
      p.email.toLowerCase().includes(filtro.toLowerCase()) ||
      (p.nro_celular && p.nro_celular.toLowerCase().includes(filtro.toLowerCase()))
    ),
    [personas, filtro]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* --- FORMULARIO DE REGISTRO --- */}
      {/* Este formulario ahora solo usa `formData` y no se ve afectado por la edición */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 text-primary">
              <UserPlus className="h-6 w-6" />
              <CardTitle>Registrar Persona</CardTitle>
            </div>
            <CardDescription>Añadir una nueva persona al sistema.</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegistrarSubmit}>
            <CardContent className="space-y-4">
              <Input placeholder="Nombre *" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
              <Input placeholder="Apellido *" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} required />
              <Input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <Input placeholder="Nro. Celular (Opcional)" value={formData.nro_celular} onChange={(e) => setFormData({ ...formData, nro_celular: e.target.value })} />
              <Select onValueChange={(value) => setFormData({ ...formData, rol: value })} value={formData.rol} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Rol *" />
                </SelectTrigger>
                <SelectContent>
                  {rolesDisponiblesParaRegistro.length > 0 ? (
                    rolesDisponiblesParaRegistro.map((rol, index) => (
                      <SelectItem key={index} value={rol.nombre}>{rol.nombre}</SelectItem>
                    ))
                  ) : (
                    <p className="p-2 text-sm text-muted-foreground">Todos los roles están asignados.</p>
                  )}
                </SelectContent>
              </Select>
              <Input placeholder="Valor" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} />
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="estado-registro-persona" 
                  checked={formData.activo} 
                  onCheckedChange={(isChecked) => setFormData({ ...formData, activo: isChecked })}
                />
                <Label htmlFor="estado-registro-persona" className={formData.activo ? 'text-foreground' : 'text-muted-foreground'}>
                  {formData.activo ? 'Activo' : 'Inactivo'}
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={!formData.nombre || !formData.apellido || !formData.email || !formData.rol}>
                <UserPlus className="mr-2 h-4 w-4" /> Agregar Persona
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* --- TABLA DE PERSONAS --- */}
      <div className="lg:col-span-2">{/* ... (La tabla no necesita cambios) ... */}
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <Users className="h-6 w-6" />
                    <CardTitle>Personas Existentes</CardTitle>
                </div>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar persona..." className="pl-9" value={filtro} onChange={e => setFiltro(e.target.value)} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre Completo</TableHead>
                            <TableHead className="hidden md:table-cell">Email</TableHead>
                            <TableHead className="hidden lg:table-cell">Nro. Celular</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-right pr-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {personasFiltradas.length > 0 ? (
                        personasFiltradas.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.nombre} {p.apellido}</TableCell>
                                <TableCell className="text-muted-foreground hidden md:table-cell">{p.email}</TableCell>
                                <TableCell className="text-muted-foreground hidden lg:table-cell">{p.nro_celular || 'N/A'}</TableCell>
                                <TableCell className="text-muted-foreground">{p.rol}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={p.activo ? 'default' : 'destructive'}>
                                    {p.activo ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEditModal(p)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setPersonaAEliminar(p)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            {filtro ? 'No se encontraron personas.' : 'No hay personas registradas.'}
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
          </Card>
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {/* ✅ Este modal ahora usa su propio estado `editFormData` */}
      <Dialog open={!!personaAEditar} onOpenChange={(isOpen) => !isOpen && closeEditModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Persona: {personaAEditar?.nombre} {personaAEditar?.apellido}</DialogTitle>
            <DialogDescription>Modifica los datos de la persona y guarda los cambios.</DialogDescription>
          </DialogHeader>
          {/* Solo renderiza el formulario si hay datos para editar */}
          {editFormData && (
            <form onSubmit={handleEditarSubmit} className="space-y-4 py-4">
              <Input placeholder="Nombre *" value={editFormData.nombre} onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })} required />
              <Input placeholder="Apellido *" value={editFormData.apellido} onChange={(e) => setEditFormData({ ...editFormData, apellido: e.target.value })} required />
              <Input type="email" placeholder="Email *" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} required />
              <Input placeholder="Nro. Celular (Opcional)" value={editFormData.nro_celular} onChange={(e) => setEditFormData({ ...editFormData, nro_celular: e.target.value })} />
              <Select onValueChange={(value) => setEditFormData({ ...editFormData, rol: value })} value={editFormData.rol} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Rol *" />
                </SelectTrigger>
                <SelectContent>
                  {rolesDisponiblesParaEdicion.length > 0 ? (
                    rolesDisponiblesParaEdicion.map((rol, index) => (
                      <SelectItem key={index} value={rol.nombre}>{rol.nombre}</SelectItem>
                    ))
                  ) : (
                    <p className="p-2 text-sm text-muted-foreground">No hay más roles disponibles</p>
                  )}
                </SelectContent>
              </Select>
              <Input placeholder="Valor (Opcional)" value={editFormData.valor} onChange={(e) => setEditFormData({ ...editFormData, valor: e.target.value })} />
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="estado-persona-edit" 
                  checked={editFormData.activo} 
                  onCheckedChange={(isChecked) => setEditFormData({ ...editFormData, activo: isChecked })}
                />
                <Label htmlFor="estado-persona-edit" className={editFormData.activo ? 'text-foreground' : 'text-muted-foreground'}>
                  {editFormData.activo ? 'Activo' : 'Inactivo'}
                </Label>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={closeEditModal}>Cancelar</Button>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* --- MODAL DE ELIMINACIÓN --- */}
      <AlertDialog open={!!personaAEliminar} onOpenChange={(isOpen) => !isOpen && setPersonaAEliminar(null)}>{/* ... (sin cambios) ... */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente a {personaAEliminar?.nombre} {personaAEliminar?.apellido}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPersonaAEliminar(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminarConfirm}>Sí, eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}