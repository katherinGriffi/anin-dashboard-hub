// Archivo: DashboardTab.jsx (Actualizado)

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Clock,
    Users,
    Package,
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

// --- FUNCIÓN 1: CALCULAR DÍAS RESTANTES (sin cambios) ---
const calcularDiasRestantes = (fechaFin) => {
    if (!fechaFin) return null;
    const hoy = new Date();
    const fin = new Date(fechaFin + 'T23:59:59');
    const diffTime = fin - hoy;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// --- FUNCIÓN 2: DETERMINAR EL COLOR DEL BADGE (ACTUALIZADA) ---
const getEstadoFecha = (diasRestantes) => {
    if (diasRestantes === null) return { variant: 'secondary' };
    if (diasRestantes <= 0) return { variant: 'destructive' }; // 0 o menos es rojo
    if (diasRestantes <= 7) return { variant: 'warning' }; // 1 a 7 es amarillo
    return { variant: 'success' };
};

// --- COMPONENTES DE GRÁFICOS REUTILIZABLES (ACTUALIZADOS) ---
const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const StackedBarChartCard = ({ title, data }) => (
    <Card>
        <CardHeader><CardTitle className="text-base font-medium">{title}</CardTitle></CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 75 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Bar dataKey="OS" stackId="a" fill={CHART_COLORS[0]} name="Contratos OS" />
                    <Bar dataKey="CAS" stackId="a" fill={CHART_COLORS[1]} name="Contratos CAS" />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

const HorizontalBarChartCard = ({ title, data }) => (
    <Card>
        <CardHeader><CardTitle className="text-base font-medium">{title}</CardTitle></CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill={CHART_COLORS[0]} name="Nº de Personas" />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

const CumulativeLineChartCard = ({ title, data, projectKeys }) => (
     <Card>
        <CardHeader><CardTitle className="text-base font-medium">{title}</CardTitle></CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    {projectKeys.map((key, index) => (
                         <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[index % CHART_COLORS.length]} name={key} strokeWidth={2} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---
export function DashboardTab({ proyectos = [], personas = [], osList = [] }) {
    
    const dashboardData = useMemo(() => {
        // --- CÁLCULOS BASE ---
        const osVigentes = osList.filter(os => !!os.fechaFin && calcularDiasRestantes(os.fechaFin) >= 0);

        const todosLosEntregables = osList.flatMap(os => 
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

        // --- CÁLCULOS PARA KPIs (FILA 1) ---
        const personasAlocadas = new Set(osVigentes.map(os => os.personaId)).size;
        const entregablesPorVencer7dias = todosLosEntregables.filter(e => e.diasRestantes >= 0 && e.diasRestantes <= 7).length;
        const osPorVencer15dias = osVigentes.filter(os => calcularDiasRestantes(os.fechaFin) <= 15);

        // --- CÁLCULOS PARA GRÁFICOS ---
        const asignacionPorProyectoData = Object.values(
            osList.reduce((acc, os) => {
                const proyectoNombre = proyectos.find(p => p.id === os.proyectoId)?.nombre || 'Sin Proyecto';
                if (!acc[proyectoNombre]) acc[proyectoNombre] = { name: proyectoNombre, OS: 0, CAS: 0 };
                const tipo = os.tipoContrato?.toUpperCase();
                if (tipo === 'OS' || tipo === 'CAS') acc[proyectoNombre][tipo]++;
                return acc;
            }, {})
        );
        
        const distribucionRolesData = Object.entries(
            personas.filter(p => p.activo).reduce((acc, p) => {
                const rol = p.rol || 'No definido';
                acc[rol] = (acc[rol] || 0) + 1;
                return acc;
            }, {})
        ).map(([name, value]) => ({ name, value }));

        // --- CÁLCULO PARA GRÁFICO ACUMULATIVO POR PROYECTO ---
        const projectKeys = proyectos.map(p => p.nombre).filter(Boolean);
        const meses = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            return {
                nombre: d.toLocaleString('es-PE', { month: 'short', year: '2-digit' }),
                inicio: new Date(d.getFullYear(), d.getMonth(), 1),
            };
        }).reverse();
        
        let cumulativeCounts = projectKeys.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
        const osAcumuladasPorProyectoData = meses.map(mes => {
            const nuevosOS = osList.filter(os => {
                const inicioOS = new Date(os.fechaInicio || os.fechaNotificacion);
                return inicioOS.getFullYear() === mes.inicio.getFullYear() && inicioOS.getMonth() === mes.inicio.getMonth();
            });
            nuevosOS.forEach(os => {
                const proyectoNombre = proyectos.find(p => p.id === os.proyectoId)?.nombre;
                if (proyectoNombre && cumulativeCounts[proyectoNombre] !== undefined) {
                    cumulativeCounts[proyectoNombre]++;
                }
            });
            return { name: mes.nombre, ...cumulativeCounts };
        });

        // --- CÁLCULOS PARA TABLAS ---
        const osPorVencerTabla = osPorVencer15dias.map(os => ({
            diasRestantes: calcularDiasRestantes(os.fechaFin),
            personaNombre: personas.find(p => p.id === os.personaId)?.nombre || 'N/A',
            proyectoNombre: proyectos.find(p => p.id === os.proyectoId)?.nombre || 'N/A',
            fechaFin: os.fechaFin,
        })).sort((a, b) => a.diasRestantes - b.diasRestantes);
        
        const proximosVencimientosTabla = todosLosEntregables
            .filter(e => e.diasRestantes >= 0)
            .sort((a, b) => a.diasRestantes - b.diasRestantes)
            .slice(0, 10)
            .map(item => ({
                 persona: personas.find(p => p.id === item.personaId)?.nombre || 'N/A',
                 proyecto: proyectos.find(p => p.id === item.proyectoId)?.nombre || 'N/A',
                 numeroEntregable: item.numeroEntregable,
                 fechaEntrega: item.fechaEntrega,
                 diasRestantes: item.diasRestantes
            }));

        return {
            personasAlocadas,
            osVigentes: osVigentes.length,
            entregablesPorVencer7dias,
            osPorVencer15diasCount: osPorVencer15dias.length,
            asignacionPorProyectoData,
            distribucionRolesData,
            osAcumuladasPorProyectoData,
            projectKeys,
            osPorVencerTabla,
            proximosVencimientosTabla,
        };
    }, [proyectos, personas, osList]);

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6 bg-slate-50">
            {/* FILA 1: KPIs PRINCIPALES */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium">OS Vigentes</CardTitle><FileText className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardData.osVigentes}</div><p className="text-xs text-muted-foreground">Órdenes de servicio activas</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium">Personas Alocadas</CardTitle><Users className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardData.personasAlocadas}</div><p className="text-xs text-muted-foreground">Personal único en proyectos vigentes</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium">OS por Vencer (15 Días)</CardTitle><Clock className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardData.osPorVencer15diasCount}</div><p className="text-xs text-muted-foreground">OS que finalizan próximamente</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"><CardTitle className="text-sm font-medium text-yellow-600">Entregables Próximos (7 Días)</CardTitle><Package className="w-4 h-4 text-yellow-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardData.entregablesPorVencer7dias}</div><p className="text-xs text-muted-foreground">Entregables con fecha límite cercana</p></CardContent></Card>
            </div>
            
            {/* FILA 2: ANÁLISIS DE RECURSOS Y PROYECTOS */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <StackedBarChartCard title="Asignaciones por Proyecto (OS vs CAS)" data={dashboardData.asignacionPorProyectoData} />
                <HorizontalBarChartCard title="Distribución de Roles" data={dashboardData.distribucionRolesData} />
            </div>

            {/* FILA 3: ANÁLISIS DE TENDENCIAS (ACUMULATIVO) */}
            <CumulativeLineChartCard title="Evolución Acumulada de Contratos por Proyecto" data={dashboardData.osAcumuladasPorProyectoData} projectKeys={dashboardData.projectKeys} />
            
            {/* FILA 4: TABLAS DE DETALLE */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                 <Card>
                    <CardHeader><CardTitle>Próximos Vencimientos de Entregables</CardTitle></CardHeader>
                    <CardContent>
                        {dashboardData.proximosVencimientosTabla.length > 0 ? (
                            <Table>
                                <TableHeader><TableRow><TableHead>Persona</TableHead><TableHead>Proyecto</TableHead><TableHead>Entregable</TableHead><TableHead>Fecha Entrega</TableHead><TableHead className="text-right">Días Restantes</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {dashboardData.proximosVencimientosTabla.map((item, index) => (
                                        <TableRow key={`entregable-${index}`}>
                                            <TableCell className="font-medium">{item.persona}</TableCell>
                                            <TableCell>{item.proyecto}</TableCell>
                                            <TableCell>{item.numeroEntregable}</TableCell>
                                            <TableCell>{new Date(item.fechaEntrega).toLocaleDateString('es-PE')}</TableCell>
                                            <TableCell className="text-right"><Badge variant={getEstadoFecha(item.diasRestantes).variant}>{item.diasRestantes} días</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (<div className="flex items-center justify-center h-48 text-muted-foreground"><p>🎉 No hay vencimientos próximos.</p></div>)}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Lista de OS por Vencer (Próximos 15 Días)</CardTitle></CardHeader>
                    <CardContent>
                        {dashboardData.osPorVencerTabla.length > 0 ? (
                            <Table>
                                <TableHeader><TableRow><TableHead>Persona</TableHead><TableHead>Proyecto</TableHead><TableHead>Fecha Fin</TableHead><TableHead className="text-right">Días Restantes</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {dashboardData.osPorVencerTabla.map((os, index) => (
                                        <TableRow key={`os-${index}`}>
                                            <TableCell className="font-medium">{os.personaNombre}</TableCell>
                                            <TableCell>{os.proyectoNombre}</TableCell>
                                            <TableCell>{new Date(os.fechaFin).toLocaleDateString('es-PE')}</TableCell>
                                            <TableCell className="text-right"><Badge variant={getEstadoFecha(os.diasRestantes).variant}>{os.diasRestantes} días</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (<div className="flex items-center justify-center h-48 text-muted-foreground"><p>👍 Ninguna OS vence en los próximos 15 días.</p></div>)}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}