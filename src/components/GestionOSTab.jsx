import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Calendar,
  Plus,
  User,
  Building,
  ArrowUpDown,
  Edit,
  Trash2,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

export function GestionOSTab({
  osList = [],
  personas = [],
  proyectos = [],
  onRegistrarOS = () => console.warn("onRegistrarOS no está definido"),
  onEditarOS = () => console.warn("onEditarOS no está definido"),
  onEliminarOS = () => console.warn("onEliminarOS no está definido"),
}){
  const initialState = {
    personaId: "",
    proyectoId: "",
    tipoContrato: "",
    duracion: "",
    fechaInicio: "",
    fechaFin: "",
    numeroEntregables: "",
    primerEntregable: "",
    segundoEntregable: "",
    tercerEntregable: "",
    cuartoEntregable: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [showModal, setShowModal] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "diasRestantes",
    direction: "ascending",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [filtroProyecto, setFiltroProyecto] = useState("all");  
  const [filtroTipo, setFiltroTipo] = useState("all");         
  const [filtroEstado, setFiltroEstado] = useState("all");     
  const [filtroPersona, setFiltroPersona] = useState("all");    
  const [showFilters, setShowFilters] = useState(false);
  const isCasContract = formData.tipoContrato === "CAS";
  const isOsContract = formData.tipoContrato === "OS"

  // --- Handlers ---
  const openModal = (os = null) => {
    if (os) {
      setModoEdicion(true);
      setFormData(os);
    } else {
      setModoEdicion(false);
      setFormData(initialState);
    }
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setFormData(initialState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      onEditarOS(formData);
    } else {
      onRegistrarOS(formData);
    }
    closeModal();
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta OS?")) {
      onEliminarOS(id);
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (isCasContract) {
      setFormData((prev) => ({
        ...prev,
        duracion: "Indeterminado",
        fechaFin: "Indeterminado",
        numeroEntregables: "",
        primerEntregable: "",
        segundoEntregable: "",
        tercerEntregable: "",
        cuartoEntregable: "",
      }));
    } else {
      // Al cambiar a OS, limpiar duración y fechaFin para que se recalculen
      setFormData((prev) => ({ ...prev, duracion: "", fechaFin: "" }));
    }
  }, [isCasContract]);

  useEffect(() => {
    // Calcula fecha de fin basado en inicio y duración solo para OS
    if (isOsContract && formData.fechaInicio && formData.duracion > 0) {
      const startDate = new Date(formData.fechaInicio + "T00:00:00");
      const durationDays = parseInt(formData.duracion, 10);
      startDate.setDate(startDate.getDate() + durationDays);
      const day = String(startDate.getDate()).padStart(2, "0");
      const month = String(startDate.getMonth() + 1).padStart(2, "0");
      const year = startDate.getFullYear();
      setFormData((prev) => ({ ...prev, fechaFin: `${day}/${month}/${year}` }));
    }
  }, [formData.fechaInicio, formData.duracion, isOsContract]);

  // ✅ NUEVO useEffect para calcular entregables
  useEffect(() => {
    const clearDeliverables = (prev) => ({
        ...prev,
        primerEntregable: "",
        segundoEntregable: "",
        tercerEntregable: "",
        cuartoEntregable: "",
    });

    // Condiciones para calcular: ser OS, y tener los 3 datos necesarios.
    if (!isOsContract || !formData.fechaInicio || !formData.fechaFin || !(formData.numeroEntregables > 0)) {
        setFormData(clearDeliverables);
        return;
    }

    try {
        const startDate = new Date(formData.fechaInicio + "T00:00:00");
        const [day, month, year] = formData.fechaFin.split('/');
        const endDate = new Date(`${year}-${month}-${day}T00:00:00`);

        // Validar que las fechas sean correctas
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
            setFormData(clearDeliverables);
            return;
        }

        const numEntregables = parseInt(formData.numeroEntregables, 10);
        
        // Si solo hay un entregable, su fecha es la fecha de fin.
        if (numEntregables === 1) {
             setFormData(prev => ({
                ...clearDeliverables(prev),
                primerEntregable: formData.fechaFin,
            }));
            return;
        }

        const totalTimeSpan = endDate.getTime() - startDate.getTime();
        // El intervalo se calcula entre los puntos, no sobre la duración total.
        const interval = totalTimeSpan / (numEntregables - 1);

        const newEntregables = {};
        const fields = ["primerEntregable", "segundoEntregable", "tercerEntregable", "cuartoEntregable"];

        for (let i = 0; i < numEntregables && i < fields.length; i++) {
            // La fecha de cada entregable se calcula sumando los intervalos a la fecha de inicio
            const entregableDate = new Date(startDate.getTime() + i * interval);
            
            const d = String(entregableDate.getDate()).padStart(2, "0");
            const m = String(entregableDate.getMonth() + 1).padStart(2, "0");
            const y = entregableDate.getFullYear();
            newEntregables[fields[i]] = `${d}/${m}/${y}`;
        }
        
        // Forzamos que el último entregable sea exactamente la fecha de fin para evitar errores de milisegundos
        newEntregables[fields[numEntregables-1]] = formData.fechaFin;

        // Limpiar los campos de entregables que no se usarán
        for (let i = numEntregables; i < fields.length; i++) {
            newEntregables[fields[i]] = "";
        }

        setFormData((prev) => ({
            ...prev,
            ...newEntregables,
        }));

    } catch (error) {
        console.error("Error al calcular fechas de entregables:", error);
        setFormData(clearDeliverables);
    }
  }, [formData.fechaInicio, formData.fechaFin, formData.numeroEntregables, isOsContract]);

  // --- Helpers ---
  const calcularDiasRestantes = (fechaFin) => {
    if (!fechaFin || fechaFin === "Indeterminado" || !/^\d{2}\/\d{2}\/\d{4}$/.test(fechaFin)) return null;
    const [day, month, year] = fechaFin.split('/');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fin = new Date(year, month - 1, day);
    const diffTime = fin - hoy;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getEstadoFechaBadge = (diasRestantes) => {
    if (diasRestantes === null) return { variant: "secondary", icon: null };
    if (diasRestantes < 0) return { variant: "destructive", icon: <XCircle className="h-3.5 w-3.5 mr-1" /> };
    if (diasRestantes <= 7) return { variant: "warning", icon: <Clock className="h-3.5 w-3.5 mr-1" /> };
    return { variant: "success", icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> };
  };

  const getEstadoOS = (diasRestantes, tipoContrato) => {
    if (tipoContrato === "CAS") return { text: "Vigente", variant: "success", icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> };
    if (diasRestantes === null) return { text: "Indefinido", variant: "secondary", icon: <AlertCircle className="h-3.5 w-3.5 mr-1" /> };
    if (diasRestantes < 0) return { text: "No Vigente", variant: "destructive", icon: <XCircle className="h-3.5 w-3.5 mr-1" /> };
    return { text: "Vigente", variant: "success", icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> };
  };

  const sortedAndFilteredOsList = useMemo(() => {
    const enriched = osList.map((os) => {
      const persona = personas.find((p) => p.id === os.personaId);
      const proyecto = proyectos.find((p) => p.id === os.proyectoId);
      const diasRestantes = calcularDiasRestantes(os.fechaFin);
      return {
        ...os,
        personaNombre: persona ? `${persona.nombre} ${persona.apellido}` : "N/A",
        proyectoNombre: proyecto ? proyecto.nombre : "N/A",
        diasRestantes,
        estado: getEstadoOS(diasRestantes, os.tipoContrato).text,
      };
    });

    let filtered = enriched.filter((os) => {
      const s = filtro.toLowerCase();
      return (
        (!filtro || os.personaNombre.toLowerCase().includes(s) || os.proyectoNombre.toLowerCase().includes(s) || (os.tipoContrato || "").toLowerCase().includes(s)) &&
        (filtroProyecto === "all" || os.proyectoId?.toString() === filtroProyecto) &&
        (filtroPersona === "all" || os.personaId?.toString() === filtroPersona) &&
        (filtroTipo === "all" || os.tipoContrato === filtroTipo) &&
        (filtroEstado === "all" || os.estado === filtroEstado)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        let comparison = 0;
        if (valA > valB) comparison = 1;
        else if (valA < valB) comparison = -1;
        return sortConfig.direction === "descending" ? -comparison : comparison;
      });
    }
    return filtered;
  }, [osList, personas, proyectos, filtro, filtroProyecto, filtroTipo, filtroEstado, filtroPersona, sortConfig]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    setSortConfig({ key, direction });
  };

  const SortableHeader = ({ children, columnKey }) => {
    const isSorting = sortConfig.key === columnKey;
    const directionIcon = sortConfig.direction === "ascending" ? "🔼" : "🔽";
    return (
      <TableHead
        className="font-semibold cursor-pointer hover:bg-secondary/40"
        onClick={() => handleSort(columnKey)}
      >
        <div className="flex items-center gap-2">
          {children}
          {isSorting ? (
            <span>{directionIcon}</span>
          ) : (
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </TableHead>
    );
  };

  const isFormValid = () => {
    const base = formData.personaId && formData.proyectoId && formData.tipoContrato && formData.fechaInicio;
    if (isOsContract) return base && formData.duracion > 0 && formData.numeroEntregables > 0;
    return base;
  };

  const clearFilters = () => {
    setFiltro("");
    setFiltroProyecto("all");
    setFiltroTipo("all");
    setFiltroEstado("all");
    setFiltroPersona("all");
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <Card className="shadow-md border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-primary">Gestión de Órdenes de Servicio</CardTitle>
                <CardDescription>
                  {osList.length} orden(es) registrada(s)
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar OS, persona o proyecto..."
                  className="pl-9 bg-background/50 text-sm"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" /> Filtros
              </Button>
              <Button onClick={() => openModal()} className="shrink-0 bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Nueva OS
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="pt-4 border-t">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Proyecto</Label>
                <Select value={filtroProyecto} onValueChange={setFiltroProyecto}>
                  <SelectTrigger className="w-[180px] bg-background/50 text-sm">
                    <SelectValue placeholder="Todos los proyectos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los proyectos</SelectItem>
                    {proyectos.map((proyecto) => (
                      <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                        {proyecto.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Persona</Label>
                <Select value={filtroPersona} onValueChange={setFiltroPersona}>
                  <SelectTrigger className="w-[180px] bg-background/50 text-sm">
                    <SelectValue placeholder="Todas las personas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las personas</SelectItem>
                    {personas.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id.toString()}>
                        {persona.nombre} {persona.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-[180px] bg-background/50 text-sm">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="OS">OS</SelectItem>
                    <SelectItem value="CAS">CAS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-[180px] bg-background/50 text-sm">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Vigente">Vigente</SelectItem>
                    <SelectItem value="No Vigente">No Vigente</SelectItem>
                    <SelectItem value="Indefinido">Indefinido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="ghost" onClick={clearFilters} className="h-10">
                <X className="mr-2 h-4 w-4" /> Limpiar
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tabla */}
      <Card className="shadow-md border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/20 hover:bg-secondary/30">
                  <TableHead className="text-center">ID</TableHead>
                  <SortableHeader columnKey="personaNombre">Persona</SortableHeader>
                  <SortableHeader columnKey="proyectoNombre">Proyecto</SortableHeader>
                  <TableHead className="text-center">Tipo</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Fecha Fin</TableHead>
                  <SortableHeader columnKey="diasRestantes">Días Restantes</SortableHeader>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredOsList.length > 0 ? (
                  sortedAndFilteredOsList.map((os) => {
                    const estadoOS = getEstadoOS(os.diasRestantes, os.tipoContrato);
                    const estadoFecha = getEstadoFechaBadge(os.diasRestantes);
                    
                    return (
                      <TableRow key={os.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-medium text-primary text-center">
                          {os.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{os.personaNombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{os.proyectoNombre}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={os.tipoContrato === "OS" ? "default" : "secondary"}>
                            {os.tipoContrato}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={estadoOS.variant} className="flex items-center justify-center gap-1 w-full">
                            {estadoOS.icon}
                            {estadoOS.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {os.fechaFin && os.fechaFin !== "Indeterminado"
                            ? os.fechaFin
                            : "Indeterminado"}
                        </TableCell>
                        <TableCell className="text-center">
                          {os.diasRestantes !== null && os.diasRestantes < 0 ? (
                            <Badge variant="destructive" className="flex items-center justify-center gap-1">
                              <XCircle className="h-3.5 w-3.5" />
                              Finalizado
                            </Badge>
                          ) : os.diasRestantes !== null ? (
                            <Badge variant={estadoFecha.variant} className="flex items-center justify-center gap-1">
                              {estadoFecha.icon}
                              {os.diasRestantes} días
                            </Badge>
                          ) : (
                            <Badge variant="secondary">N/A</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openModal(os)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleEliminar(os.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground bg-secondary/10"
                    >
                      {filtro || filtroProyecto !== 'all' || filtroTipo !== 'all' || filtroEstado !== 'all' || filtroPersona !== 'all'
                        ? "No se encontraron órdenes con ese criterio."
                        : "No hay órdenes registradas aún."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={(isOpen) => !isOpen && closeModal()}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary">
              {modoEdicion ? "Editar" : "Registrar Nueva"} Orden de Servicio
            </DialogTitle>
            <DialogDescription>
              Complete los datos para {modoEdicion ? "editar" : "crear una nueva"} orden.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8 py-4">
            {/* Información básica */}
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2">
                <FileText className="h-4 w-4" /> Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="persona">Persona *</Label>
                  <Select
                    value={String(formData.personaId)}
                    onValueChange={(v) => setFormData({ ...formData, personaId: v })}
                    required
                  >
                    <SelectTrigger id="persona" className="bg-background/50 text-sm">
                      <SelectValue placeholder="Seleccionar persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas
                        .filter((p) => p.activo)
                        .map((persona) => (
                          <SelectItem key={persona.id} value={String(persona.id)}>
                            {persona.nombre} {persona.apellido}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proyecto">Proyecto *</Label>
                  <Select
                    value={String(formData.proyectoId)}
                    onValueChange={(v) => setFormData({ ...formData, proyectoId: v })}
                    required
                  >
                    <SelectTrigger id="proyecto" className="bg-background/50 text-sm">
                      <SelectValue placeholder="Seleccionar proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {proyectos
                        .filter((p) => p.activo)
                        .map((proyecto) => (
                          <SelectItem key={proyecto.id} value={String(proyecto.id)}>
                            {proyecto.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tipoContrato">Tipo de Contrato *</Label>
                  <Select
                    value={formData.tipoContrato}
                    onValueChange={(v) => setFormData({ ...formData, tipoContrato: v })}
                    required
                  >
                    <SelectTrigger id="tipoContrato" className="bg-background/50 text-sm">
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
                    type={isCasContract ? "text" : "number"}
                    placeholder={isCasContract ? "" : "Ej. 90"}
                    value={formData.duracion}
                    onChange={(e) =>
                      setFormData({ ...formData, duracion: e.target.value })
                    }
                    required
                    disabled={isCasContract}
                    className="bg-background/50 text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Fechas */}
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2">
                <Calendar className="h-4 w-4" /> Fechas Importantes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaInicio: e.target.value })
                    }
                    required
                    className="bg-background/50 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha de Fin (Calculada)</Label>
                  <Input
                    id="fechaFin"
                    type="text"
                    value={formData.fechaFin}
                    readOnly
                    disabled
                    className="bg-background/50 cursor-not-allowed text-sm"
                  />
                </div>
              </div>
            </section>
                
            {/* ✅ SECCIÓN DE ENTREGABLES MODIFICADA */}
            {isOsContract && (
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2">
                  <FileText className="h-4 w-4" /> Plan de Entregables
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="numeroEntregables">Nro. de Entregables (1 a 4) *</Label>
                  <Input
                    id="numeroEntregables"
                    type="number"
                    placeholder="Ej. 3"
                    min="1"
                    max="4"
                    value={formData.numeroEntregables}
                    onChange={(e) => {
                      const num = parseInt(e.target.value, 10);
                      if (isNaN(num)) {
                        setFormData({ ...formData, numeroEntregables: "" });
                      } else if (num >= 0 && num <= 4) {
                        setFormData({ ...formData, numeroEntregables: num });
                      }
                    }}
                    required={isOsContract}
                    className="bg-background/50 text-sm"
                  />
                </div>

                {formData.numeroEntregables > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {Array.from({ length: formData.numeroEntregables }).map((_, i) => {
                      const fieldName = [
                        "primerEntregable",
                        "segundoEntregable",
                        "tercerEntregable",
                        "cuartoEntregable",
                      ][i];
                      return (
                        <div className="space-y-2" key={fieldName}>
                          <Label>{`${i + 1}° Entregable (Calculado)`}</Label>
                          <Input
                            value={formData[fieldName] || "Calculando..."}
                            disabled
                            className="bg-background/50 text-sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            <DialogFooter className="pt-6 border-t">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!isFormValid()} className="bg-primary hover:bg-primary/90">
                {modoEdicion ? "Guardar Cambios" : "Registrar Orden"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}