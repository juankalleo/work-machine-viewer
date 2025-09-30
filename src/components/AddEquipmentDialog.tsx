import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Monitor, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddEquipmentDialogProps {
  onAddCPU: (cpuData: any) => Promise<boolean>;
  onAddMonitor?: (monitorData: any) => Promise<boolean>;
}

export function AddEquipmentDialog({ onAddCPU, onAddMonitor }: AddEquipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    item: '',
    nomenclatura: '',
    tombamento: '',
    marca_modelo: '',
    processador: '',
    memoria_ram: '',
    hd: '',
    ssd: '',
    sistema_operacional: '',
    no_dominio: '',
    departamento: '',
    responsavel: '',
    e_estado: '',
    data_formatacao: '',
    desfazimento: ''
  });

  const [monitorFormData, setMonitorFormData] = useState({
    item: '',
    tombamento: '',
    numero_serie: '',
    modelo: '',
    polegadas: '',
    observacao: '',
    data_verificacao: '',
    responsavel: '',
    departamento: '',
    e_estado: '',
    desfazimento: ''
  });

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

      const success = await onAddCPU({
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
        e_estado: formData.e_estado,
        data_formatacao: formData.data_formatacao || null,
        desfazimento: formData.desfazimento || null
      });

      if (success) {
        setOpen(false);
        // Limpar formulário
        setFormData({
          item: '',
          nomenclatura: '',
          tombamento: '',
          marca_modelo: '',
          processador: '',
          memoria_ram: '',
          hd: '',
          ssd: '',
          sistema_operacional: '',
          no_dominio: '',
          departamento: '',
          responsavel: '',
          e_estado: '',
          data_formatacao: '',
          desfazimento: ''
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar equipamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!onAddMonitor) {
      toast({
        title: "Funcionalidade não disponível",
        description: "Adição de monitores ainda não está implementada.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Validar campos obrigatórios
      if (!monitorFormData.modelo || !monitorFormData.tombamento) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha pelo menos Modelo e Tombamento.",
          variant: "destructive",
        });
        return;
      }

      // Converter item para número
      const itemNumber = parseInt(monitorFormData.item) || 1;

      const success = await onAddMonitor({
        item: itemNumber,
        tombamento: monitorFormData.tombamento,
        numero_serie: monitorFormData.numero_serie,
        modelo: monitorFormData.modelo,
        polegadas: monitorFormData.polegadas,
        observacao: monitorFormData.observacao || null,
        data_verificacao: monitorFormData.data_verificacao,
        responsavel: monitorFormData.responsavel,
        departamento: monitorFormData.departamento,
        e_estado: monitorFormData.e_estado,
        desfazimento: monitorFormData.desfazimento || null
      });

      if (success) {
        setOpen(false);
        // Limpar formulário
        setMonitorFormData({
          item: '',
          tombamento: '',
          numero_serie: '',
          modelo: '',
          polegadas: '',
          observacao: '',
          data_verificacao: '',
          responsavel: '',
          departamento: '',
          e_estado: '',
          desfazimento: ''
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar monitor:', error);
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

  const handleMonitorInputChange = (field: string, value: string) => {
    setMonitorFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Equipamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Novo Equipamento
          </DialogTitle>
          <DialogDescription>
            Escolha o tipo de equipamento e preencha os dados para cadastrá-lo no sistema.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="cpu" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cpu" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Monitor
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cpu" className="space-y-4">
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
                  {isSubmitting ? 'Adicionando...' : 'Adicionar CPU'}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="monitor" className="space-y-4">
            <form onSubmit={handleSubmitMonitor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item */}
                <div className="space-y-2">
                  <Label htmlFor="monitor_item">Item</Label>
                  <Input
                    id="monitor_item"
                    type="number"
                    value={monitorFormData.item}
                    onChange={(e) => handleMonitorInputChange('item', e.target.value)}
                    placeholder="1"
                  />
                </div>

                {/* Tombamento */}
                <div className="space-y-2">
                  <Label htmlFor="monitor_tombamento">Tombamento *</Label>
                  <Input
                    id="monitor_tombamento"
                    value={monitorFormData.tombamento}
                    onChange={(e) => handleMonitorInputChange('tombamento', e.target.value)}
                    placeholder="TMB001"
                    required
                  />
                </div>

                {/* Número de Série */}
                <div className="space-y-2">
                  <Label htmlFor="numero_serie">Número de Série</Label>
                  <Input
                    id="numero_serie"
                    value={monitorFormData.numero_serie}
                    onChange={(e) => handleMonitorInputChange('numero_serie', e.target.value)}
                    placeholder="BR-OMNV2T-TVBOO-OA9"
                  />
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <Label htmlFor="monitor_modelo">Modelo *</Label>
                  <Input
                    id="monitor_modelo"
                    value={monitorFormData.modelo}
                    onChange={(e) => handleMonitorInputChange('modelo', e.target.value)}
                    placeholder="DELL P2319Hc"
                    required
                  />
                </div>

                {/* Polegadas */}
                <div className="space-y-2">
                  <Label htmlFor="polegadas">Polegadas</Label>
                  <Input
                    id="polegadas"
                    value={monitorFormData.polegadas}
                    onChange={(e) => handleMonitorInputChange('polegadas', e.target.value)}
                    placeholder="23"
                  />
                </div>

                {/* Data de Verificação */}
                <div className="space-y-2">
                  <Label htmlFor="data_verificacao">Data de Verificação</Label>
                  <Input
                    id="data_verificacao"
                    type="date"
                    value={monitorFormData.data_verificacao}
                    onChange={(e) => handleMonitorInputChange('data_verificacao', e.target.value)}
                  />
                </div>

                {/* Responsável */}
                <div className="space-y-2">
                  <Label htmlFor="monitor_responsavel">Responsável</Label>
                  <Input
                    id="monitor_responsavel"
                    value={monitorFormData.responsavel}
                    onChange={(e) => handleMonitorInputChange('responsavel', e.target.value)}
                    placeholder="Diego Charles"
                  />
                </div>

                {/* Departamento */}
                <div className="space-y-2">
                  <Label htmlFor="monitor_departamento">Departamento</Label>
                  <Input
                    id="monitor_departamento"
                    value={monitorFormData.departamento}
                    onChange={(e) => handleMonitorInputChange('departamento', e.target.value)}
                    placeholder="TI"
                  />
                </div>

                {/* E-estado */}
                <div className="space-y-2">
                  <Label htmlFor="monitor_e_estado">E-estado</Label>
                  <Input
                    id="monitor_e_estado"
                    value={monitorFormData.e_estado}
                    onChange={(e) => handleMonitorInputChange('e_estado', e.target.value)}
                    placeholder="210000509"
                  />
                </div>
              </div>

              {/* Observação */}
              <div className="space-y-2">
                <Label htmlFor="monitor_observacao">Observação</Label>
                <Textarea
                  id="monitor_observacao"
                  value={monitorFormData.observacao}
                  onChange={(e) => handleMonitorInputChange('observacao', e.target.value)}
                  placeholder="Observações sobre o monitor..."
                  rows={3}
                />
              </div>

              {/* Desfazimento */}
              <div className="space-y-2">
                <Label htmlFor="monitor_desfazimento">Desfazimento</Label>
                <Textarea
                  id="monitor_desfazimento"
                  value={monitorFormData.desfazimento}
                  onChange={(e) => handleMonitorInputChange('desfazimento', e.target.value)}
                  placeholder="Informações sobre desfazimento..."
                  rows={2}
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
                  {isSubmitting ? 'Adicionando...' : 'Adicionar Monitor'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
