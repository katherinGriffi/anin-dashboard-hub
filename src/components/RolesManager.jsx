import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

export function RolesManager({ roles = [], onAddRole, onUpdateRole, onDeleteRole }) {
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRole, setEditingRole] = useState(null); // Objeto completo del rol: { nombre, rowIndex }
  const [deletingRole, setDeletingRole] = useState(null); // Objeto completo del rol: { nombre, rowIndex }

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      onAddRole(newRoleName.trim());
      setNewRoleName("");
    }
  };

  const handleUpdateRole = () => {
    if (editingRole && editingRole.nombre.trim()) {
      // Pasamos el objeto completo a la función padre
      onUpdateRole(editingRole);
      setEditingRole(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingRole) {
      // Pasamos el objeto completo a la función padre
      onDeleteRole(deletingRole);
      setDeletingRole(null);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-none">
        <CardContent className="p-0 pt-4 space-y-2 max-h-[400px] overflow-y-auto">
          {roles.length > 0 ? roles.map((rol) => (
            <div key={rol.rowIndex} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              
              {/* --- MODO EDICIÓN --- */}
              {editingRole?.rowIndex === rol.rowIndex ? (
                <Input
                  value={editingRole?.nombre ?? ""}
                  onChange={(e) => setEditingRole({ ...editingRole, nombre: e.target.value })}
                  className="bg-background h-9"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateRole()}
                />
              ) : (
                // --- MODO LECTURA ---
                <span className="font-medium text-foreground">
                  {rol?.nombre ?? "Sin nombre"}
                </span>
              )}
              
              <div className="flex items-center gap-1">
                {editingRole?.rowIndex === rol.rowIndex ? (
                  // --- BOTONES: GUARDAR Y CANCELAR ---
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-500/10 hover:text-green-600" onClick={handleUpdateRole}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-secondary" onClick={() => setEditingRole(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  // --- BOTONES: EDITAR Y ELIMINAR ---
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary" 
                      onClick={() => setEditingRole({ ...rol })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeletingRole(rol)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )) : (
            <p className="text-sm text-center text-muted-foreground py-4">No hay roles definidos.</p>
          )}

        </CardContent>
        <CardFooter className="pt-6">
          <div className="flex w-full items-center gap-2">
            <Input
              placeholder="Nombre del nuevo rol..."
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
              className="bg-background/50"
            />
            <Button onClick={handleAddRole} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Añadir Rol
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingRole} onOpenChange={(isOpen) => !isOpen && setDeletingRole(null)}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-sm border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">¿Confirmas la eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente. Se eliminará el rol <span className="font-bold text-foreground">"{deletingRole?.nombre}"</span>.
              Las personas que tengan este rol quedarán sin asignación y deberás asignárselo de nuevo manualmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingRole(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}