import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Users, Search, Pencil, Trash2, Mail, Phone, Plus } from 'lucide-react';

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
  
  // State for REGISTRATION form
  const [formData, setFormData] = useState(initialState);
  
  // Separate state for EDIT form
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
    setFormData(initialState);
  };

  const handleEditarSubmit = (e) => {
    e.preventDefault();
    onEditarPersona(editFormData);
    setPersonaAEditar(null);
  };

  const handleEliminarConfirm = () => {
    onEliminarPersona(personaAEliminar);
    setPersonaAEliminar(null);
  };

  const openEditModal = (persona) => {
    setPersonaAEditar(persona);
    setEditFormData({
      ...persona,
      nro_celular: persona.nro_celular || "",
      valor: persona.valor || "",
    });
  };

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
      {/* Professional Registration Form */}
      <div className="lg:col-span-1">
        <Card className="shadow-sm border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-primary">Registrar Persona</CardTitle>
                <CardDescription>Añadir una nueva persona al sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleRegistrarSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="nombre-registro">Nombre *</Label>
                  <Input 
                    id="nombre-registro"
                    placeholder="Nombre" 
                    value={formData.nombre} 
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                    required 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido-registro">Apellido *</Label>
                  <Input 
                    id="apellido-registro"
                    placeholder="Apellido" 
                    value={formData.apellido} 
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} 
                    required 
                    className="bg-background/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-registro">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email-registro"
                    type="email" 
                    placeholder="correo@ejemplo.com" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    required 
                    className="pl-10 bg-background/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="celular-registro">Nro. Celular</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="celular-registro"
                    placeholder="999 999 999" 
                    value={formData.nro_celular} 
                    onChange={(e) => setFormData({ ...formData, nro_celular: e.target.value })} 
                    className="pl-10 bg-background/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Rol *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, rol: value })} value={formData.rol} required>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesDisponiblesParaRegistro.length > 0 ? (
                      rolesDisponiblesParaRegistro.map((rol, index) => (
                        <SelectItem key={index} value={rol.nombre}>{rol.nombre}</SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">Todos los roles están asignados.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valor-registro">Valor</Label>
                <Input 
                  id="valor-registro"
                  placeholder="Valor asociado" 
                  value={formData.valor} 
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })} 
                  className="bg-background/50"
                />
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/20">
                <Switch 
                  id="estado-registro-persona" 
                  checked={formData.activo} 
                  onCheckedChange={(isChecked) => setFormData({ ...formData, activo: isChecked })}
                />
                <Label htmlFor="estado-registro-persona" className={`font-medium ${formData.activo ? 'text-success' : 'text-muted-foreground'}`}>
                  {formData.activo ? 'Activo' : 'Inactivo'}
                </Label>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!formData.nombre || !formData.apellido || !formData.email || !formData.rol}
                variant="professional"
              >
                <UserPlus className="mr-2 h-4 w-4" /> 
                Agregar Persona
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>

      {/* Professional People List */}
      <div className="lg:col-span-2">
        <Card className="shadow-sm border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-primary">Personas Existentes</CardTitle>
                  <CardDescription>{personas.length} persona(s) registrada(s)</CardDescription>
                </div>
              </div>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nombre, email o teléfono..." 
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
                    <TableHead className="font-semibold">Nombre Completo</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Email</TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold">Rol</TableHead>
                    <TableHead className="text-center font-semibold">Estado</TableHead>
                    <TableHead className="text-right pr-6 font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personasFiltradas.length > 0 ? (
                    personasFiltradas.map((p) => (
                      <TableRow key={p.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          <div>
                            <div className="font-semibold">{p.nombre} {p.apellido}</div>
                            {p.nro_celular && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                {p.nro_celular}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {p.email}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="font-medium">
                            {p.rol || 'Sin rol'}
                          </Badge>
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
                              onClick={() => setPersonaAEliminar(p)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground bg-secondary/10">
                        {filtro ? 'No se encontraron personas con ese criterio.' : 'No hay personas registradas aún.'}
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
      {editFormData && (
        <Dialog open={!!personaAEditar} onOpenChange={(isOpen) => !isOpen && closeEditModal()}>
          <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-0 shadow-xl">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Editar Persona
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Modifica los datos de "{personaAEditar?.nombre} {personaAEditar?.apellido}" y guarda los cambios.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditarSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="nombre-edit">Nombre *</Label>
                  <Input 
                    id="nombre-edit"
                    placeholder="Nombre" 
                    value={editFormData.nombre} 
                    onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })} 
                    required 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido-edit">Apellido *</Label>
                  <Input 
                    id="apellido-edit"
                    placeholder="Apellido" 
                    value={editFormData.apellido} 
                    onChange={(e) => setEditFormData({ ...editFormData, apellido: e.target.value })} 
                    required 
                    className="bg-background/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-edit">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email-edit"
                    type="email" 
                    placeholder="correo@ejemplo.com" 
                    value={editFormData.email} 
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} 
                    required 
                    className="pl-10 bg-background/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="celular-edit">Nro. Celular</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="celular-edit"
                    placeholder="999 999 999" 
                    value={editFormData.nro_celular} 
                    onChange={(e) => setEditFormData({ ...editFormData, nro_celular: e.target.value })} 
                    className="pl-10 bg-background/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Rol *</Label>
                <Select 
                  onValueChange={(value) => setEditFormData({ ...editFormData, rol: value })} 
                  value={editFormData.rol} 
                  required
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesDisponiblesParaEdicion.map((rol, index) => (
                      <SelectItem key={index} value={rol.nombre}>{rol.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valor-edit">Valor</Label>
                <Input 
                  id="valor-edit"
                  placeholder="Valor asociado" 
                  value={editFormData.valor} 
                  onChange={(e) => setEditFormData({ ...editFormData, valor: e.target.value })} 
                  className="bg-background/50"
                />
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/20">
                <Switch
                  id="estado-persona-edit"
                  checked={editFormData.activo}
                  onCheckedChange={(isChecked) => setEditFormData({ ...editFormData, activo: isChecked })}
                />
                <Label htmlFor="estado-persona-edit" className={`font-medium ${editFormData.activo ? 'text-success' : 'text-muted-foreground'}`}>
                  {editFormData.activo ? 'Activo' : 'Inactivo'}
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
      )}
      
      {/* Professional Delete Confirmation */}
      <AlertDialog open={!!personaAEliminar} onOpenChange={(isOpen) => !isOpen && setPersonaAEliminar(null)}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-sm border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              ¿Estás absolutamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. Esto eliminará permanentemente a 
              <span className="font-semibold text-foreground"> "{personaAEliminar?.nombre} {personaAEliminar?.apellido}"</span> 
              {" "}y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPersonaAEliminar(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEliminarConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar persona
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}