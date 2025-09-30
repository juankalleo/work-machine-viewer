// Arquivo mantido para compatibilidade mas não mais usado
// O sistema agora usa MySQL direto via database.ts

// Manter apenas um stub para não quebrar imports existentes
export const apiClient = {
  getConnectionStatus: () => ({ isOnline: false, serverUrl: '' })
};

export default apiClient;
