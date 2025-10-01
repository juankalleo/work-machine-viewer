import { useState, useEffect } from 'react';
import { CPU, Monitor } from '@/types/equipment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  Monitor as MonitorIcon,
  Calendar,
  Building2,
  User,
  HardDrive
} from 'lucide-react';

interface SearchFilters {
  searchTerm: string;
  departamento: string;
  responsavel: string;
  e_estado: string;
  marca_modelo: string;
  processador: string;
  sistema_operacional: string;
  no_dominio: string;
  dataInicio: string;
  dataFim: string;
}

interface AdvancedSearchProps {
  cpus: CPU[];
  monitors: Monitor[];
  onResultsChange: (filteredCpus: CPU[], filteredMonitors: Monitor[]) => void;
}

export function AdvancedSearch({ cpus, monitors, onResultsChange }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    departamento: 'all',
    responsavel: 'all',
    e_estado: 'all',
    marca_modelo: 'all',
    processador: 'all',
    sistema_operacional: 'all',
    no_dominio: 'all',
    dataInicio: '',
    dataFim: ''
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Extrair opções únicas dos dados
  const departments = Array.from(new Set([...cpus.map(c => c.departamento), ...monitors.map(m => m.departamento)])).filter(Boolean).sort();
  const responsibles = Array.from(new Set([...cpus.map(c => c.responsavel), ...monitors.map(m => m.responsavel)])).filter(Boolean).sort();
  const brands = Array.from(new Set(cpus.map(c => c.marca_modelo))).filter(Boolean).sort();
  const processors = Array.from(new Set(cpus.map(c => c.processador))).filter(Boolean).sort();
  const operatingSystems = Array.from(new Set(cpus.map(c => c.sistema_operacional))).filter(Boolean).sort();
  const estados = Array.from(new Set([...cpus.map(c => c.e_estado), ...monitors.map(m => m.e_estado)])).map(String).sort();

  // Aplicar filtros
  const applyFilters = () => {
    let filteredCPUs = [...cpus];
    let filteredMonitors = [...monitors];

    // Busca por texto geral
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
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
    if (filters.departamento !== 'all') {
      filteredCPUs = filteredCPUs.filter(cpu => cpu.departamento === filters.departamento);
      filteredMonitors = filteredMonitors.filter(monitor => monitor.departamento === filters.departamento);
    }

    // Filtro por responsável
    if (filters.responsavel !== 'all') {
      filteredCPUs = filteredCPUs.filter(cpu => cpu.responsavel === filters.responsavel);
      filteredMonitors = filteredMonitors.filter(monitor => monitor.responsavel === filters.responsavel);
    }

    // Filtro por estado
    if (filters.e_estado !== 'all') {
      filteredCPUs = filteredCPUs.filter(cpu => cpu.e_estado.toString() === filters.e_estado);
      filteredMonitors = filteredMonitors.filter(monitor => monitor.e_estado.toString() === filters.e_estado);
    }

    // Filtros específicos para CPUs
    if (filters.marca_modelo !== 'all') {
      filteredCPUs = filteredCPUs.filter(cpu => cpu.marca_modelo === filters.marca_modelo);
    }

    if (filters.processador !== 'all') {
      filteredCPUs = filteredCPUs.filter(cpu => cpu.processador === filters.processador);
    }

    if (filters.sistema_operacional !== 'all') {
      filteredCPUs = filteredCPUs.filter(cpu => cpu.sistema_operacional === filters.sistema_operacional);
    }

    if (filters.no_dominio !== 'all') {
      filteredCPUs = filteredCPUs.filter(cpu => cpu.no_dominio === filters.no_dominio);
    }

    // Filtros por data
    if (filters.dataInicio) {
      const startDate = new Date(filters.dataInicio);
      filteredCPUs = filteredCPUs.filter(cpu => {
        if (cpu.created_at) {
          return new Date(cpu.created_at) >= startDate;
        }
        return true;
      });
      filteredMonitors = filteredMonitors.filter(monitor => {
        if (monitor.created_at) {
          return new Date(monitor.created_at) >= startDate;
        }
        return true;
      });
    }

    if (filters.dataFim) {
      const endDate = new Date(filters.dataFim);
      endDate.setHours(23, 59, 59, 999); // Final do dia
      filteredCPUs = filteredCPUs.filter(cpu => {
        if (cpu.created_at) {
          return new Date(cpu.created_at) <= endDate;
        }
        return true;
      });
      filteredMonitors = filteredMonitors.filter(monitor => {
        if (monitor.created_at) {
          return new Date(monitor.created_at) <= endDate;
        }
        return true;
      });
    }

    onResultsChange(filteredCPUs, filteredMonitors);

    // Atualizar filtros ativos
    const active = [];
    if (filters.searchTerm.trim()) active.push(`Busca: "${filters.searchTerm}"`);
    if (filters.departamento !== 'all') active.push(`Departamento: ${filters.departamento}`);
    if (filters.responsavel !== 'all') active.push(`Responsável: ${filters.responsavel}`);
    if (filters.e_estado !== 'all') active.push(`Estado: ${filters.e_estado}`);
    if (filters.marca_modelo !== 'all') active.push(`Marca/Modelo: ${filters.marca_modelo}`);
    if (filters.processador !== 'all') active.push(`Processador: ${filters.processador}`);
    if (filters.sistema_operacional !== 'all') active.push(`SO: ${filters.sistema_operacional}`);
    if (filters.no_dominio !== 'all') active.push(`Domínio: ${filters.no_dominio}`);
    if (filters.dataInicio) active.push(`Data início: ${filters.dataInicio}`);
    if (filters.dataFim) active.push(`Data fim: ${filters.dataFim}`);
    
    setActiveFilters(active);
  };

  // Limpar filtros
  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      searchTerm: '',
      departamento: 'all',
      responsavel: 'all',
      e_estado: 'all',
      marca_modelo: 'all',
      processador: 'all',
      sistema_operacional: 'all',
      no_dominio: 'all',
      dataInicio: '',
      dataFim: ''
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
  };

  // Aplicar filtros sempre que mudarem
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, cpus, monitors]);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
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
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10 pr-4"
            />
          </div>

          {/* Filtros básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Departamento
              </Label>
              <Select value={filters.departamento} onValueChange={(value) => updateFilter('departamento', value)}>
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
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Responsável
              </Label>
              <Select value={filters.responsavel} onValueChange={(value) => updateFilter('responsavel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os responsáveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os responsáveis</SelectItem>
                  {responsibles.map(resp => (
                    <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Estado
              </Label>
              <Select value={filters.e_estado} onValueChange={(value) => updateFilter('e_estado', value)}>
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
          </div>

          {/* Filtros avançados (colapsível) */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avançados
                {isAdvancedOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Marca/Modelo */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Marca/Modelo
                  </Label>
                  <Select value={filters.marca_modelo} onValueChange={(value) => updateFilter('marca_modelo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as marcas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as marcas</SelectItem>
                      {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Processador */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Processador
                  </Label>
                  <Select value={filters.processador} onValueChange={(value) => updateFilter('processador', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os processadores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os processadores</SelectItem>
                      {processors.map(proc => (
                        <SelectItem key={proc} value={proc}>{proc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sistema Operacional */}
                <div className="space-y-2">
                  <Label>Sistema Operacional</Label>
                  <Select value={filters.sistema_operacional} onValueChange={(value) => updateFilter('sistema_operacional', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os sistemas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os sistemas</SelectItem>
                      {operatingSystems.map(os => (
                        <SelectItem key={os} value={os}>{os}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Domínio */}
                <div className="space-y-2">
                  <Label>No Domínio</Label>
                  <Select value={filters.no_dominio} onValueChange={(value) => updateFilter('no_dominio', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="SIM">Sim</SelectItem>
                      <SelectItem value="NÃO">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Data início */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data Início
                  </Label>
                  <Input
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) => updateFilter('dataInicio', e.target.value)}
                  />
                </div>

                {/* Data fim */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data Fim
                  </Label>
                  <Input
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) => updateFilter('dataFim', e.target.value)}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Filtros ativos */}
          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Filtros Ativos:</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-1 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar Todos
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Resumo dos resultados */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Cpu className="h-4 w-4" />
                CPUs encontradas: {cpus.length}
              </span>
              <span className="flex items-center gap-1">
                <MonitorIcon className="h-4 w-4" />
                Monitores encontrados: {monitors.length}
              </span>
            </div>
            {activeFilters.length > 0 && (
              <span className="text-blue-600 dark:text-blue-400">
                {activeFilters.length} filtro{activeFilters.length !== 1 ? 's' : ''} ativo{activeFilters.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}