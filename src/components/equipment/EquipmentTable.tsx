import { useState } from 'react';
import { CPU, Monitor } from '@/types/equipment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditEquipmentDialog } from '@/components/EditEquipmentDialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Edit2, 
  Trash2, 
  Cpu,
  Monitor as MonitorIcon
} from 'lucide-react';

interface EquipmentTableProps {
  cpus: CPU[];
  monitors: Monitor[];
  onEditCPU?: (id: string, cpuData: any) => Promise<boolean>;
  onEditMonitor?: (monitor: Monitor) => void;
  onDeleteCPU?: (id: string) => void;
  onDeleteMonitor?: (id: string) => void;
  isAdmin?: boolean;
}

export function EquipmentTable({ 
  cpus, 
  monitors, 
  onEditCPU, 
  onEditMonitor, 
  onDeleteCPU, 
  onDeleteMonitor,
  isAdmin = false
}: EquipmentTableProps) {
  const [editingCPU, setEditingCPU] = useState<CPU | null>(null);
  
  // Use os dados já filtrados externamente
  const filteredCPUs = cpus;
  const filteredMonitors = monitors;

  const getStatusBadge = (estado: number) => {
    // Para números, vamos assumir que valores > 0 são ativos, 0 é inativo
    const estadoText = estado > 0 ? estado.toString() : 'Inativo';
    const variant = estado > 0 ? 'default' : 'secondary';
    return <Badge variant={variant}>{estadoText}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cpus" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cpus" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            CPUs ({filteredCPUs.length})
          </TabsTrigger>
          <TabsTrigger value="monitors" className="flex items-center gap-2">
            <MonitorIcon className="h-4 w-4" />
            Monitores ({filteredMonitors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cpus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                CPUs
              </CardTitle>
              <CardDescription>
                Lista completa de CPUs cadastradas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Nomenclatura</TableHead>
                      <TableHead>Tombamento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Marca/Modelo</TableHead>
                      <TableHead>Processador</TableHead>
                      <TableHead>RAM</TableHead>
                      <TableHead>HD</TableHead>
                      <TableHead>SSD</TableHead>
                      <TableHead>SO</TableHead>
                      <TableHead>Domínio</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCPUs.map((cpu) => (
                      <TableRow key={cpu.id}>
                        <TableCell className="font-medium">{cpu.item}</TableCell>
                        <TableCell>{cpu.nomenclatura}</TableCell>
                        <TableCell>{cpu.tombamento}</TableCell>
                        <TableCell>{getStatusBadge(cpu.e_estado)}</TableCell>
                        <TableCell>{cpu.marca_modelo}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={cpu.processador}>
                          {cpu.processador}
                        </TableCell>
                        <TableCell>{cpu.memoria_ram}</TableCell>
                        <TableCell>{cpu.hd || '-'}</TableCell>
                        <TableCell>{cpu.ssd || '-'}</TableCell>
                        <TableCell className="max-w-[120px] truncate" title={cpu.sistema_operacional}>
                          {cpu.sistema_operacional}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cpu.no_dominio === 'SIM' ? 'default' : 'secondary'}>
                            {cpu.no_dominio}
                          </Badge>
                        </TableCell>
                        <TableCell>{cpu.responsavel}</TableCell>
                        <TableCell>{cpu.departamento}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingCPU(cpu)}
                                title="Editar equipamento"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            {onDeleteCPU && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteCPU(cpu.id)}
                                disabled={!isAdmin}
                                title={!isAdmin ? "Apenas administradores podem excluir" : ""}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MonitorIcon className="h-5 w-5" />
                Monitores
              </CardTitle>
              <CardDescription>
                Lista completa de monitores cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Tombamento</TableHead>
                      <TableHead>Número de Série</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Polegadas</TableHead>
                      <TableHead>Observação</TableHead>
                      <TableHead>Data Verificação</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMonitors.map((monitor) => (
                      <TableRow key={monitor.id}>
                        <TableCell className="font-medium">{monitor.item}</TableCell>
                        <TableCell>{monitor.tombamento}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={monitor.numero_serie}>
                          {monitor.numero_serie}
                        </TableCell>
                        <TableCell>{getStatusBadge(monitor.e_estado)}</TableCell>
                        <TableCell>{monitor.modelo}</TableCell>
                        <TableCell>{monitor.polegadas}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={monitor.observacao || ''}>
                          {monitor.observacao || '-'}
                        </TableCell>
                        <TableCell>{monitor.data_verificacao}</TableCell>
                        <TableCell>{monitor.responsavel}</TableCell>
                        <TableCell>{monitor.departamento}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {onEditMonitor && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditMonitor(monitor)}
                                disabled={!isAdmin}
                                title={!isAdmin ? "Apenas administradores podem editar" : ""}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            {onDeleteMonitor && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteMonitor(monitor.id)}
                                disabled={!isAdmin}
                                title={!isAdmin ? "Apenas administradores podem excluir" : ""}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit CPU Dialog */}
      {editingCPU && onEditCPU && (
        <EditEquipmentDialog 
          cpu={editingCPU}
          open={!!editingCPU}
          onOpenChange={(open) => {
            if (!open) {
              setEditingCPU(null);
            }
          }}
          onUpdateCPU={async (id, cpuData) => {
            const success = await onEditCPU(id, cpuData);
            if (success) {
              setEditingCPU(null);
            }
            return success;
          }}
        />
      )}
    </div>
  );
}
