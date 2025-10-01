import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { AddEquipmentDialog } from '@/components/AddEquipmentDialog';
import { EquipmentTable } from '@/components/equipment/EquipmentTable';
import { FileImporter } from '@/components/FileImporter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEquipment } from '@/hooks/useEquipment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/excel-exporter';
import { downloadExcelTemplate } from '@/lib/excel-template';
import { EquipmentData } from '@/types/equipment';
import { CPU, Monitor } from '@/types/equipment';
import { 
  Monitor as MonitorIcon, 
  BarChart3,
  Table as TableIcon,
  Search,
  LogOut,
  Download,
  FileText,
  RefreshCw,
  Plus,
  Filter
} from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const { 
    equipmentData, 
    isLoading: equipmentLoading, 
    addCPU, 
    addMonitor, 
    editCPU,
    removeCPU, 
    syncNow 
  } = useEquipment();
  const { toast } = useToast();
  
  // Estados para busca simples
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [filteredCPUs, setFilteredCPUs] = useState<CPU[]>([]);
  const [filteredMonitors, setFilteredMonitors] = useState<Monitor[]>([]);
  
  // Redirect to auth if not logged in
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-pulse text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
            <MonitorIcon className="relative h-16 w-16 mx-auto text-blue-400" />
          </div>
          <p className="text-blue-200/80 text-lg">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Aplicar filtros simples
  useEffect(() => {
    if (!equipmentData) return;

    let filteredCPUs = equipmentData.cpus;
    let filteredMonitors = equipmentData.monitors;

    // Busca por texto geral
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredCPUs = filteredCPUs.filter(cpu => 
        Object.values(cpu).some(value => 
          value && value.toString().toLowerCase().includes(searchLower)
        )
      );
      filteredMonitors = filteredMonitors.filter(monitor => 
        Object.values(monitor).some(value => 
          value && value.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    // Filtro por departamento
    if (departmentFilter !== 'all') {
      filteredCPUs = filteredCPUs.filter(cpu => cpu.departamento === departmentFilter);
      filteredMonitors = filteredMonitors.filter(monitor => monitor.departamento === departmentFilter);
    }

    // Filtro por estado
    if (stateFilter !== 'all') {
      filteredCPUs = filteredCPUs.filter(cpu => cpu.e_estado.toString() === stateFilter);
      filteredMonitors = filteredMonitors.filter(monitor => monitor.e_estado.toString() === stateFilter);
    }

    setFilteredCPUs(filteredCPUs);
    setFilteredMonitors(filteredMonitors);
  }, [equipmentData, searchTerm, departmentFilter, stateFilter]);

  const handleDataImported = async (importedData: EquipmentData) => {
    // Adicionar cada CPU importada
    let cpusAdded = 0;
    for (const cpu of importedData.cpus) {
      const success = await addCPU(cpu);
      if (success) cpusAdded++;
    }
    
    // Adicionar cada monitor importado
    let monitorsAdded = 0;
    for (const monitor of importedData.monitors) {
      const success = await addMonitor(monitor);
      if (success) monitorsAdded++;
    }
    
    toast({
      title: "Dados importados!",
      description: `${cpusAdded} CPUs e ${monitorsAdded} monitores importados com sucesso.`,
    });
  };

  const handleExportToExcel = async () => {
    if (!equipmentData || equipmentData?.cpus?.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há equipamentos para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportToExcel(equipmentData, 'equipamentos_der_sesut');
      toast({
        title: "Exportação concluída",
        description: `${equipmentData.cpus.length} equipamentos exportados!`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadExcelTemplate();
      toast({
        title: "Template baixado!",
        description: "Template Excel baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao baixar template",
        description: "Não foi possível baixar o template.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };
  
  const handleEditCPU = async (id: string, cpuData: any): Promise<boolean> => {
    return await editCPU(id, cpuData);
  };
  
  const handleEditMonitor = (monitor: Monitor) => {
    console.log('Editando Monitor:', monitor);
  };
  
  const handleDeleteCPU = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta CPU?')) {
      await removeCPU(id);
    }
  };
  
  const handleDeleteMonitor = async (id: string) => {
    console.log('Deletando monitor:', id);
  };

  // Extrair opções únicas para filtros
  const departments = Array.from(
    new Set([
      ...(equipmentData?.cpus?.map(c => c.departamento) || []), 
      ...(equipmentData?.monitors?.map(m => m.departamento) || [])
    ])
  ).filter(Boolean);

  const estados = Array.from(
    new Set([
      ...(equipmentData?.cpus?.map(c => c.e_estado) || []), 
      ...(equipmentData?.monitors?.map(m => m.e_estado) || [])
    ])
  ).map(String).sort();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <MonitorIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  DER-SESUT MONITORAMENTO
                </h1>
                <p className="text-sm text-gray-400">
                  {equipmentData?.cpus?.length || 0} CPUs • {equipmentData?.monitors?.length || 0} Monitores
                  {user && (
                    <span className="ml-2 text-blue-400">
                      • {user.username} {isAdmin() && '✨'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={syncNow} 
                variant="ghost" 
                size="sm"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
              
              <Button 
                onClick={handleExportToExcel} 
                variant="ghost" 
                size="sm"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              {isAdmin() && (
                <>
                  <Button 
                    onClick={handleDownloadTemplate} 
                    variant="ghost" 
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                  
                  <FileImporter onDataImported={handleDataImported} />
                  <AddEquipmentDialog onAddCPU={addCPU} onAddMonitor={addMonitor} />
                </>
              )}
              
              <Button 
                onClick={handleSignOut} 
                variant="ghost" 
                size="sm"
                className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-500/30 text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-2xl">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 rounded-xl transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 rounded-xl transition-all duration-300"
            >
              <Search className="h-4 w-4" />
              Buscar
            </TabsTrigger>
            <TabsTrigger 
              value="equipment" 
              className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 rounded-xl transition-all duration-300"
            >
              <TableIcon className="h-4 w-4" />
              Equipamentos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-8">
            <Dashboard equipmentData={equipmentData || { cpus: [], monitors: [] }} />
          </TabsContent>
          
          <TabsContent value="search" className="mt-8">
            <div className="space-y-6">
              {/* Filtros de Busca */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Busca de Equipamentos
                  </CardTitle>
                  <CardDescription>
                    Use os filtros para encontrar equipamentos específicos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Busca principal */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por qualquer campo (nome, modelo, responsável, etc.)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4"
                    />
                  </div>

                  {/* Filtros básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Departamento</label>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os departamentos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os departamentos</SelectItem>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Estado</label>
                      <Select value={stateFilter} onValueChange={setStateFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os estados</SelectItem>
                          {estados.map(estado => (
                            <SelectItem key={estado} value={estado}>
                              {estado === '0' ? 'Inativo (0)' : `Ativo (${estado})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ações</label>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setSearchTerm('');
                          setDepartmentFilter('all');
                          setStateFilter('all');
                        }}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </div>
                  </div>

                  {/* Resumo dos resultados */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MonitorIcon className="h-4 w-4" />
                        CPUs encontradas: {filteredCPUs.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MonitorIcon className="h-4 w-4" />
                        Monitores encontrados: {filteredMonitors.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Resultados da busca */}
              <EquipmentTable 
                cpus={filteredCPUs}
                monitors={filteredMonitors}
                onEditCPU={handleEditCPU}
                onEditMonitor={handleEditMonitor}
                onDeleteCPU={handleDeleteCPU}
                onDeleteMonitor={handleDeleteMonitor}
                isAdmin={isAdmin()}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-8">
            <EquipmentTable 
              cpus={equipmentData?.cpus || []}
              monitors={equipmentData?.monitors || []}
              onEditCPU={handleEditCPU}
              onEditMonitor={handleEditMonitor}
              onDeleteCPU={handleDeleteCPU}
              onDeleteMonitor={handleDeleteMonitor}
              isAdmin={isAdmin()}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;