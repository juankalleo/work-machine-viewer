import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseExcelFile } from '@/lib/excel-parser';
import { EquipmentData } from '@/types/equipment';
import { useToast } from '@/hooks/use-toast';

interface FileImporterProps {
  onDataImported: (data: EquipmentData) => void;
  className?: string;
}

export function FileImporter({ onDataImported, className }: FileImporterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const data = await parseExcelFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Small delay to show 100% progress
      setTimeout(() => {
        onDataImported(data);
        setIsLoading(false);
        setProgress(0);
        
        toast({
          title: "Importação concluída!",
          description: `${data.cpus.length} CPUs e ${data.monitors.length} monitores importados.`,
        });
      }, 300);
      
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      setIsLoading(false);
      setProgress(0);
      
      toast({
        title: "Erro na importação",
        description: "Não foi possível processar o arquivo. Verifique se é um arquivo Excel válido.",
        variant: "destructive",
      });
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button 
        onClick={openFileDialog}
        variant="outline"
        size="sm"
        disabled={isLoading}
        className={cn("relative", className)}
      >
        {isLoading ? (
          <>
            <FileSpreadsheet className="h-4 w-4 mr-2 animate-pulse" />
            Importando... {progress}%
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Importar Excel
          </>
        )}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}