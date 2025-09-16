import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  FileText, Clock, Users, Package, TrendingUp, Filter, BarChart3,
  PieChart, Target, DollarSign, CalendarDays, Activity, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie
} from 'recharts';

// --- COLOR FIX & CONFIG ---
const CHART_COLORS = ['#3B82F6', '#9F7AEA', '#A855F7', '#22C55E', '#F59E0B', '#F97316', '#EC4899'];
const PIE_COLORS = ['#22C55E', '#F59E0B', '#60A5FA'];
const EVOLUTION_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

// --- HELPER FUNCTIONS ---
const calcularDiasRestantes = (fechaFin) => {
  if (!fechaFin || fechaFin === "Indeterminado") return null;
  
  let finDate;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaFin)) {
    const [day, month, year] = fechaFin.split("/");
    finDate = new Date(Number(year), Number(month) - 1, Number(day));
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
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

const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return "";
  
  const d = String(dt.getDate()).padStart(2, "0");
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const y = dt.getFullYear();
  return `${d}/${m}/${y}`;
};

// --- REUSABLE COMPONENTS ---
const KpiCard = ({ title, value, description, icon: Icon, colorClass = 'text-primary' }) => (
  <Card className="shadow-lg border-0 bg-gradient-to-br from-card via-background/10 to-background/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-')}/20`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-bold ${colorClass} mb-1`}>{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const DataTableCard = ({ title, icon: Icon, colorClass, data, columns, renderRow, noDataContent }) => (
  <Card className="shadow-lg border-0 bg-gradient-to-br from-card via-card/95 to-background/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-')}/10`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {data && data.length > 0 ? (
        <div className="rounded-xl border border-border/50 bg-background/30 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, i) => (
                  <TableHead key={i} className={col.className}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(renderRow)}
            </TableBody>
          </Table>
        </div>
      ) : (
        noDataContent
      )}
    </CardContent>
  </Card>
);

