import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CPU } from '@/types/equipment';

interface EditEquipmentDialogProps {
  cpu: CPU;
  onUpdateCPU: (id: string, cpuData: any) => Promise<boolean>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditEquipmentDialog({ cpu, onUpdateCPU, open: externalOpen, onOpenChange }: EditEquipmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    item: cpu.item.toString(),
    nomenclatura: cpu.nomenclatura,
    tombamento: cpu.tombamento,
    marca_modelo: cpu.marca_modelo,
    processador: cpu.processador,
    memoria_ram: cpu.memoria_ram,
    hd: cpu.hd || '',
    ssd: cpu.ssd || '',
    sistema_operacional: cpu.sistema_operacional,
    no_dominio: cpu.no_dominio,
    departamento: cpu.departamento,
    responsavel: cpu.responsavel,
    e_estado: cpu.e_estado.toString(),
    data_formatacao: cpu.data_formatacao || '',
    desfazimento: cpu.desfazimento || ''
  });

  useEffect(() => {
    setFormData({
      item: cpu.item.toString(),
      nomenclatura: cpu.nomenclatura,
      tombamento: cpu.tombamento,
      marca_modelo: cpu.marca_modelo,
      processador: cpu.processador,
      memoria_ram: cpu.memoria_ram,
      hd: cpu.hd || '',
      ssd: cpu.ssd || '',
      sistema_operacional: cpu.sistema_operacional,
      no_dominio: cpu.no_dominio,
      departamento: cpu.departamento,
      responsavel: cpu.responsavel,
      e_estado: cpu.e_estado.toString(),
      data_formatacao: cpu.data_formatacao || '',
      desfazimento: cpu.desfazimento || ''
    });
  }, [cpu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar campos obrigatórios
      if (!formData.nomenclatura || !formData.tombamento || !formData.marca_modelo) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha pelo menos Nomenclatura, Tombamento e Marca/Modelo.",
          variant: "destructive",
        });
        return;
      }

      // Converter item para número
      const itemNumber = parseInt(formData.item) || 1;

      const success = await onUpdateCPU(cpu.id, {
        item: itemNumber,
        nomenclatura: formData.nomenclatura,
        tombamento: formData.tombamento,
        marca_modelo: formData.marca_modelo,
        processador: formData.processador,
        memoria_ram: formData.memoria_ram,
        hd: formData.hd || null,
        ssd: formData.ssd || null,
        sistema_operacional: formData.sistema_operacional,
        no_dominio: formData.no_dominio,
        departamento: formData.departamento,
        responsavel: formData.responsavel,
        e_estado: parseInt(formData.e_estado) || 0,
        data_formatacao: formData.data_formatacao || null,
        desfazimento: formData.desfazimento || null
      });

      if (success) {
        setOpen(false);
        toast({
          title: "Equipamento atualizado",
          description: "Os dados foram atualizados com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Editar Equipamento
          </DialogTitle>
          <DialogDescription>
            Atualize os dados do equipamento.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item */}
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Input
                id="item"
                type="number"
                value={formData.item}
                onChange={(e) => handleInputChange('item', e.target.value)}
                placeholder="1"
              />
            </div>

            {/* Nomenclatura */}
            <div className="space-y-2">
              <Label htmlFor="nomenclatura">Nomenclatura *</Label>
              <Input
                id="nomenclatura"
                value={formData.nomenclatura}
                onChange={(e) => handleInputChange('nomenclatura', e.target.value)}
                placeholder="CPU-001"
                required
              />
            </div>

            {/* Tombamento */}
            <div className="space-y-2">
              <Label htmlFor="tombamento">Tombamento *</Label>
              <Input
                id="tombamento"
                value={formData.tombamento}
                onChange={(e) => handleInputChange('tombamento', e.target.value)}
                placeholder="TMB001"
                required
              />
            </div>

            {/* Marca/Modelo */}
            <div className="space-y-2">
              <Label htmlFor="marca_modelo">Marca/Modelo *</Label>
              <Input
                id="marca_modelo"
                value={formData.marca_modelo}
                onChange={(e) => handleInputChange('marca_modelo', e.target.value)}
                placeholder="Dell OptiPlex 7090"
                required
              />
            </div>

            {/* Processador */}
            <div className="space-y-2">
              <Label htmlFor="processador">Processador</Label>
              <Input
                id="processador"
                value={formData.processador}
                onChange={(e) => handleInputChange('processador', e.target.value)}
                placeholder="Intel Core i5-11500"
              />
            </div>

            {/* Memória RAM */}
            <div className="space-y-2">
              <Label htmlFor="memoria_ram">Memória RAM</Label>
              <Input
                id="memoria_ram"
                value={formData.memoria_ram}
                onChange={(e) => handleInputChange('memoria_ram', e.target.value)}
                placeholder="8GB DDR4"
              />
            </div>

            {/* HD */}
            <div className="space-y-2">
              <Label htmlFor="hd">HD</Label>
              <Input
                id="hd"
                value={formData.hd}
                onChange={(e) => handleInputChange('hd', e.target.value)}
                placeholder="1TB SATA"
              />
            </div>

            {/* SSD */}
            <div className="space-y-2">
              <Label htmlFor="ssd">SSD</Label>
              <Input
                id="ssd"
                value={formData.ssd}
                onChange={(e) => handleInputChange('ssd', e.target.value)}
                placeholder="512GB NVMe"
              />
            </div>

            {/* Sistema Operacional */}
            <div className="space-y-2">
              <Label htmlFor="sistema_operacional">Sistema Operacional</Label>
              <Input
                id="sistema_operacional"
                value={formData.sistema_operacional}
                onChange={(e) => handleInputChange('sistema_operacional', e.target.value)}
                placeholder="Windows 11 Pro"
              />
            </div>

            {/* Domínio */}
            <div className="space-y-2">
              <Label htmlFor="no_dominio">Domínio</Label>
              <Input
                id="no_dominio"
                value={formData.no_dominio}
                onChange={(e) => handleInputChange('no_dominio', e.target.value)}
                placeholder="DOMINIO01"
              />
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento</Label>
              <Input
                id="departamento"
                value={formData.departamento}
                onChange={(e) => handleInputChange('departamento', e.target.value)}
                placeholder="TI"
              />
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => handleInputChange('responsavel', e.target.value)}
                placeholder="João Silva"
              />
            </div>

            {/* E-estado */}
            <div className="space-y-2">
              <Label htmlFor="e_estado">E-estado</Label>
              <Input
                id="e_estado"
                type="number"
                value={formData.e_estado}
                onChange={(e) => handleInputChange('e_estado', e.target.value)}
                placeholder="210000509"
              />
            </div>

            {/* Data de Formatação */}
            <div className="space-y-2">
              <Label htmlFor="data_formatacao">Data de Formatação</Label>
              <Input
                id="data_formatacao"
                type="date"
                value={formData.data_formatacao}
                onChange={(e) => handleInputChange('data_formatacao', e.target.value)}
              />
            </div>
          </div>

          {/* Desfazimento */}
          <div className="space-y-2">
            <Label htmlFor="desfazimento">Desfazimento</Label>
            <Textarea
              id="desfazimento"
              value={formData.desfazimento}
              onChange={(e) => handleInputChange('desfazimento', e.target.value)}
              placeholder="Observações sobre o equipamento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Atualizando...' : 'Atualizar Equipamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
