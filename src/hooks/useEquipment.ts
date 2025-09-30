import { useState, useEffect, useCallback } from 'react';
import { CPU, Monitor } from '@/lib/storage';
import { db } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

export interface EquipmentData {
  cpus: CPU[];
  monitors: Monitor[];
}

export function useEquipment() {
  const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCPUs = useCallback(async (): Promise<CPU[]> => {
    try {
      const cpus = await db.getAllCPUs();
      return cpus;
    } catch (error) {
      console.error('Erro ao buscar CPUs:', error);
      throw error;
    }
  }, []);

  const fetchMonitors = useCallback(async (): Promise<Monitor[]> => {
    try {
      const monitors = await db.getAllMonitors();
      return monitors;
    } catch (error) {
      console.error('Erro ao buscar monitores:', error);
      throw error;
    }
  }, []);

  const fetchAllEquipment = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [cpus, monitors] = await Promise.all([
        fetchCPUs(),
        fetchMonitors()
      ]);
      setEquipmentData({ cpus, monitors });
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
  }, [fetchCPUs, fetchMonitors, toast]);

  const addCPU = useCallback(async (cpuData: Omit<CPU, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const newCPU = await db.createCPU(cpuData);
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
      const updatedCPU = await db.updateCPU(id, cpuData);
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
      const success = await db.deleteCPU(id);
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

  // Sincronização manual
  const syncNow = useCallback(async () => {
    try {
      await db.syncNow();
      await fetchAllEquipment();
      toast({
        title: "Sincronizado",
        description: "Dados atualizados com sucesso!",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na sincronização';
      toast({
        title: "Erro na sincronização",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [fetchAllEquipment, toast]);

  // Status de conexão
  const getConnectionStatus = useCallback(() => {
    return db.getConnectionStatus();
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
    syncNow,
    getConnectionStatus,
  };
}
