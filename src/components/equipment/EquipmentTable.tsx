import { useState } from 'react';
import { CPU, Monitor } from '@/types/equipment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  Cpu,
  Monitor as MonitorIcon,
  HardDrive,
  Zap
} from 'lucide-react';

interface EquipmentTableProps {
  cpus: CPU[];
  monitors: Monitor[];
  onEditCPU?: (cpu: CPU) => void;
  onEditMonitor?: (monitor: Monitor) => void;
  onDeleteCPU?: (id: string) => void;
  onDeleteMonitor?: (id: string) => void;
}

export function EquipmentTable({ 
  cpus, 
  monitors, 
  onEditCPU, 
  onEditMonitor, 
  onDeleteCPU, 
  onDeleteMonitor 
}: EquipmentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');

  // Get unique departments for filter
  const departments = Array.from(
    new Set([...cpus.map(c => c.departamento), ...monitors.map(m => m.departamento)])
  ).filter(Boolean);

  // Filter CPUs
  const filteredCPUs = cpus.filter(cpu => {
    const matchesSearch = searchTerm === '' || 
      Object.values(cpu).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesDepartment = departmentFilter === 'all' || cpu.departamento === departmentFilter;
    const matchesState = stateFilter === 'all' || cpu.e_estado === stateFilter;
    
    return matchesSearch && matchesDepartment && matchesState;
  });

  // Filter monitors
  const filteredMonitors = monitors.filter(monitor => {
    const matchesSearch = searchTerm === '' || 
      Object.values(monitor).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesDepartment = departmentFilter === 'all' || monitor.departamento === departmentFilter;
    const matchesState = stateFilter === 'all' || monitor.e_estado === stateFilter;
    
    return matchesSearch && matchesDepartment && matchesState;
  });

  const getStatusBadge = (estado: string) => {
    const variant = estado === 'Ativo' ? 'default' : 
                   estado === 'RASURADO' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{estado}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Filtre os equipamentos por nome, departamento ou estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os departamentos</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="RASURADO">Rasurado</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Tables */}
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
                            {onEditCPU && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditCPU(cpu)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            {onDeleteCPU && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteCPU(cpu.id)}
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
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            {onDeleteMonitor && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteMonitor(monitor.id)}
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
    </div>
  );
}