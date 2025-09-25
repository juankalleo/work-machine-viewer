import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CPU, Monitor } from '@/types/equipment';
import { Plus, Cpu, Monitor as MonitorIcon } from 'lucide-react';

interface AddEquipmentDialogProps {
  onAddCPU: (cpu: Omit<CPU, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onAddMonitor: (monitor: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
}

export function AddEquipmentDialog({ onAddCPU, onAddMonitor }: AddEquipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // CPU form state
  const [cpuForm, setCpuForm] = useState({
    item: 1,
    nomenclatura: '',
    tombamento: '',
    e_estado: 'Ativo',
    marca_modelo: '',
    processador: '',
    memoria_ram: '',
    hd: '',
    ssd: '',
    sistema_operacional: '',
    no_dominio: 'NÃO',
    data_formatacao: '',
    responsavel: '',
    desfazimento: '',
    departamento: ''
  });

  // Monitor form state
  const [monitorForm, setMonitorForm] = useState({
    item: 1,
    tombamento: '',
    numero_serie: '',
    e_estado: 'Ativo',
    modelo: '',
    polegadas: '',
    observacao: '',
    data_verificacao: '',
    responsavel: '',
    desfazimento: '',
    departamento: ''
  });

  const resetForms = () => {
    setCpuForm({
      item: 1,
      nomenclatura: '',
      tombamento: '',
      e_estado: 'Ativo',
      marca_modelo: '',
      processador: '',
      memoria_ram: '',
      hd: '',
      ssd: '',
      sistema_operacional: '',
      no_dominio: 'NÃO',
      data_formatacao: '',
      responsavel: '',
      desfazimento: '',
      departamento: ''
    });

    setMonitorForm({
      item: 1,
      tombamento: '',
      numero_serie: '',
      e_estado: 'Ativo',
      modelo: '',
      polegadas: '',
      observacao: '',
      data_verificacao: '',
      responsavel: '',
      desfazimento: '',
      departamento: ''
    });
  };

  const handleAddCPU = async () => {
    try {
      setIsLoading(true);
      await onAddCPU({
        ...cpuForm,
        hd: cpuForm.hd || null,
        ssd: cpuForm.ssd || null,
        data_formatacao: cpuForm.data_formatacao || null,
        desfazimento: cpuForm.desfazimento || null
      });
      resetForms();
      setOpen(false);
    } catch (error) {
      console.error('Error adding CPU:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMonitor = async () => {
    try {
      setIsLoading(true);
      await onAddMonitor({
        ...monitorForm,
        observacao: monitorForm.observacao || null,
        desfazimento: monitorForm.desfazimento || null
      });
      resetForms();
      setOpen(false);
    } catch (error) {
      console.error('Error adding monitor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Equipamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
          <DialogDescription>
            Escolha o tipo de equipamento e preencha as informações necessárias.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cpu" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cpu" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <MonitorIcon className="h-4 w-4" />
              Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cpu" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu-item">Item *</Label>
                <Input
                  id="cpu-item"
                  type="number"
                  value={cpuForm.item}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, item: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-nomenclatura">Nomenclatura *</Label>
                <Input
                  id="cpu-nomenclatura"
                  value={cpuForm.nomenclatura}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, nomenclatura: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-tombamento">Tombamento *</Label>
                <Input
                  id="cpu-tombamento"
                  value={cpuForm.tombamento}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, tombamento: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-estado">Estado *</Label>
                <Select value={cpuForm.e_estado} onValueChange={(value) => setCpuForm(prev => ({ ...prev, e_estado: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                    <SelectItem value="RASURADO">Rasurado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-marca">Marca/Modelo *</Label>
                <Input
                  id="cpu-marca"
                  value={cpuForm.marca_modelo}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, marca_modelo: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-processador">Processador *</Label>
                <Input
                  id="cpu-processador"
                  value={cpuForm.processador}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, processador: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-ram">Memória RAM *</Label>
                <Input
                  id="cpu-ram"
                  value={cpuForm.memoria_ram}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, memoria_ram: e.target.value }))}
                  placeholder="ex: 8GB DDR4"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-hd">HD</Label>
                <Input
                  id="cpu-hd"
                  value={cpuForm.hd}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, hd: e.target.value }))}
                  placeholder="ex: 1TB SATA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-ssd">SSD</Label>
                <Input
                  id="cpu-ssd"
                  value={cpuForm.ssd}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, ssd: e.target.value }))}
                  placeholder="ex: 256GB NVMe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-so">Sistema Operacional *</Label>
                <Input
                  id="cpu-so"
                  value={cpuForm.sistema_operacional}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, sistema_operacional: e.target.value }))}
                  placeholder="ex: Windows 11 Pro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-dominio">No Domínio *</Label>
                <Select value={cpuForm.no_dominio} onValueChange={(value) => setCpuForm(prev => ({ ...prev, no_dominio: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIM">Sim</SelectItem>
                    <SelectItem value="NÃO">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-formatacao">Data Formatação</Label>
                <Input
                  id="cpu-formatacao"
                  value={cpuForm.data_formatacao}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, data_formatacao: e.target.value }))}
                  placeholder="dd/mm/aaaa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-responsavel">Responsável *</Label>
                <Input
                  id="cpu-responsavel"
                  value={cpuForm.responsavel}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, responsavel: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-departamento">Departamento *</Label>
                <Input
                  id="cpu-departamento"
                  value={cpuForm.departamento}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, departamento: e.target.value }))}
                  placeholder="ex: DER-GTI"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu-desfazimento">Desfazimento</Label>
                <Input
                  id="cpu-desfazimento"
                  value={cpuForm.desfazimento}
                  onChange={(e) => setCpuForm(prev => ({ ...prev, desfazimento: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleAddCPU} disabled={isLoading}>
                {isLoading ? 'Adicionando...' : 'Adicionar CPU'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="monitor" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monitor-item">Item *</Label>
                <Input
                  id="monitor-item"
                  type="number"
                  value={monitorForm.item}
                  onChange={(e) => setMonitorForm(prev => ({ ...prev, item: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitor-tombamento">Tombamento *</Label>
                <Input
                  id="monitor-tombamento"
                  value={monitorForm.tombamento}
                  onChange={(e) => setMonitorForm(prev => ({ ...prev, tombamento: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitor-serie">Número de Série *</Label>
                <Input
                  id="monitor-serie"
                  value={monitorForm.numero_serie}
                  onChange={(e) => setMonitorForm(prev => ({ ...prev, numero_serie: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitor-estado">Estado *</Label>
                <Select value={monitorForm.e_estado} onValueChange={(value) => setMonitorForm(prev => ({ ...prev, e_estado: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                    <SelectItem value="RASURADO">Rasurado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitor-modelo">Modelo *</Label>
                <Input
                  id="monitor-modelo"
                  value={monitorForm.modelo}
                  onChange={(e) => setMonitorForm(prev => ({ ...prev, modelo: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitor-polegadas">Polegadas *</Label>
                <Input
                  id="monitor-polegadas"
                  value={monitorForm.polegadas}
                  onChange={(e) => setMonitorForm(prev => ({ ...prev, polegadas: e.target.value }))}
                  placeholder="ex: 24&quot;"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitor-verificacao">Data de Verificação *</Label>
                <Input
                  id="monitor-verificacao"
                  value={monitorForm.data_verificacao}
                  onChange={(e) => setMonitorForm(prev => ({ ...prev, data_verificacao: e.target.value }))}
                  placeholder="dd/mm/aaaa"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitor-responsavel">Responsável *</Label>
                <Input
                  id="monitor-responsavel"
                  value={monitorForm.responsavel}
                  onChange={(e) => setMonitorForm(prev => ({ ...prev, responsavel: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitor-departamento">Departamento *</Label>
                <Input
                  id="monitor-departamento"
                  value={monitorForm.departamento}
                  onChange={(e) => setMonitorForm(prev => ({ ...prev, departamento: e.target.value }))}
                  placeholder="ex: DER-GTI"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitor-desfazimento">Desfazimento</Label>
                <Input
                  id="monitor-desfazimento"
                  value={monitorForm.desfazimento}
                  onChange={(e) => setMonitorForm(prev => ({ ...prev, desfazimento: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monitor-observacao">Observação</Label>
              <Textarea
                id="monitor-observacao"
                value={monitorForm.observacao}
                onChange={(e) => setMonitorForm(prev => ({ ...prev, observacao: e.target.value }))}
                placeholder="Observações adicionais sobre o monitor..."
                rows={3}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleAddMonitor} disabled={isLoading}>
                {isLoading ? 'Adicionando...' : 'Adicionar Monitor'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}