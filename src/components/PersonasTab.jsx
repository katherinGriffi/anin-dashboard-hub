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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Users, Search, Pencil, Trash2, Mail, Phone, Settings, CheckCircle, XCircle } from 'lucide-react';
import { RolesManager } from './RolesManager';

// --- COMPONENTE MODAL REUTILIZABLE PARA AÑADIR/EDITAR ---
function PersonaFormModal({ isOpen, onClose, persona, roles, onSubmit }) {
  const initialState = { nombre: "", apellido: "", email: "",  nro_celular: "", rol: "", valor: "", activo: true };
  const [formData, setFormData] = useState(initialState);

  // --- CORRECCIÓN APLICADA AQUÍ ---
  React.useEffect(() => {
    if (persona) {
      // Nos aseguramos de que cada campo tenga un valor válido (string vacío por defecto)
      setFormData({
        ...initialState,
        ...persona,
        nro_celular: persona.nro_celular || "",
        valor: persona.valor || "",
        rol: persona.rol || "", // Aseguramos que rol sea un string
        activo: persona.activo !== undefined ? persona.activo : true // Aseguramos que activo sea booleano
      });
    } else {
      setFormData(initialState);
    }
  }, [persona, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {persona ? "Editar Persona" : "Registrar Nueva Persona"}
          </DialogTitle>
          <DialogDescription>
            {persona
              ? `Modifica los datos de "${persona.nombre} ${persona.apellido}" y guarda los cambios.`
              : "Completa los datos para añadir una persona al sistema."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Nombre *</Label><Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Apellido *</Label><Input value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} required /></div>
          </div>
          <div className="space-y-2"><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Nro. Celular</Label><Input value={formData.nro_celular} onChange={(e) => setFormData({ ...formData, nro_celular: e.target.value })} /></div>
          <div className="space-y-2"><Label>Rol *</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, rol: value })} value={formData.rol} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.filter(r => r).map((r, i) => (
                  <SelectItem key={r.id || i} value={r.nombre}>{r.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Valor</Label><Input value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} /></div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/20">
            <Switch id="estado" checked={formData.activo} onCheckedChange={(c) => setFormData({ ...formData, activo: c })} />
            <Label htmlFor="estado">{formData.activo ? 'Activo' : 'Inactivo'}</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="professional">{persona ? "Guardar Cambios" : "Agregar Persona"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- COMPONENTE PRINCIPAL ---
export function PersonasTab({ personas = [], roles = [], onRegistrarPersona, onEditarPersona, onEliminarPersona, onAddRole, onUpdateRole, onDeleteRole }) {
  const [modalState, setModalState] = useState({ isOpen: false, persona: null });
  const [personaAEliminar, setPersonaAEliminar] = useState(null);
  const [filtro, setFiltro] = useState("");

  const personasFiltradas = useMemo(() =>
    personas.filter(p =>
      p && (
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(filtro.toLowerCase()) ||
        p.email.toLowerCase().includes(filtro.toLowerCase())
      )
    ), [personas, filtro]
  );
  
  const handleFormSubmit = (data) => {
    if (data.id) {
      onEditarPersona(data);
    } else {
      onRegistrarPersona(data);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
      {/* Columna Izquierda: Tabla de Personas */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full"><Users className="h-6 w-6 text-primary" /></div>
                <div>
                  <CardTitle className="text-primary">Gestión de Personas</CardTitle>
                  <CardDescription>{personas.length} persona(s) registrada(s)</CardDescription>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por nombre o email..." className="pl-9" value={filtro} onChange={e => setFiltro(e.target.value)} />
                </div>
                <Button onClick={() => setModalState({ isOpen: true, persona: null })} variant="professional" className="shrink-0">
                  <UserPlus className="mr-2 h-4 w-4" /> Nueva Persona
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead className="hidden md:table-cell">Contacto</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="hidden lg:table-cell">Rol</TableHead>
                  <TableHead className="text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personasFiltradas.length > 0 ? (
                  personasFiltradas.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.nombre} ${p.apellido}`} alt={`${p.nombre} ${p.apellido}`} />
                            <AvatarFallback>{p.nombre?.[0]}{p.apellido?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{p.nombre} {p.apellido}</div>
                            <div className="text-sm text-muted-foreground md:hidden">{p.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <div className="flex items-center gap-2 text-sm"><Mail className="h-3.5 w-3.5" />{p.email}</div>
                          {p.nro_celular && <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1"><Phone className="h-3.5 w-3.5" />{p.nro_celular}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={p.activo ? 'success' : 'secondary'} className="capitalize">
                          {p.activo ? <CheckCircle className="mr-1 h-3.5 w-3.5" /> : <XCircle className="mr-1 h-3.5 w-3.5" />}
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">{typeof p.rol === 'string' ? p.rol : 'Sin rol'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary" onClick={() => setModalState({ isOpen: true, persona: p })}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => setPersonaAEliminar(p)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center">No se encontraron personas.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
     
      {/* Modales */}
      <PersonaFormModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, persona: null })}
        persona={modalState.persona}
        roles={roles}
        onSubmit={handleFormSubmit}
      />
      
      <AlertDialog open={!!personaAEliminar} onOpenChange={(isOpen) => !isOpen && setPersonaAEliminar(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="text-destructive">¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción es permanente y eliminará a "{personaAEliminar?.nombre} {personaAEliminar?.apellido}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { onEliminarPersona(personaAEliminar); setPersonaAEliminar(null); }} className="bg-destructive hover:bg-destructive/90">Sí, eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}