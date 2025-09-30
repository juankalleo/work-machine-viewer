import { useState, useEffect, useCallback } from 'react';
import { 
  getAllCPUs, 
  getCPUById, 
  createCPU, 
  updateCPU, 
  deleteCPU, 
  getCPUsByDepartment, 
  getCPUsByState, 
  getCPUStats,
  CPU
} from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export interface EquipmentData {
  cpus: CPU[];
}

export function useEquipment() {
  const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCPUs = useCallback(async (): Promise<CPU[]> => {
    try {
      const cpus = await getAllCPUs();
      return cpus;
    } catch (error) {
      console.error('Erro ao buscar CPUs:', error);
      throw error;
    }
  }, []);

  const fetchAllEquipment = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cpus = await fetchCPUs();
      setEquipmentData({ cpus });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao carregar equipamentos",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchCPUs, toast]);

  const addCPU = useCallback(async (cpuData: Omit<CPU, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const newCPU = createCPU(cpuData);
      if (equipmentData) {
        setEquipmentData({
          ...equipmentData,
          cpus: [newCPU, ...equipmentData.cpus]
        });
      }
      toast({
        title: "Equipamento adicionado",
        description: "CPU adicionada com sucesso!",
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao adicionar equipamento",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [equipmentData, toast]);

  const editCPU = useCallback(async (id: string, cpuData: Partial<Omit<CPU, 'id' | 'created_at'>>): Promise<boolean> => {
    try {
      const updatedCPU = updateCPU(id, cpuData);
      if (updatedCPU && equipmentData) {
        setEquipmentData({
          ...equipmentData,
          cpus: equipmentData.cpus.map(cpu => 
            cpu.id === id ? updatedCPU : cpu
          )
        });
      }
      toast({
        title: "Equipamento atualizado",
        description: "CPU atualizada com sucesso!",
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao atualizar equipamento",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [equipmentData, toast]);

  const removeCPU = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = deleteCPU(id);
      if (success && equipmentData) {
        setEquipmentData({
          ...equipmentData,
          cpus: equipmentData.cpus.filter(cpu => cpu.id !== id)
        });
      }
      toast({
        title: "Equipamento removido",
        description: "CPU removida com sucesso!",
      });
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao remover equipamento",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [equipmentData, toast]);

  const getCPUByIdCallback = useCallback(async (id: string): Promise<CPU | null> => {
    try {
      return getCPUById(id);
    } catch (error) {
      console.error('Erro ao buscar CPU:', error);
      return null;
    }
  }, []);

  const getCPUsByDepartmentCallback = useCallback(async (department: string): Promise<CPU[]> => {
    try {
      return getCPUsByDepartment(department);
    } catch (error) {
      console.error('Erro ao buscar CPUs por departamento:', error);
      return [];
    }
  }, []);

  const getCPUsByStateCallback = useCallback(async (state: string): Promise<CPU[]> => {
    try {
      return getCPUsByState(state);
    } catch (error) {
      console.error('Erro ao buscar CPUs por estado:', error);
      return [];
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
      return getCPUStats();
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total: 0,
        byDepartment: {},
        byState: {}
      };
    }
  }, []);

  useEffect(() => {
    fetchAllEquipment();
  }, [fetchAllEquipment]);

  return {
    equipmentData,
    isLoading,
    error,
    fetchAllEquipment,
    addCPU,
    editCPU,
    removeCPU,
    getCPUById: getCPUByIdCallback,
    getCPUsByDepartment: getCPUsByDepartmentCallback,
    getCPUsByState: getCPUsByStateCallback,
    getStats,
  };
}