const StackedBarChartCard = ({ title, data, icon: Icon = BarChart3 }) => (
  <Card className="shadow-lg border-0 bg-gradient-to-br from-card via-card/95 to-accent/5 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <CardHeader className="pb-4">
      <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 75 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} stroke="hsl(var(--muted-foreground))" fontSize={11}/>
          <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
          <Legend verticalAlign="top" />
          <Bar dataKey="OS" stackId="a" fill={CHART_COLORS[0]} name="Contratos OS" radius={[3, 3, 0, 0]} />
          <Bar dataKey="CAS" stackId="a" fill={CHART_COLORS[1]} name="Contratos CAS" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const PieChartCard = ({ title, data, icon: Icon = PieChart }) => (
  <Card className="shadow-lg border-0 bg-gradient-to-br from-card via-card/95 to-secondary/5 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <CardHeader className="pb-4">
      <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Icon className="h-4 w-4 text-accent" />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={320}>
        <RechartsPieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value" >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const AreaChartCard = ({ title, data, icon: Icon = Activity }) => (
  <Card className="shadow-lg border-0 bg-gradient-to-br from-card via-card/95 to-success/5 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <CardHeader className="pb-4">
      <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
        <div className="p-2 bg-success/10 rounded-lg">
          <Icon className="h-4 w-4 text-success" />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[2]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={CHART_COLORS[2]} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
          <Area type="monotone" dataKey="value" stroke={CHART_COLORS[2]} fillOpacity={1} fill="url(#colorGradient)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const CumulativeLineChartCard = ({ title, data, projectKeys, icon: Icon = TrendingUp }) => (
  <Card className="shadow-lg border-0 bg-gradient-to-br from-card via-card/95 to-primary/5 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <CardHeader className="pb-4">
      <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
          <Legend verticalAlign="top" />
          {projectKeys.map((key, index) => (
            <Line key={key} type="monotone" dataKey={key} stroke={EVOLUTION_COLORS[index % EVOLUTION_COLORS.length]} name={key} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// --- MAIN DASHBOARD COMPONENT ---
export function DashboardTab({ proyectos = [], personas = [], osList = [] }) {
  const [filtroProyecto, setFiltroProyecto] = useState("todos");
  const [filtroPersona, setFiltroPersona] = useState("todos");

  const proyectosMap = useMemo(() => new Map(proyectos.map(p => [p.id, p])), [proyectos]);
  const personasMap = useMemo(() => new Map(personas.map(p => [p.id, p])), [personas]);
  
  const dashboardData = useMemo(() => {
    // Filter logic...
    let osFiltradas = osList;
    if (filtroProyecto !== "todos") {
      osFiltradas = osFiltradas.filter(os => os.proyectoId === parseInt(filtroProyecto));
    }
    if (filtroPersona !== "todos") {
      osFiltradas = osFiltradas.filter(os => os.personaId === parseInt(filtroPersona));
    }

    const osVigentes = osFiltradas.filter(os => {
      const diasRestantes = calcularDiasRestantes(os.fechaFin);
      return diasRestantes === null || diasRestantes >= 0;
    });
    
    const todosLosEntregables = osFiltradas.flatMap(os => 
      ['primerEntregable', 'segundoEntregable', 'tercerEntregable', 'cuartoEntregable'].map((key, index) => {
        const fechaEntrega = os[key];
        if (!fechaEntrega) return null;
        return { 
          ...os, 
          diasRestantes: calcularDiasRestantes(fechaEntrega),
          numeroEntregable: `${index + 1}° Entregable`,
          fechaEntrega
        };
      })
    ).filter(Boolean);

    const personasAlocadasIds = new Set(osVigentes.map(os => os.personaId));
    const personasAlocadasCount = personasAlocadasIds.size;
    
    const entregablesPorVencer7dias = todosLosEntregables.filter(e => e.diasRestantes >= 0 && e.diasRestantes <= 7).length;
    const osPorVencer15dias = osVigentes.filter(os => {
      const diasRestantes = calcularDiasRestantes(os.fechaFin);
      return diasRestantes !== null && diasRestantes <= 15;
    });
    
    const promedioContractosPorPersona = personasAlocadasCount > 0 ? (osVigentes.length / personasAlocadasCount).toFixed(1) : 0;
    
    const entregablesCompletados = todosLosEntregables.filter(e => e.diasRestantes < 0).length;
    const tasaEficiencia = todosLosEntregables.length > 0 ? 
      ((entregablesCompletados / todosLosEntregables.length) * 100).toFixed(1) : 0;
    
    const asignacionPorProyectoData = Object.values(
      osFiltradas.reduce((acc, os) => {
        const proyectoNombre = proyectosMap.get(os.proyectoId)?.nombre || 'Sin Proyecto';
        if (!acc[proyectoNombre]) acc[proyectoNombre] = { name: proyectoNombre, OS: 0, CAS: 0 };
        const tipo = os.tipoContrato?.toUpperCase();
        if (tipo === 'OS' || tipo === 'CAS') acc[proyectoNombre][tipo]++;
        return acc;
      }, {})
    );
    
    const estadoEntregablesData = [
      { name: 'Completados', value: entregablesCompletados },
      { name: 'Por Vencer (7d)', value: entregablesPorVencer7dias },
      { name: 'En Proceso', value: todosLosEntregables.filter(e => e.diasRestantes > 7).length }
    ];

    const rendimientoPorPersonaData = Array.from(personasAlocadasIds)
      .map(id => personasMap.get(id))
      .filter(Boolean)
      .map(p => ({
        name: p.nombre,
        value: osVigentes.filter(os => os.personaId === p.id).length,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    
    const projectKeys = proyectos
      .filter(p => filtroProyecto === "todos" || p.id === parseInt(filtroProyecto))
      .map(p => p.nombre)
      .filter(Boolean);
    
    const meses = Array.from({ length: 8 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      return {
        nombre: d.toLocaleString('es-PE', { month: 'short', year: '2-digit' }),
        inicio: new Date(d.getFullYear(), d.getMonth(), 1),
      };
    }).reverse();
    
    // CORRECCIÓN: Implementación correcta para osAcumuladasPorProyectoData
    const osAcumuladasPorProyectoData = meses.map((mes, mesIndex) => {
      const monthData = { name: mes.nombre };
      
      // Initialize cumulative counts for each project
      projectKeys.forEach(proyectoNombre => {
        monthData[proyectoNombre] = 0;
      });
      
      // Calculate cumulative counts up to this month
      for (let i = 0; i <= mesIndex; i++) {
        const currentMes = meses[i];
        
        const nuevosContratos = osFiltradas.filter(os => {
          const inicioOS = new Date(os.fechaNotificacion);
          return inicioOS.getFullYear() === currentMes.inicio.getFullYear() && 
                 inicioOS.getMonth() === currentMes.inicio.getMonth();
        });
        
        // Add to cumulative counts for each project
        nuevosContratos.forEach(os => {
          const proyectoNombre = proyectosMap.get(os.proyectoId)?.nombre;
          if (proyectoNombre && projectKeys.includes(proyectoNombre)) {
            monthData[proyectoNombre]++;
          }
        });
      }
      
      return monthData;
    });

    // Calculation for the cost evolution chart
    let cumulativeCosts = projectKeys.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    const parseDateFlexible = (dateStr) => {
      if (!dateStr) return null;

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [d, m, y] = dateStr.split("/");
        const dt = new Date(Number(y), Number(m) - 1, Number(d));
        return isNaN(dt.getTime()) ? null : dt;
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const dt = new Date(dateStr + "T00:00:00");
        return isNaN(dt.getTime()) ? null : dt;
      }

      const dt = new Date(dateStr);
      return isNaN(dt.getTime()) ? null : dt;
    };
     
    const costosPorProyectoData = meses.map(mes => {
      projectKeys.forEach(proyectoNombre => {
        const proyecto = proyectos.find(p => p.nombre === proyectoNombre);
        if (proyecto) {
          const osDelMes = osFiltradas.filter(os => {
            const inicioOS = parseDateFlexible(os.fechaNotificacion || os.fechaNotificacion); 
            
            return inicioOS && 
                   inicioOS.getFullYear() === mes.inicio.getFullYear() &&
                   inicioOS.getMonth() === mes.inicio.getMonth() &&
                   os.proyectoId === proyecto.id;
          });

          const costoDelMes = osDelMes.reduce((sum, os) => {
            const valorOS = parseFloat(os.valorOs || '0');
            return sum + (isNaN(valorOS) ? 0 : valorOS);
          }, 0);
          
          if (cumulativeCosts[proyectoNombre] !== undefined) {
            cumulativeCosts[proyectoNombre] += costoDelMes;
          }
        }
      });

      return { name: mes.nombre, ...cumulativeCosts };
    });

    // Table calculations...
    const proximosVencimientosTabla = todosLosEntregables
      .filter(e => e.diasRestantes >= 0)
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 10)
      .map(item => ({
        ...item, 
        persona: personasMap.get(item.personaId)?.nombre || 'N/A', 
        proyecto: proyectosMap.get(item.proyectoId)?.nombre || 'N/A'
      }));
      
    const osPorVencerTabla = osPorVencer15dias
      .map(os => ({
        ...os, 
        diasRestantes: calcularDiasRestantes(os.fechaFin), 
        personaNombre: personasMap.get(os.personaId)?.nombre || 'N/A', 
        proyectoNombre: proyectosMap.get(os.proyectoId)?.nombre || 'N/A'
      }))
      .sort((a, b) => a.diasRestantes - b.diasRestantes);

    // New table data for personnel by project
    const personalPorProyectoData = Array.from(
      osFiltradas.reduce((acc, os) => {
        const proyectoId = os.proyectoId;
        const personaId = os.personaId;
        const persona = personasMap.get(personaId);
        const proyecto = proyectosMap.get(proyectoId);
        
        if (!persona || !proyecto) return acc;
        
        const key = `${proyectoId}-${personaId}`;
        if (!acc.has(key)) {
          acc.set(key, {
            proyectoId,
            proyectoNombre: proyecto.nombre,
            personaId,
            personaNombre: `${persona.nombre} ${persona.apellido}`,
            rol: persona.rol || 'N/A',
            fechaNotificacion: os.fechaNotificacion,
            fechaFin: os.fechaFin,
            activo: calcularDiasRestantes(os.fechaFin) >= 0
          });
        }
        
        return acc;
      }, new Map())
    ).map(([key, value]) => value);

    return {
      osVigentes: osVigentes.length,
      personasAlocadas: personasAlocadasCount,
      osPorVencer15diasCount: osPorVencer15dias.length,
      entregablesPorVencer7dias,
      promedioContractosPorPersona,
      tasaEficiencia,
      asignacionPorProyectoData,
      estadoEntregablesData,
      rendimientoPorPersonaData,
      osAcumuladasPorProyectoData,
      costosPorProyectoData,
      projectKeys,
      proximosVencimientosTabla,
      osPorVencerTabla,
      todosLosEntregables,
      personalPorProyectoData
    };
  }, [proyectos, personas, osList, filtroProyecto, filtroPersona, proyectosMap, personasMap]);

  const clearFilters = () => {
    setFiltroProyecto("todos");
    setFiltroPersona("todos");
  };
  
  // Column definitions...
  const vencimientosColumns = [
    { header: "Persona", className: "font-semibold" }, 
    { header: "Proyecto", className: "font-semibold" }, 
    { header: "Entregable", className: "font-semibold" }, 
    { header: "Fecha", className: "font-semibold" }, 
    { header: "Días", className: "text-right font-semibold" }
  ];
  
  const osPorVencerColumns = [
    { header: "Persona", className: "font-semibold" }, 
    { header: "Proyecto", className: "font-semibold" }, 
    { header: "Fecha Fin", className: "font-semibold" }, 
    { header: "Días", className: "text-right font-semibold" }
  ];

  // New columns for personnel by project table
  const personalPorProyectoColumns = [
    { header: "Proyecto", className: "font-semibold" }, 
    { header: "Persona", className: "font-semibold" }, 
    { header: "Rol", className: "font-semibold" }, 
    { header: "Fecha Notificacion", className: "font-semibold" }, 
    { header: "Fecha Fin", className: "font-semibold" }, 
    { header: "Estado", className: "text-right font-semibold" }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-background via-primary/5 to-accent/10 min-h-screen">
      {/* Filter Card */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-sm p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filtrar por Proyecto</Label>
            <Select value={filtroProyecto} onValueChange={setFiltroProyecto}>
              <SelectTrigger className="w-[200px] bg-background/50 text-sm">
                <SelectValue placeholder="Todos los proyectos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los proyectos</SelectItem>
                {proyectos.map((proyecto) => (
                  <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                    {proyecto.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Filtrar por Persona</Label>
            <Select value={filtroPersona} onValueChange={setFiltroPersona}>
              <SelectTrigger className="w-[200px] bg-background/50 text-sm">
                <SelectValue placeholder="Todas las personas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las personas</SelectItem>
                {personas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id.toString()}>
                    {persona.nombre} {persona.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={clearFilters} className="mt-6">
            <RefreshCw className="mr-2 h-4 w-4" /> Limpiar Filtros
          </Button>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <KpiCard title="OS Vigentes" value={dashboardData.osVigentes} description="Órdenes activas" icon={FileText} colorClass="text-primary"/>
        <KpiCard title="Personas" value={dashboardData.personasAlocadas} description="Personal alocado" icon={Users} colorClass="text-accent"/>
        <KpiCard title="OS por Vencer" value={dashboardData.osPorVencer15diasCount} description="Próximos 15 días" icon={Clock} colorClass="text-warning"/>
        <KpiCard title="Entregables" value={dashboardData.entregablesPorVencer7dias} description="Próximos 7 días" icon={Package} colorClass="text-destructive"/>
       </div>

      {/* Chart Section 1 */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        <StackedBarChartCard title="Asignaciones por Proyecto" data={dashboardData.asignacionPorProyectoData} icon={BarChart3} />
        <PieChartCard title="Estado de Entregables" data={dashboardData.estadoEntregablesData} icon={PieChart} />
      </div>

      {/* Advanced Trend Analysis */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <CumulativeLineChartCard 
          title="Evolución Acumulada de Contratos por Proyecto" 
          data={dashboardData.osAcumuladasPorProyectoData} 
          projectKeys={dashboardData.projectKeys}
          icon={TrendingUp}
        />
        <CumulativeLineChartCard 
          title="Costos por Proyecto (Evolución Mensual)" 
          data={dashboardData.costosPorProyectoData} 
          projectKeys={dashboardData.projectKeys}
          icon={DollarSign}
        />
      </div>
      
      {/* Tables Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <DataTableCard 
          title="Próximos Vencimientos de Entregables (≤ 15 días)"
          icon={Package}
          colorClass="text-destructive"
          data={dashboardData.todosLosEntregables
            .filter(item => 
              item.diasRestantes !== null && item.diasRestantes >= 0 && item.diasRestantes <= 15
            )
            .sort((a, b) => a.diasRestantes - b.diasRestantes)
          }
          columns={vencimientosColumns}
          renderRow={(item, index) => {
            let badgeVariant = "secondary";
            if (item.diasRestantes < 5) {
              badgeVariant = "destructive";
            } else if (item.diasRestantes <= 15) {
              badgeVariant = "warning";
            }

            const persona = personasMap.get(item.personaId);
            const personaNombre = persona ? `${persona.nombre} ${persona.apellido}` : 'N/A';

            const proyectoNombre = proyectosMap.get(item.proyectoId)?.nombre || 'N/A';

            return (
              <TableRow key={`entregable-${index}`} className="hover:bg-accent/10 transition-colors">
                <TableCell className="font-medium text-foreground whitespace-nowrap">{personaNombre}</TableCell>
                <TableCell className="text-muted-foreground">{proyectoNombre}</TableCell>
                <TableCell className="text-sm">{item.numeroEntregable}</TableCell>
                <TableCell className="text-sm">{formatDateToDDMMYYYY(item.fechaEntrega)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={badgeVariant} className="font-medium">
                    {item.diasRestantes} días
                  </Badge>
                </TableCell>
              </TableRow>
            );
          }}
          noDataContent={(
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl border border-dashed border-border/50">
              <Package className="h-12 w-12 mb-3 text-muted-foreground/50" />
              <p className="text-lg font-medium">🎉 No hay vencimientos próximos</p>
              <p className="text-sm">Todos los entregables están al día</p>
            </div>
          )}
        />

        <DataTableCard 
          title="OS por Vencer (Próximos 15 Días)"
          icon={Clock}
          colorClass="text-warning"
          data={dashboardData.osPorVencerTabla.filter(os => 
            os.diasRestantes !== null && os.diasRestantes >= 0
          )}
          columns={osPorVencerColumns}
          renderRow={(os, index) => {
            let badgeVariant = "secondary";
            if (os.diasRestantes < 5) {
              badgeVariant = "destructive";
            } else if (os.diasRestantes <= 15) {
              badgeVariant = "warning";
            }
            
            return (
              <TableRow key={`os-${index}`} className="hover:bg-accent/10 transition-colors">
                <TableCell className="font-medium text-foreground whitespace-nowrap">
                  {os.personaNombre} {os.personaApellido}
                </TableCell>
                <TableCell className="text-muted-foreground">{os.proyectoNombre}</TableCell>
                <TableCell className="text-sm">{formatDateToDDMMYYYY(os.fechaFin)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={badgeVariant} className="font-medium">
                    {os.diasRestantes} días
                  </Badge>
                </TableCell>
              </TableRow>
            );
          }}
          noDataContent={(
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl border border-dashed border-border/50">
              <CalendarDays className="h-12 w-12 mb-3 text-muted-foreground/50" />
              <p className="text-lg font-medium">👍 Todas las OS están al día</p>
              <p className="text-sm">Ninguna OS vence en los próximos 15 días</p>
            </div>
          )}
        />
      </div>

      {/* New Table: Personal por Proyecto */}
      <DataTableCard 
        title="Personal por Proyecto"
        icon={Users}
        colorClass="text-primary"
        data={dashboardData.personalPorProyectoData}
        columns={personalPorProyectoColumns}
        renderRow={(item, index) => {
          const estado = item.activo ? "Activo" : "Inactivo";
          const badgeVariant = item.activo ? "success" : "destructive";

          const showHeader = index === 0 || 
              dashboardData.personalPorProyectoData[index - 1].proyectoNombre !== item.proyectoNombre;
          
          return (
            <React.Fragment key={`personal-${index}`}>
              {showHeader && (
                <TableRow className="bg-secondary/60 hover:bg-secondary/60 border-b border-primary/20">
                  <TableCell colSpan={6} className="font-semibold text-primary py-3">
                    {item.proyectoNombre}
                  </TableCell>
                </TableRow>
              )}
              
              <TableRow className="hover:bg-accent/10 transition-colors">
                <TableCell className="text-muted-foreground">{item.proyectoNombre}</TableCell>
                <TableCell className="text-muted-foreground">{item.personaNombre}</TableCell>
                <TableCell className="text-sm">{item.rol}</TableCell>
                <TableCell className="text-sm">{formatDateToDDMMYYYY(item.fechaNotificacion)}</TableCell>
                <TableCell className="text-sm">{formatDateToDDMMYYYY(item.fechaFin)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={badgeVariant} className="font-medium">
                    {estado}
                  </Badge>
                </TableCell>
              </TableRow>
            </React.Fragment>
          );
        }}
        noDataContent={(
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl border border-dashed border-border/50">
            <Users className="h-12 w-12 mb-3 text-muted-foreground/50" />
            <p className="text-lg font-medium">No hay personal asignado</p>
            <p className="text-sm">No se encontraron asignaciones de personal a proyectos</p>
          </div>
        )}
      />
    </div>
  );
}