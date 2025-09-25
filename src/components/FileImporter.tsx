import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseExcelFile } from '@/lib/excel-parser';
import { EquipmentData } from '@/types/equipment';
import { useToast } from '@/hooks/use-toast';

interface FileImporterProps {
  onDataImported: (data: EquipmentData) => void;
  className?: string;
}

export function FileImporter({ onDataImported, className }: FileImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );
    
    if (excelFile) {
      handleFileUpload(excelFile);
    } else {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
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
    <Card className={cn(
      "transition-all duration-300",
      isDragging && "border-primary bg-primary/5",
      className
    )}>
      <CardContent className="p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200",
            isDragging 
              ? "border-primary bg-primary/10" 
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <FileSpreadsheet className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Processando planilha...
                </p>
                <Progress value={progress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-muted-foreground">
                  {progress}% concluído
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className={cn(
                  "h-12 w-12 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Importar Planilha de Equipamentos
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Arraste e solte seu arquivo Excel aqui ou clique para selecionar
                </p>
              </div>
              <Button 
                onClick={openFileDialog}
                variant="outline"
                className="mt-4"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
              <div className="text-xs text-muted-foreground">
                Formatos suportados: .xlsx, .xls
              </div>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}