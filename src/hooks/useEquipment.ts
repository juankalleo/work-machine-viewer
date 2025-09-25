import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CPU, Monitor, EquipmentData } from '@/types/equipment';
import { useToast } from '@/hooks/use-toast';

export function useEquipment() {
  const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCPUs = useCallback(async (): Promise<CPU[]> => {
    const { data, error } = await supabase
      .from('cpus')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching CPUs:', error);
      throw error;
    }

    return data || [];
  }, []);

  const fetchMonitors = useCallback(async (): Promise<Monitor[]> => {
    const { data, error } = await supabase
      .from('monitors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching monitors:', error);
      throw error;
    }

    return data || [];
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar equipamentos';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchCPUs, fetchMonitors, toast]);

  const addCPU = useCallback(async (cpu: Omit<CPU, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('cpus')
        .insert([cpu])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "CPU adicionada",
        description: "CPU foi adicionada com sucesso.",
      });

      // Refresh data
      await fetchAllEquipment();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar CPU';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchAllEquipment, toast]);

  const addMonitor = useCallback(async (monitor: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('monitors')
        .insert([monitor])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Monitor adicionado",
        description: "Monitor foi adicionado com sucesso.",
      });

      // Refresh data
      await fetchAllEquipment();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar monitor';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchAllEquipment, toast]);

  const updateCPU = useCallback(async (id: string, updates: Partial<CPU>) => {
    try {
      const { data, error } = await supabase
        .from('cpus')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "CPU atualizada",
        description: "CPU foi atualizada com sucesso.",
      });

      // Refresh data
      await fetchAllEquipment();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar CPU';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchAllEquipment, toast]);

  const updateMonitor = useCallback(async (id: string, updates: Partial<Monitor>) => {
    try {
      const { data, error } = await supabase
        .from('monitors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Monitor atualizado",
        description: "Monitor foi atualizado com sucesso.",
      });

      // Refresh data
      await fetchAllEquipment();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar monitor';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchAllEquipment, toast]);

  const deleteCPU = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('cpus')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "CPU removida",
        description: "CPU foi removida com sucesso.",
      });

      // Refresh data
      await fetchAllEquipment();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover CPU';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchAllEquipment, toast]);

  const deleteMonitor = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('monitors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Monitor removido",
        description: "Monitor foi removido com sucesso.",
      });

      // Refresh data
      await fetchAllEquipment();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover monitor';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchAllEquipment, toast]);

  const importFromExcel = useCallback(async (data: EquipmentData) => {
    try {
      setIsLoading(true);

      // Clear existing data
      await Promise.all([
        supabase.from('cpus').delete().neq('id', ''),
        supabase.from('monitors').delete().neq('id', '')
      ]);

      // Insert new data
      const [cpuResult, monitorResult] = await Promise.all([
        supabase.from('cpus').insert(data.cpus.map(cpu => ({
          ...cpu,
          id: undefined // Let Supabase generate new IDs
        }))),
        supabase.from('monitors').insert(data.monitors.map(monitor => ({
          ...monitor,
          id: undefined // Let Supabase generate new IDs
        })))
      ]);

      if (cpuResult.error) throw cpuResult.error;
      if (monitorResult.error) throw monitorResult.error;

      toast({
        title: "Dados importados",
        description: "Dados da planilha foram importados com sucesso.",
      });

      // Refresh data
      await fetchAllEquipment();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao importar dados';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllEquipment, toast]);

  useEffect(() => {
    fetchAllEquipment();
  }, [fetchAllEquipment]);

  return {
    equipmentData,
    isLoading,
    error,
    addCPU,
    addMonitor,
    updateCPU,
    updateMonitor,
    deleteCPU,
    deleteMonitor,
    importFromExcel,
    refetch: fetchAllEquipment
  };
}