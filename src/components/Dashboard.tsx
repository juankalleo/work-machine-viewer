import { useMemo } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { EquipmentData } from '@/types/equipment';
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

interface DashboardProps {
  data: EquipmentData;
}

export function Dashboard({ data }: DashboardProps) {
  const stats = useMemo(() => {
    const totalCPUs = data.cpus.length;
    const activeCPUs = data.cpus.filter(cpu => cpu.e_estado === 'Ativo').length;
    const inactiveCPUs = data.cpus.filter(cpu => cpu.e_estado === 'Inativo').length;
    
    // Department statistics
    const departmentStats = data.cpus.reduce((acc, cpu) => {
      const dept = cpu.departamento || 'Sem Departamento';
      if (!acc[dept]) {
        acc[dept] = 0;
      }
      acc[dept]++;
      return acc;
    }, {} as Record<string, number>);

    // State statistics
    const stateStats = data.cpus.reduce((acc, cpu) => {
      const state = cpu.e_estado || 'Desconhecido';
      if (!acc[state]) {
        acc[state] = 0;
      }
      acc[state]++;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCPUs,
      activeCPUs,
      inactiveCPUs,
      departmentStats,
      stateStats
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de CPUs"
          value={stats.totalCPUs}
          icon={Cpu}
          description="Equipamentos cadastrados"
          trend={null}
        />
        <StatCard
          title="CPUs Ativos"
          value={stats.activeCPUs}
          icon={TrendingUp}
          description="Equipamentos em uso"
          trend={null}
        />
        <StatCard
          title="CPUs Inativos"
          value={stats.inactiveCPUs}
          icon={AlertTriangle}
          description="Equipamentos fora de uso"
          trend={null}
        />
        <StatCard
          title="Departamentos"
          value={Object.keys(stats.departmentStats).length}
          icon={Building}
          description="Unidades organizacionais"
          trend={null}
        />
      </div>

      {/* Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dashboard-card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Distribuição por Departamento
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.departmentStats).map(([dept, count]) => (
              <div key={dept} className="flex justify-between items-center">
                <span className="text-sm font-medium">{dept}</span>
                <span className="text-sm text-muted-foreground">{count} CPUs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dashboard-card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Status dos Equipamentos
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.stateStats).map(([state, count]) => (
              <div key={state} className="flex justify-between items-center">
                <span className="text-sm font-medium">{state}</span>
                <span className="text-sm text-muted-foreground">{count} CPUs</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Equipment */}
      <div className="bg-dashboard-card rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Equipamentos Recentes
        </h3>
        <div className="space-y-3">
          {data.cpus.slice(0, 5).map((cpu) => (
            <div key={cpu.id} className="flex justify-between items-center p-3 bg-white rounded-lg border">
              <div>
                <p className="font-medium">{cpu.nomenclatura}</p>
                <p className="text-sm text-muted-foreground">{cpu.marca_modelo}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{cpu.departamento}</p>
                <p className="text-sm text-muted-foreground">{cpu.e_estado}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}