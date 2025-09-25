import { useMemo } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { EquipmentData, DepartmentStats, ProcessorStats, OperatingSystemStats } from '@/types/equipment';
import { 
  Monitor, 
  Cpu, 
  HardDrive, 
  Users, 
  TrendingUp,
  Building,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  data: EquipmentData;
}

const COLORS = ['hsl(210, 95%, 45%)', 'hsl(200, 95%, 50%)', 'hsl(145, 70%, 45%)', 'hsl(45, 85%, 55%)', 'hsl(0, 75%, 55%)'];

export function Dashboard({ data }: DashboardProps) {
  const stats = useMemo(() => {
    const totalCPUs = data.cpus.length;
    const totalMonitors = data.monitors.length;
    const totalEquipment = totalCPUs + totalMonitors;
    
    // Department statistics
    const departmentMap = new Map<string, DepartmentStats>();
    
    data.cpus.forEach(cpu => {
      const dept = cpu.departamento || 'Sem Departamento';
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          name: dept,
          totalCPUs: 0,
          totalMonitors: 0,
          cpusAtivos: 0,
          monitoresAtivos: 0,
          formatacoes: 0
        });
      }
      const stats = departmentMap.get(dept)!;
      stats.totalCPUs++;
      if (cpu.eEstado !== 'RASURADO' && cpu.marcaModelo) {
        stats.cpusAtivos++;
      }
      if (cpu.dataFormatacao && cpu.dataFormatacao !== 'N/T') {
        stats.formatacoes++;
      }
    });
    
    data.monitors.forEach(monitor => {
      const dept = monitor.departamento || 'Sem Departamento';
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          name: dept,
          totalCPUs: 0,
          totalMonitors: 0,
          cpusAtivos: 0,
          monitoresAtivos: 0,
          formatacoes: 0
        });
      }
      const stats = departmentMap.get(dept)!;
      stats.totalMonitors++;
      if (monitor.eEstado && monitor.modelo) {
        stats.monitoresAtivos++;
      }
    });
    
    const departmentStats = Array.from(departmentMap.values());
    
    // Processor statistics
    const processorMap = new Map<string, number>();
    data.cpus.forEach(cpu => {
      if (cpu.processador && cpu.processador !== 'N/T') {
        const proc = cpu.processador.split(' ').slice(0, 3).join(' '); // Simplify processor names
        processorMap.set(proc, (processorMap.get(proc) || 0) + 1);
      }
    });
    
    const processorStats: ProcessorStats[] = Array.from(processorMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalCPUs) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Operating System statistics
    const osMap = new Map<string, number>();
    data.cpus.forEach(cpu => {
      if (cpu.sistemaOperacional && cpu.sistemaOperacional !== 'N/T') {
        osMap.set(cpu.sistemaOperacional, (osMap.get(cpu.sistemaOperacional) || 0) + 1);
      }
    });
    
    const osStats: OperatingSystemStats[] = Array.from(osMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalCPUs) * 100)
      }))
      .sort((a, b) => b.count - a.count);
    
    // Recent formatting count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentFormattings = data.cpus.filter(cpu => {
      if (!cpu.dataFormatacao || cpu.dataFormatacao === 'N/T') return false;
      try {
        const formatDate = new Date(cpu.dataFormatacao.split('/').reverse().join('-'));
        return formatDate >= thirtyDaysAgo;
      } catch {
        return false;
      }
    }).length;
    
    return {
      totalCPUs,
      totalMonitors,
      totalEquipment,
      departmentStats,
      processorStats,
      osStats,
      recentFormattings,
      activeCPUs: data.cpus.filter(cpu => cpu.eEstado !== 'RASURADO' && cpu.marcaModelo).length,
      activeMonitors: data.monitors.filter(monitor => monitor.eEstado && monitor.modelo).length
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de CPUs"
          value={stats.totalCPUs}
          description={`${stats.activeCPUs} ativos`}
          icon={Cpu}
          variant="info"
        />
        <StatCard
          title="Total de Monitores"
          value={stats.totalMonitors}
          description={`${stats.activeMonitors} ativos`}
          icon={Monitor}
          variant="success"
        />
        <StatCard
          title="Total de Equipamentos"
          value={stats.totalEquipment}
          description="CPUs + Monitores"
          icon={HardDrive}
        />
        <StatCard
          title="Formatações Recentes"
          value={stats.recentFormattings}
          description="Últimos 30 dias"
          icon={Calendar}
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <ChartCard
          title="Distribuição por Departamento"
          description="Equipamentos por setor"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.departmentStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalCPUs" name="CPUs" fill="hsl(210, 95%, 45%)" />
              <Bar dataKey="totalMonitors" name="Monitores" fill="hsl(200, 95%, 50%)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Processor Distribution */}
        <ChartCard
          title="Processadores Mais Utilizados"
          description="Top 5 processadores"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.processorStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="count"
              >
                {stats.processorStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value} CPUs`, props.payload.name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Operating System Distribution */}
      <ChartCard
        title="Sistemas Operacionais"
        description="Distribuição de SOs instalados"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.osStats} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(145, 70%, 45%)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Department Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.departmentStats.map((dept, index) => (
          <StatCard
            key={dept.name}
            title={dept.name}
            value={dept.totalCPUs + dept.totalMonitors}
            description={`${dept.totalCPUs} CPUs, ${dept.totalMonitors} monitores`}
            icon={Building}
            variant={index % 2 === 0 ? 'info' : 'success'}
          />
        ))}
      </div>
    </div>
  );
}