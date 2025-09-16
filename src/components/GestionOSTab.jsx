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
  Clock,
  XCircle,
} from "lucide-react";

/**
 * GestionOSTab
 *
 * Props:
 * - osList: array con las OS (cada objeto puede tener las propiedades del excel)
 * - personas: array de personas { id, nombre, apellido, activo }
 * - proyectos: array de proyectos { id, nombre, activo }
 * - onRegistrarOS(formData)
 * - onEditarOS(formData)
 * - onEliminarOS(id)
 *
 * Nota: formData usa campos:
 * - idOs (ID OS - número de orden)
 * - personaId
 * - proyectoId
 * - tipoContrato ("OS"|"CAS")
 * - duracion (días) -- para OS
 * - fechaNotificacion (YYYY-MM-DD)
 * - fechaInicio (YYYY-MM-DD)  <-- lo usamos como inicio para cálculos
 * - fechaFin (dd/mm/yyyy o "Indeterminado")
 * - numeroEntregables (1-4)
 * - primerEntregable ... cuartoEntregable (dd/mm/yyyy)
 * - activa (boolean o "Sí"/"No")
 * - valorOs (valor que no mostramos en la tabla)
 */

export function GestionOSTab({
  osList = [],
  personas = [],
  proyectos = [],
  onRegistrarOS = () => console.warn("onRegistrarOS no está definido"),
  onEditarOS = () => console.warn("onEditarOS no está definido"),
  onEliminarOS = () => console.warn("onEliminarOS no está definido"),
}) {

 const initialState = {
  idOs: "",
  personaId: "",
  proyectoId: "",
  tipoContrato: "",
  duracion: "",
  fechaNotificacion: "",
  fechaFin: "",
  numeroEntregables: "", 
  primerEntregable: "",
  segundoEntregable: "",
  tercerEntregable: "",
  cuartoEntregable: "",
  activa: true,
  valorOs: "",
  frecuenciaDias: "",    // <-- MOVIDO AL FINAL
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
  const isOsContract = formData.tipoContrato === "OS";

  // ---------- Helpers de fecha ----------
  const parseDateFlexible = (dateStr) => {
    // Acepta 'dd/mm/yyyy' o 'yyyy-mm-dd' o null/"" -> devuelve Date o null
    if (!dateStr) return null;
    // dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split("/");
      const dt = new Date(Number(y), Number(m) - 1, Number(d));
      return isNaN(dt.getTime()) ? null : dt;
    }
    // yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const dt = new Date(dateStr + "T00:00:00");
      return isNaN(dt.getTime()) ? null : dt;
    }
    // fallback: try Date parse
    const dt = new Date(dateStr);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  
  // Si ya está en formato dd/mm/yyyy, devolverlo directamente
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  
  // Si es una fecha en formato yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Para otros formatos, intentar parsear con Date
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return "";
  
  const d = String(dt.getDate()).padStart(2, "0");
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const y = dt.getFullYear();
  return `${d}/${m}/${y}`;
};

  // ---------- Modal open/close ----------
 const openModal = (os = null) => {
  if (os) {
    setModoEdicion(true);
    setFormData({
      idOs: os.idOs || os.id || "",
      personaId: os.personaId ? String(os.personaId) : "",
      proyectoId: os.proyectoId ? String(os.proyectoId) : "",
      tipoContrato: os.tipoContrato || "",
      duracion: os.duracion || "",
      fechaNotificacion: os.fechaNotificacion || "",
      fechaFin: os.fechaFin || "",
      numeroEntregables: os.numeroEntregables || "",
      frecuenciaDias: os.frecuenciaDias || "", // Nuevo campo
      primerEntregable: os.primerEntregable || "",
      segundoEntregable: os.segundoEntregable || "",
      tercerEntregable: os.tercerEntregable || "",
      cuartoEntregable: os.cuartoEntregable || "",
      activa: typeof os.activa !== "undefined" ? os.activa : true,
      valorOs: os.valorOs || "",
    });
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


// Función para convertir fecha a número de serie de Excel
const convertDateToExcelSerial = (dateStr) => {
  if (!dateStr || dateStr === "Indeterminado") return dateStr;
  
  const date = parseDateFlexible(dateStr);
  if (!date) return "";
  
  // Excel usa un sistema donde 1 = 1 de enero de 1900
  const excelEpoch = new Date(1899, 11, 30); // 30/12/1899
  const diffTime = date - excelEpoch;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Función para formatear datos para Excel
const formatDataForExcel = (formData) => {
  return {
    "ID OS": formData.idOs || "", // <--- La clave es "ID OS" (con espacio)
    "Persona ID": formData.personaId || "",
    "Proyecto ID": formData.proyectoId || "",
    // ...etc.
  };
};

  // ---------- Submit / eliminar ----------
const handleSubmit = (e) => {
    e.preventDefault();

    // Tus validaciones (que ya comprueban idOs)
    if (!formData.idOs || String(formData.idOs).trim() === "") {
      alert("El Nro de Orden (ID OS) es obligatorio para registrar.");
      return;
    }
    if (!isFormValid()) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }
  
    // ¡Esta es la parte importante!
    const excelFormattedData = formatDataForExcel(formData);
  
    if (modoEdicion) {
      onEditarOS(formData);
    } else {
      onRegistrarOS(formData);
    }
    closeModal();
  };

  const handleEliminar = (os) => {
  if (window.confirm("¿Seguro que deseas eliminar esta OS?")) {
    onEliminarOS(os); // Pasar el objeto completo en lugar de solo el ID
  }
};

  // ---------- Efectos ----------
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
      // NO limpiar idOs: mantener el valor si existe
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      duracion: prev.duracion === "Indeterminado" ? "" : prev.duracion,
      fechaFin: prev.fechaFin === "Indeterminado" ? "" : prev.fechaFin,
    }));
  }
}, [isCasContract]);

  // Calcular fecha fin cuando sea OS y tengamos fechaInicio + duracion
  useEffect(() => {
    if (isOsContract && formData.fechaNotificacion && Number(formData.duracion) > 0) {
      const startDate = parseDateFlexible(formData.fechaNotificacion);
      if (startDate) {
        const durationDays = Number(formData.duracion);
        const endDate = new Date(startDate.getTime());
        endDate.setDate(endDate.getDate() + durationDays);
        const formatted = formatDateToDDMMYYYY(endDate.toISOString().slice(0, 10));
        setFormData((prev) => ({ ...prev, fechaFin: formatted }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.fechaNotificacion, formData.duracion, isOsContract]);

  // Calcular entregables (1..4) distribuidos entre fechaInicio y fechaFin
 // ========== MODIFICACIÓN CENTRAL: CÁLCULO DE ENTREGABLES ==========
  
 useEffect(() => {
  const clearDeliverables = (prev) => ({
    ...prev,
    primerEntregable: "",
    segundoEntregable: "",
    tercerEntregable: "",
    cuartoEntregable: "",
  });

  const { fechaNotificacion, duracion, frecuenciaDias, numeroEntregables } = formData;

  // Si no hay datos suficientes, limpiar entregables y salir
  if (!isOsContract || !fechaNotificacion || !(Number(duracion) > 0) || 
      !(Number(frecuenciaDias) > 0) || !(Number(numeroEntregables) > 0)) {
    setFormData(clearDeliverables);
    return;
  }

  try {
    const startDate = parseDateFlexible(fechaNotificacion);
    if (!startDate) {
      setFormData(clearDeliverables);
      return;
    }

    const totalDays = Number(duracion);
    const frequencyDays = Number(frecuenciaDias);
    const numEntregables = Math.min(Number(numeroEntregables), 4); // Máximo 4 entregables

    if (numEntregables <= 0) {
      setFormData(clearDeliverables);
      return;
    }

    const fields = ["primerEntregable", "segundoEntregable", "tercerEntregable", "cuartoEntregable"];
    const newEntregables = {};

    // Calcular la fecha de cada entregable
    for (let i = 0; i < numEntregables; i++) {
      const daysToAdd = (i + 1) * frequencyDays;
      // Asegurar que no exceda la duración total
      if (daysToAdd > totalDays) break;
      
      const deliverableDate = new Date(startDate.getTime());
      deliverableDate.setDate(deliverableDate.getDate() + daysToAdd);
      newEntregables[fields[i]] = formatDateToDDMMYYYY(deliverableDate);
    }

    // Limpiar los campos de entregables que no se usarán
    for (let i = numEntregables; i < fields.length; i++) {
      newEntregables[fields[i]] = "";
    }

    setFormData((prev) => ({ ...prev, ...newEntregables }));
  } catch (error) {
    console.error("Error al calcular entregables:", error);
    setFormData(clearDeliverables);
  }
}, [formData.fechaNotificacion, formData.duracion, formData.frecuenciaDias, formData.numeroEntregables, isOsContract]);
  // ---------- Cálculos y utilidades para la tabla ----------
  const calcularDiasRestantes = (fechaFin) => {
  if (!fechaFin || fechaFin === "Indeterminado") return null;
  
  // Convertir fecha en formato dd/mm/yyyy a Date object
  let finDate;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaFin)) {
    const [day, month, year] = fechaFin.split("/");
    finDate = new Date(Number(year), Number(month) - 1, Number(day));
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
    // Si viene en formato yyyy-mm-dd
    finDate = new Date(fechaFin + "T00:00:00");
  } else {
    return null;
  }
  
  if (isNaN(finDate.getTime())) return null;
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  finDate.setHours(0, 0, 0, 0);
  
  const diffTime = finDate - hoy;
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

  // Enriquecer lista y formatear campos para mostrar en tabla
  const sortedAndFilteredOsList = useMemo(() => {
    const enriched = osList.map((os) => {
      const persona = personas.find((p) => p.id === os.personaId);
      const proyecto = proyectos.find((p) => p.id === os.proyectoId);
      // Aceptar fechaFin ya en dd/mm/yyyy o en yyyy-mm-dd
      const fechaFinDisplay = os.fechaFin ? formatDateToDDMMYYYY(os.fechaFin) : "";
      const fechaNotificacionDisplay = os.fechaNotificacion ? formatDateToDDMMYYYY(os.fechaNotificacion) : "";
      const entreg1 = os.primerEntregable ? formatDateToDDMMYYYY(os.primerEntregable) : "";
      const entreg2 = os.segundoEntregable ? formatDateToDDMMYYYY(os.segundoEntregable) : "";
      const entreg3 = os.tercerEntregable ? formatDateToDDMMYYYY(os.tercerEntregable) : "";
      const entreg4 = os.cuartoEntregable ? formatDateToDDMMYYYY(os.cuartoEntregable) : "";
      const diasRestantes = calcularDiasRestantes(fechaFinDisplay);
      return {
        ...os,
        idOs: os.idOs ?? os.id ?? "",
        personaNombre: persona ? `${persona.nombre} ${persona.apellido}` : "N/A",
        proyectoNombre: proyecto ? proyecto.nombre : "N/A",
        fechaFinDisplay,
        fechaNotificacionDisplay,
        primerEntregableDisplay: entreg1,
        segundoEntregableDisplay: entreg2,
        tercerEntregableDisplay: entreg3,
        cuartoEntregableDisplay: entreg4,
        diasRestantes,
        estado: getEstadoOS(diasRestantes, os.tipoContrato).text,
      };
    });

    let filtered = enriched.filter((os) => {
      const s = filtro.toLowerCase();
      const matchesSearch =
        !filtro ||
        (os.personaNombre && os.personaNombre.toLowerCase().includes(s)) ||
        (os.proyectoNombre && os.proyectoNombre.toLowerCase().includes(s)) ||
        ((os.tipoContrato || "").toLowerCase().includes(s)) ||
        (String(os.idOs || "").toLowerCase().includes(s));

      return (
        matchesSearch &&
        (filtroProyecto === "all" || String(os.proyectoId) === filtroProyecto) &&
        (filtroPersona === "all" || String(os.personaId) === filtroPersona) &&
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
    if (sortConfig.key === key && sortConfig.direction === "ascending") direction = "descending";
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
          {isSorting ? <span>{directionIcon}</span> : <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </TableHead>
    );
  };

const isFormValid = () => {
  const { personaId, proyectoId, tipoContrato, fechaNotificacion, valorOs, duracion, frecuenciaDias, numeroEntregables, idOs } = formData;
  const base = personaId && proyectoId && tipoContrato && fechaNotificacion && valorOs;
  
  if (!base) return false;
  
  // ID OS ahora obligatorio siempre (tanto para CAS como para OS)
  if (!idOs || String(idOs).trim() === "") return false;
  
  if (isOsContract) {
    const freqDias = Number(frecuenciaDias);
    const numEntregables = Number(numeroEntregables);
    
    return Number(duracion) > 0 && 
           freqDias > 0 && 
           numEntregables >= 1 && 
           numEntregables <= 4;
  }
  
  // Para CAS, si pasa la validación base e idOs, es válido
  return true;
};

  const clearFilters = () => {
    setFiltro("");
    setFiltroProyecto("all");
    setFiltroTipo("all");
    setFiltroEstado("all");
    setFiltroPersona("all");
  };

  // ---------- Render ----------
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
                <CardDescription>{osList.length} orden(es) registrada(s)</CardDescription>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar OS, N° orden, persona o proyecto..."
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
    <TableHead className="text-center">Nro Orden</TableHead>
    <SortableHeader columnKey="personaNombre">Persona</SortableHeader>
    <SortableHeader columnKey="proyectoNombre">Proyecto</SortableHeader>
    <TableHead className="text-center">Tipo</TableHead>
    <TableHead className="text-center">Fecha Notificación</TableHead>
    <TableHead className="text-center">Fecha Fin</TableHead>
    <SortableHeader columnKey="diasRestantes">Días Restantes</SortableHeader>
    <TableHead className="text-center">1° Ent.</TableHead>
    <TableHead className="text-center">2° Ent.</TableHead>
    <TableHead className="text-center">3° Ent.</TableHead>
    <TableHead className="text-center">4° Ent.</TableHead>
    <TableHead className="text-center">Acciones</TableHead>
  </TableRow>
</TableHeader>
              <TableBody>
                {sortedAndFilteredOsList.length > 0 ? (
                  sortedAndFilteredOsList.map((os) => {
                    const estadoOS = getEstadoOS(os.diasRestantes, os.tipoContrato);
                    const estadoFecha = getEstadoFechaBadge(os.diasRestantes);

                    return (
                      <TableRow key={os.idOs || os.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-medium text-primary text-center">{os.idOs || "—"}</TableCell>
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
                          <Badge variant={os.tipoContrato === "OS" ? "default" : "secondary"}>{os.tipoContrato}</Badge>
                        </TableCell>
                       
                        <TableCell className="text-center">{os.fechaNotificacionDisplay || "—"}</TableCell>
                        <TableCell className="text-center">{os.fechaFinDisplay || "Indeterminado"}</TableCell>
                        <TableCell className="text-center">
                          {os.diasRestantes !== null && os.diasRestantes < 0 ? (
                            <Badge variant="destructive" className="flex items-center justify-center gap-1">
                              <XCircle className="h-3.5 w-3.5" /> Finalizado
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

                        <TableCell className="text-center">{os.primerEntregableDisplay || "—"}</TableCell>
                        <TableCell className="text-center">{os.segundoEntregableDisplay || "—"}</TableCell>
                        <TableCell className="text-center">{os.tercerEntregableDisplay || "—"}</TableCell>
                        <TableCell className="text-center">{os.cuartoEntregableDisplay || "—"}</TableCell>

                        <TableCell>
  <div className="flex gap-2 justify-center">
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
      onClick={() => openModal(os)}
      aria-label={`Editar OS ${os.idOs || os.id}`}
    >
      <Edit className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
      onClick={() => handleEliminar(os)} // Pasar el objeto completo
      aria-label={`Eliminar OS ${os.idOs || os.id}`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} className="h-24 text-center text-muted-foreground bg-secondary/10">
                      {filtro || filtroProyecto !== "all" || filtroTipo !== "all" || filtroEstado !== "all" || filtroPersona !== "all"
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
  <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md border-0 shadow-xl">
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
          {/* Tipo de Contrato - PRIMER CAMPO */}
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

          {/* ID OS - ahora obligatorio siempre */}
          <div className="space-y-2">
            <Label htmlFor="idOs">Nro Orden *</Label>
<Input
  id="idOs"
  type="text"
  placeholder="Ej. 12345"
  value={formData.idOs}
  onChange={(e) => setFormData({ ...formData, idOs: e.target.value })}
  required // ahora siempre requerido
  className="bg-background/50 text-sm"
/>
          </div>
        </div>

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
                  .filter((p) => p.activo !== false)
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
                  .filter((p) => p.activo !== false)
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
            <Label htmlFor="duracion">Duración (días) {isOsContract ? "*" : ""}</Label>
            <Input
              id="duracion"
              type={isCasContract ? "text" : "number"}
              placeholder={isCasContract ? "" : "Ej. 90"}
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
              required={isOsContract}
              disabled={isCasContract}
              className="bg-background/50 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorOs">Valor *</Label>
            <Input
              id="valorOs"
              type="text"
              placeholder="Ingresar valor total de la OS"
              value={formData.valorOs}
              onChange={(e) => setFormData({ ...formData, valorOs: e.target.value })}
              required
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fechaNotificacion">Fecha de Notificación*</Label>
            <Input
              id="fechaNotificacion"
              type="date"
              value={formData.fechaNotificacion}
              onChange={(e) => setFormData({ ...formData, fechaNotificacion: e.target.value })}
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

      {/* SECCIÓN DE ENTREGABLES MEJORADA */}
     {isOsContract && (
  <section className="space-y-4">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2">
      <FileText className="h-4 w-4" /> Plan de Entregables
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="frecuenciaDias">Frecuencia (días entre entregables) *</Label>
        <Input
          id="frecuenciaDias"
          type="number"
          placeholder="Ej. 30"
          min="1"
          value={formData.frecuenciaDias}
          onChange={(e) => setFormData({ ...formData, frecuenciaDias: e.target.value })}
          required={isOsContract}
          className="bg-background/50 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="numeroEntregables">Número de Entregables *</Label>
        <Input
          id="numeroEntregables"
          type="number"
          placeholder="Ej. 4"
          min="1"
          max="4"
          value={formData.numeroEntregables}
          onChange={(e) => setFormData({ ...formData, numeroEntregables: e.target.value })}
          required={isOsContract}
          className="bg-background/50 text-sm"
        />
      </div>
    </div>

    {/* Entregables con mejor espaciado visual */}
    {formData.primerEntregable && (
      <div className="pt-4">
        <Label className="text-sm font-medium mb-3 block">Fechas de Entregables Calculadas:</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['primerEntregable', 'segundoEntregable', 'tercerEntregable', 'cuartoEntregable'].map((fieldName, i) =>
            formData[fieldName] ? (
              <div className="space-y-2 p-3 bg-muted/30 rounded-md" key={fieldName}>
                <Label className="text-xs font-medium">{`${i + 1}° Entregable`}</Label>
                <div className="flex items-center justify-between text-sm">
                  <span>{formData[fieldName]}</span>
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            ) : null
          )}
        </div>
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
