import React, { useState, useMemo, useEffect } from 'react';
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
import { UserPlus, Users, Search, Pencil, Trash2, Mail, Phone, CheckCircle, XCircle, Briefcase } from 'lucide-react';

// ===================================================================================
// --- COMPONENTE MODAL REUTILIZABLE (DISEÑO PROFESIONAL) ---
// ===================================================================================
function PersonaFormModal({ isOpen, onClose, persona, roles, onSubmit }) {
  const initialState = {
    nombre: "",
    apellido: "",
    email: "",
    nro_celular: "",
    rol: "",
    valor: "",
    activo: true,
  };
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      if (persona) {
        // Si estamos editando, llenamos el formulario con los datos de la persona
        setFormData({
          ...initialState, // Empezamos con el estado inicial para evitar campos undefined
          ...persona,
          nro_celular: persona.nro_celular || "",
          valor: persona.valor || "",
          rol: persona.rol || "",
          activo: persona.activo !== undefined ? persona.activo : true,
        });
      } else {
        // Si estamos creando, reseteamos al estado inicial
        setFormData(initialState);
      }
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
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {persona ? "Editar Persona" : "Registrar Nueva Persona"}
          </DialogTitle>
          <DialogDescription>
            {persona
              ? `Modifica los datos de "${persona.nombre} ${persona.apellido}" y guarda los cambios.`
              : "Completa los datos para añadir una nueva persona al sistema."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input id="apellido" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} required className="bg-background/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="bg-background/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="nro_celular">Nro. Celular</Label>
              <Input id="nro_celular" value={formData.nro_celular} onChange={(e) => setFormData({ ...formData, nro_celular: e.target.value })} className="bg-background/50" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input id="valor" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} className="bg-background/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Rol *</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, rol: value })} value={formData.rol} required>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Seleccionar un Rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.filter(r => r && r.nombre).map((r, i) => (
                  <SelectItem key={r.rowIndex || i} value={r.nombre}>{r.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
         
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/20">
            <Switch id="estado" checked={formData.activo} onCheckedChange={(c) => setFormData({ ...formData, activo: c })} />
            <Label htmlFor="estado" className={`font-medium ${formData.activo ? 'text-success' : 'text-muted-foreground'}`}>
              {formData.activo ? 'Usuario Activo' : 'Usuario Inactivo'}
            </Label>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="professional">{persona ? "Guardar Cambios" : "Agregar Persona"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ===================================================================================
// --- COMPONENTE PRINCIPAL DE LA PESTAÑA ---
// ===================================================================================
export function PersonasTab({ personas = [], roles = [], onRegistrarPersona, onEditarPersona, onEliminarPersona }) {
  const [modalState, setModalState] = useState({ isOpen: false, persona: null });
  const [personaAEliminar, setPersonaAEliminar] = useState(null);
  const [filtro, setFiltro] = useState("");

  const personasFiltradas = useMemo(() =>
    personas.filter(p =>
      p && (
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(filtro.toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(filtro.toLowerCase())) ||
        (p.rol && p.rol.toLowerCase().includes(filtro.toLowerCase()))
      )
    ), [personas, filtro]
  );
  
  const handleFormSubmit = (data) => {
    // Si la data tiene un 'rowIndex', significa que es una edición
    if (data.rowIndex) {
      onEditarPersona(data);
    } else {
      onRegistrarPersona(data);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
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
                <Input placeholder="Buscar por nombre, email o rol..." className="pl-9" value={filtro} onChange={e => setFiltro(e.target.value)} />
              </div>
              <Button onClick={() => setModalState({ isOpen: true, persona: null })} variant="professional" className="shrink-0">
                <UserPlus className="mr-2 h-4 w-4" /> Nueva Persona
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Nombre Completo</TableHead>
                  <TableHead className="hidden md:table-cell">Contacto</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="hidden lg:table-cell">Rol</TableHead>
                  <TableHead className="text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personasFiltradas.length > 0 ? (
                  personasFiltradas.map((p) => (
                    <TableRow key={p.rowIndex}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.nombre} `} alt={`${p.nombre} `} />
                            <AvatarFallback>{p.nombre?.[0]}{p.apellido?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{p.nombre} {p.apellido}</div>
                            {/* ✅ CORRECCIÓN: Info visible en móvil */}
                            <div className="text-xs text-muted-foreground md:hidden space-y-1 mt-1">
                               {p.rol && <div className="flex items-center gap-1.5"><Briefcase className="h-3 w-3" />{p.rol}</div>}
                               {p.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{p.email}</div>}
                               {p.nro_celular && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{p.nro_celular}</div>}
                            </div>
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
                        <Badge variant="outline">{p.rol || 'Sin rol'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => setModalState({ isOpen: true, persona: p })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setPersonaAEliminar(p)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center">No se encontraron personas con los filtros actuales.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Modales */}
      <PersonaFormModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, persona: null })}
        persona={modalState.persona}
        roles={roles}
        onSubmit={handleFormSubmit}
      />
      
      <AlertDialog open={!!personaAEliminar} onOpenChange={(isOpen) => !isOpen && setPersonaAEliminar(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">¿Estás completamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción es permanente y eliminará a <span className="font-bold text-foreground">"{personaAEliminar?.nombre} {personaAEliminar?.apellido}"</span> del sistema.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => { onEliminarPersona(personaAEliminar); setPersonaAEliminar(null); }} className="bg-destructive hover:bg-destructive/90">
                    Sí, eliminar persona
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}