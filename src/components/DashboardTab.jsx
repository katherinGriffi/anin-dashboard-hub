import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
    if (!fechaFin) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fin = new Date(fechaFin);
    fin.setHours(0, 0, 0, 0);
    const diffTime = fin.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getEstadoFecha = (diasRestantes) => {
  if (diasRestantes === null) return { variant: "secondary" };
  if (diasRestantes < 3) return { variant: "destructive" };
  if (diasRestantes <= 7) return { className: "bg-yellow-500 text-black" };;
  return { variant: "secondary" };
};


// --- REUSABLE COMPONENTS ---
// (KpiCard, DataTableCard, and Chart components should be placed here)
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

        const osVigentes = osFiltradas.filter(os => !!os.fechaFin && calcularDiasRestantes(os.fechaFin) >= 0);
        
        const todosLosEntregables = osFiltradas.flatMap(os => 
            ['primerEntregable', 'segundoEntregable', 'tercerEntregable'].map((key, index) => {
                const fechaEntrega = os[key];
                if (!fechaEntrega) return null;
                return { 
                    ...os, 
                    diasRestantes: calcularDiasRestantes(fechaEntrega),
                    numeroEntregable: `${index + 1}er Entregable`,
                    fechaEntrega
                };
            })
        ).filter(Boolean);

        const personasAlocadasIds = new Set(osVigentes.map(os => os.personaId));
        const personasAlocadasCount = personasAlocadasIds.size;
        
        const entregablesPorVencer7dias = todosLosEntregables.filter(e => e.diasRestantes >= 0 && e.diasRestantes <= 7).length;
        const osPorVencer15dias = osVigentes.filter(os => calcularDiasRestantes(os.fechaFin) <= 15);
        
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
        
        let cumulativeCounts = projectKeys.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
        const osAcumuladasPorProyectoData = meses.map(mes => {
            const nuevosOS = osFiltradas.filter(os => {
                const inicioOS = new Date(os.fechaInicio || os.fechaNotificacion);
                return inicioOS.getFullYear() === mes.inicio.getFullYear() && inicioOS.getMonth() === mes.inicio.getMonth();
            });
            nuevosOS.forEach(os => {
                const proyectoNombre = proyectosMap.get(os.proyectoId)?.nombre;
                if (proyectoNombre && cumulativeCounts[proyectoNombre] !== undefined) {
                    cumulativeCounts[proyectoNombre]++;
                }
            });
            return { name: mes.nombre, ...cumulativeCounts };
        });

        // --- CODE ADDED BACK ---
        // Calculation for the cost evolution chart
        const costosPorProyectoData = meses.map(mes => {
            const result = { name: mes.nombre };
            projectKeys.forEach(proyectoNombre => {
                const proyecto = proyectos.find(p => p.nombre === proyectoNombre);
                if (proyecto) {
                    const osDelMes = osFiltradas.filter(os => {
                        const inicioOS = new Date(os.fechaInicio || os.fechaNotificacion);
                        return inicioOS.getFullYear() === mes.inicio.getFullYear() && 
                               inicioOS.getMonth() === mes.inicio.getMonth() &&
                               os.proyectoId === proyecto.id;
                    });
                    const costoTotal = osDelMes.reduce((sum, os) => {
                        const persona = personasMap.get(os.personaId); // Use efficient map
                        return sum + (parseFloat(persona?.valor || '0') || 0);
                    }, 0);
                    result[proyectoNombre] = costoTotal;
                }
            });
            return result;
        });

        // Table calculations...
        const proximosVencimientosTabla = todosLosEntregables.filter(e => e.diasRestantes >= 0).sort((a, b) => a.diasRestantes - b.diasRestantes).slice(0, 10).map(item => ({...item, persona: personasMap.get(item.personaId)?.nombre || 'N/A', proyecto: proyectosMap.get(item.proyectoId)?.nombre || 'N/A'}));
        const osPorVencerTabla = osPorVencer15dias.map(os => ({...os, diasRestantes: calcularDiasRestantes(os.fechaFin), personaNombre: personasMap.get(os.personaId)?.nombre || 'N/A', proyectoNombre: proyectosMap.get(os.proyectoId)?.nombre || 'N/A'})).sort((a, b) => a.diasRestantes - b.diasRestantes);

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
            costosPorProyectoData, // --- ADDED BACK ---
            projectKeys,
            proximosVencimientosTabla,
            osPorVencerTabla,
        };
    }, [proyectos, personas, osList, filtroProyecto, filtroPersona, proyectosMap, personasMap]);

    const clearFilters = () => {
        setFiltroProyecto("todos");
        setFiltroPersona("todos");
    };
    
    // Column definitions...
    const vencimientosColumns = [{ header: "Persona", className: "font-semibold" }, { header: "Proyecto", className: "font-semibold" }, { header: "Entregable", className: "font-semibold" }, { header: "Fecha", className: "font-semibold" }, { header: "Días", className: "text-right font-semibold" }];
    const osPorVencerColumns = [{ header: "Persona", className: "font-semibold" }, { header: "Proyecto", className: "font-semibold" }, { header: "Fecha Fin", className: "font-semibold" }, { header: "Días", className: "text-right font-semibold" }];

    return (
        <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-background via-primary/5 to-accent/10 min-h-screen">
            {/* Filter Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-sm">
                 {/* Filter controls content */}
            </Card>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <KpiCard title="OS Vigentes" value={dashboardData.osVigentes} description="Órdenes activas" icon={FileText} colorClass="text-primary"/>
                <KpiCard title="Personas" value={dashboardData.personasAlocadas} description="Personal alocado" icon={Users} colorClass="text-accent"/>
                <KpiCard title="OS por Vencer" value={dashboardData.osPorVencer15diasCount} description="Próximos 15 días" icon={Clock} colorClass="text-warning"/>
                <KpiCard title="Entregables" value={dashboardData.entregablesPorVencer7dias} description="Próximos 7 días" icon={Package} colorClass="text-destructive"/>
                <KpiCard title="Promedio OS" value={dashboardData.promedioContractosPorPersona} description="OS por persona" icon={Target} colorClass="text-success"/>
                <KpiCard title="Eficiencia" value={`${dashboardData.tasaEficiencia}%`} description="Entregables a tiempo" icon={Activity} colorClass="text-chart-1"/>
            </div>

            {/* Chart Section 1 */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                <StackedBarChartCard title="Asignaciones por Proyecto" data={dashboardData.asignacionPorProyectoData} icon={BarChart3} />
                <PieChartCard title="Estado de Entregables" data={dashboardData.estadoEntregablesData} icon={PieChart} />
            </div>

            {/* --- CHART ADDED BACK --- */}
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
                    title="Próximos Vencimientos de Entregables"
                    icon={Package}
                    colorClass="text-destructive"
                    data={dashboardData.proximosVencimientosTabla}
                    columns={vencimientosColumns}
                    renderRow={(item, index) => (
                        <TableRow key={`entregable-${index}`} className="hover:bg-accent/10 transition-colors">
                            <TableCell className="font-medium text-foreground">{item.persona}</TableCell>
                            <TableCell className="text-muted-foreground">{item.proyecto}</TableCell>
                            <TableCell className="text-sm">{item.numeroEntregable}</TableCell>
                            <TableCell className="text-sm">{new Date(item.fechaEntrega).toLocaleDateString('es-PE')}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={getEstadoFecha(item.diasRestantes).variant} className="font-medium">
                                    {item.diasRestantes} días
                                </Badge>
                            </TableCell>
                        </TableRow>
                    )}
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
                    data={dashboardData.osPorVencerTabla}
                    columns={osPorVencerColumns}
                    renderRow={(os, index) => (
                        <TableRow key={`os-${index}`} className="hover:bg-accent/10 transition-colors">
                            <TableCell className="font-medium text-foreground">{os.personaNombre}</TableCell>
                            <TableCell className="text-muted-foreground">{os.proyectoNombre}</TableCell>
                            <TableCell className="text-sm">{new Date(os.fechaFin).toLocaleDateString('es-PE')}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={getEstadoFecha(os.diasRestantes).variant} className="font-medium">
                                    {os.diasRestantes} días
                                </Badge>
                            </TableCell>
                        </TableRow>
                    )}
                    noDataContent={(
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl border border-dashed border-border/50">
                            <CalendarDays className="h-12 w-12 mb-3 text-muted-foreground/50" />
                            <p className="text-lg font-medium">👍 Todas las OS están al día</p>
                            <p className="text-sm">Ninguna OS vence en los próximos 15 días</p>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}