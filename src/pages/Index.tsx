import { useState, useEffect } from 'react';
import { FileImporter } from '@/components/FileImporter';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { EquipmentData } from '@/types/equipment';
import { saveEquipmentData, loadEquipmentData, clearEquipmentData } from '@/lib/storage';
import { sampleData } from '@/lib/excel-parser';
import { useToast } from '@/hooks/use-toast';
import { 
  Monitor, 
  Upload, 
  Database, 
  Trash2,
  BarChart3,
  FileSpreadsheet 
} from 'lucide-react';

const Index = () => {
  const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load data from localStorage on component mount
    const savedData = loadEquipmentData();
    if (savedData) {
      setEquipmentData(savedData);
    }
    setIsLoading(false);
  }, []);

  const handleDataImported = (data: EquipmentData) => {
    setEquipmentData(data);
    saveEquipmentData(data);
    toast({
      title: "Dados salvos!",
      description: "Os dados foram salvos no armazenamento local do navegador.",
    });
  };

  const handleLoadSampleData = () => {
    setEquipmentData(sampleData);
    saveEquipmentData(sampleData);
    toast({
      title: "Dados de exemplo carregados!",
      description: "Use estes dados para testar o sistema.",
    });
  };

  const handleClearData = () => {
    setEquipmentData(null);
    clearEquipmentData();
    toast({
      title: "Dados removidos",
      description: "Todos os dados foram removidos do armazenamento.",
      variant: "destructive",
    });
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
            
            {/* Alternative Actions */}
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Ou teste o sistema com dados de exemplo
              </p>
              <Button 
                onClick={handleLoadSampleData}
                variant="outline"
                className="mr-4"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Carregar Dados de Exemplo
              </Button>
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
              <Button 
                onClick={() => setEquipmentData(null)}
                variant="outline" 
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Nova Importação
              </Button>
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

      {/* Dashboard */}
      <main className="container mx-auto px-4 py-8">
        <Dashboard data={equipmentData} />
      </main>
    </div>
  );
};

export default Index;
