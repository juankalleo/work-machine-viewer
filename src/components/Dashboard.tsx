import { EquipmentData } from '@/types/equipment';
import { 
  Monitor, 
  Cpu, 
  Users, 
  TrendingUp,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';

interface DashboardProps {
  equipmentData: EquipmentData;
}

export function Dashboard({ equipmentData }: DashboardProps) {
  const totalCPUs = equipmentData.cpus.length;
  const totalMonitors = equipmentData.monitors?.length || 0;
  const activeCPUs = equipmentData.cpus.filter(cpu => cpu.e_estado === 'Ativo').length;
  const inactiveCPUs = totalCPUs - activeCPUs;
  
  // Calcular estatísticas por departamento
  const departmentStats = equipmentData.cpus.reduce((acc, cpu) => {
    if (!acc[cpu.departamento]) {
      acc[cpu.departamento] = { total: 0, active: 0 };
    }
    acc[cpu.departamento].total++;
    if (cpu.e_estado === 'Ativo') {
      acc[cpu.departamento].active++;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number }>);
  
  const topDepartments = Object.entries(departmentStats)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 5);
    
  const activePercentage = totalCPUs > 0 ? (activeCPUs / totalCPUs) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Hero Stats com gradientes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-3xl border border-blue-500/20 p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/25">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
              <Cpu className="h-6 w-6 text-blue-300" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">{totalCPUs}</div>
              <div className="text-xs text-blue-200/70 uppercase tracking-wider">Total CPUs</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-200/80">
            <TrendingUp className="h-4 w-4" />
            Equipamentos cadastrados
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
        </div>

        <div className="group relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-3xl border border-green-500/20 p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/25">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-2xl">
              <Monitor className="h-6 w-6 text-green-300" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">{totalMonitors}</div>
              <div className="text-xs text-green-200/70 uppercase tracking-wider">Monitores</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-200/80">
            <Activity className="h-4 w-4" />
            Monitores cadastrados
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-green-500/10 rounded-full blur-xl" />
        </div>

        <div className="group relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-3xl border border-emerald-500/20 p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/25">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">{activeCPUs}</div>
              <div className="text-xs text-emerald-200/70 uppercase tracking-wider">Ativas</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-200/80">
            <Zap className="h-4 w-4" />
            {activePercentage.toFixed(1)}% do total
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
        </div>

        <div className="group relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-3xl border border-orange-500/20 p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/25">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-2xl">
              <AlertTriangle className="h-6 w-6 text-orange-300" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">{inactiveCPUs}</div>
              <div className="text-xs text-orange-200/70 uppercase tracking-wider">Inativas</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-orange-200/80">
            <AlertTriangle className="h-4 w-4" />
            {(100 - activePercentage).toFixed(1)}% do total
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-orange-500/10 rounded-full blur-xl" />
        </div>
      </div>

      {/* Status Overview com design moderno */}
      <div className="backdrop-blur-md bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Status dos Equipamentos
            </h3>
            <p className="text-gray-400">Visão geral do status dos equipamentos cadastrados</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                CPUs Ativas
              </span>
              <span className="text-lg font-bold text-emerald-400">{activeCPUs}/{totalCPUs}</span>
            </div>
            <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${activePercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {activePercentage.toFixed(1)}% de utilização ativa
            </div>
          </div>
        </div>
      </div>

      {/* Departamentos com design glassmorphism */}
      <div className="backdrop-blur-md bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Top Departamentos
            </h3>
            <p className="text-gray-400">Distribuição de equipamentos por departamento</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {topDepartments.map(([dept, stats], index) => {
            const percentage = totalCPUs > 0 ? (stats.total / totalCPUs) * 100 : 0;
            const isFullyActive = stats.active === stats.total;
            
            return (
              <div 
                key={dept} 
                className="group flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {dept}
                    </div>
                    <div className="text-sm text-gray-400">
                      {stats.active} ativas de {stats.total} equipamentos
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{percentage.toFixed(0)}%</div>
                    <div className="text-xs text-gray-400">do total</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isFullyActive 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                  }`}>
                    {isFullyActive ? '✓ 100%' : `${Math.round((stats.active / stats.total) * 100)}%`}
                  </div>
                </div>
              </div>
            );
          })}
          
          {topDepartments.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <BarChart3 className="h-10 w-10 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg mb-2">Nenhum equipamento cadastrado ainda</p>
              <p className="text-gray-500 text-sm">Adicione equipamentos para ver as estatísticas</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Equipamentos Recentes */}
      <div className="backdrop-blur-md bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Equipamentos Recentes
            </h3>
            <p className="text-gray-400">Últimos equipamentos adicionados ao sistema</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {equipmentData.cpus.slice(0, 5).map((cpu, index) => (
            <div 
              key={cpu.id} 
              className="group flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {cpu.nomenclatura}
                  </div>
                  <div className="text-sm text-gray-400">{cpu.marca_modelo}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-white">{cpu.departamento}</div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  cpu.e_estado === 'Ativo' 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : 'bg-orange-500/20 text-orange-300'
                }`}>
                  {cpu.e_estado}
                </div>
              </div>
            </div>
          ))}
          
          {equipmentData.cpus.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Nenhum equipamento cadastrado ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
