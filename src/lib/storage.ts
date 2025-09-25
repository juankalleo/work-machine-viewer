import { EquipmentData } from '@/types/equipment';

const STORAGE_KEY = 'equipment_data';

export function saveEquipmentData(data: EquipmentData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
  }
}

export function loadEquipmentData(): EquipmentData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao carregar dados do localStorage:', error);
    return null;
  }
}

export function clearEquipmentData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao limpar dados do localStorage:', error);
  }
}