import { useState, useEffect } from 'react';
import { FileImporter } from '@/components/FileImporter';
import { Dashboard } from '@/components/Dashboard';
import { EquipmentTable } from '@/components/equipment/EquipmentTable';
import { AddEquipmentDialog } from '@/components/equipment/AddEquipmentDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEquipment } from '@/hooks/useEquipment';
import { parseExcelFile } from '@/lib/excel-parser';
import { useToast } from '@/hooks/use-toast';
import { EquipmentData } from '@/types/equipment';
import { 
  Monitor, 
  Upload, 
  Database, 
  Trash2,
  BarChart3,
  FileSpreadsheet,
  Table as TableIcon,
  Plus
} from 'lucide-react';

const Index = () => {
  const { 
    equipmentData, 
    isLoading, 
    error,
    addCPU,
    addMonitor,
    updateCPU,
    updateMonitor,
    deleteCPU,
    deleteMonitor,
    importFromExcel,
    refetch
  } = useEquipment();
  const { toast } = useToast();

  const handleDataImported = async (data: EquipmentData) => {
    try {
      await importFromExcel(data);
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar os dados da planilha.",
        variant: "destructive",
      });
    }
  };

  const handleClearData = async () => {
    try {
      // Clear database data
      if (equipmentData) {
        const deletePromises = [
          ...equipmentData.cpus.map(cpu => deleteCPU(cpu.id)),
          ...equipmentData.monitors.map(monitor => deleteMonitor(monitor.id))
        ];
        await Promise.all(deletePromises);
      }
      
      toast({
        title: "Dados removidos",
        description: "Todos os dados foram removidos do banco de dados.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar todos os dados.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dashboard-bg">
        <div className="animate-pulse text-center">
          <Monitor className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!equipmentData) {
    return (
      <div className="min-h-screen bg-dashboard-bg py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <div className="p-4 bg-gradient-primary rounded-full shadow-glow">
                <Monitor className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Sistema de Gerenciamento de Equipamentos
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Importe sua planilha de equipamentos e visualize métricas interativas, 
              gráficos e estatísticas detalhadas sobre CPUs e monitores.
            </p>
          </div>

          {/* Import Section */}
          <div className="max-w-2xl mx-auto space-y-6">
            <FileImporter onDataImported={handleDataImported} />
            
            {/* Add Equipment Button */}
            <div className="text-center">
              <AddEquipmentDialog 
                onAddCPU={addCPU}
                onAddMonitor={addMonitor}
              />
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 rounded-lg bg-gradient-card shadow-card">
                <BarChart3 className="h-8 w-8 mx-auto mb-3 text-dashboard-info" />
                <h3 className="font-semibold mb-2">Dashboards Interativos</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize métricas e estatísticas em tempo real
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-gradient-card shadow-card">
                <Database className="h-8 w-8 mx-auto mb-3 text-dashboard-success" />
                <h3 className="font-semibold mb-2">Armazenamento Local</h3>
                <p className="text-sm text-muted-foreground">
                  Dados salvos automaticamente no seu navegador
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-gradient-card shadow-card">
                <Upload className="h-8 w-8 mx-auto mb-3 text-dashboard-warning" />
                <h3 className="font-semibold mb-2">Importação Excel</h3>
                <p className="text-sm text-muted-foreground">
                  Suporte completo para planilhas .xlsx e .xls
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <header className="bg-dashboard-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Sistema de Equipamentos</h1>
                <p className="text-sm text-muted-foreground">
                  {equipmentData.cpus.length} CPUs • {equipmentData.monitors.length} Monitores
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <AddEquipmentDialog 
                onAddCPU={addCPU}
                onAddMonitor={addMonitor}
              />
              <Button 
                onClick={handleClearData}
                variant="outline" 
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Dados
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Equipamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard data={equipmentData} />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <EquipmentTable 
              cpus={equipmentData.cpus}
              monitors={equipmentData.monitors}
              onEditCPU={(cpu) => {
                // TODO: Implement edit functionality
                console.log('Edit CPU:', cpu);
              }}
              onEditMonitor={(monitor) => {
                // TODO: Implement edit functionality
                console.log('Edit Monitor:', monitor);
              }}
              onDeleteCPU={deleteCPU}
              onDeleteMonitor={deleteMonitor}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
