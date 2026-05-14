import { useEffect } from 'react';
import { initializeSocket, SOCKET_EVENTS } from '@/lib/socket';
import useAdminStore from '@/lib/store/adminStore';

/**
 * Hook for real-time settings synchronization
 * Listens for settings updates and refreshes the store
 */
export function useSettingsSync() {
  const { fetchSettings } = useAdminStore();

  useEffect(() => {
    try {
      const socket = initializeSocket();
      
      if (!socket) return;

      // Listen for settings updates from other clients
      socket.on(SOCKET_EVENTS.SETTINGS_UPDATED, (updatedSettings) => {
        // Update store with real-time settings
        useAdminStore.setState({ settings: updatedSettings });
      });

      return () => {
        socket.off(SOCKET_EVENTS.SETTINGS_UPDATED);
      };
    } catch (error) {
      console.error('Socket initialization failed:', error);
    }
  }, [fetchSettings]);
}

/**
 * Hook for syncing all admin data on mount
 */
export function useAdminDataSync() {
  const { syncAllData, fetchSettings } = useAdminStore();

  useEffect(() => {
    // Fetch all data on component mount
    const initializeData = async () => {
      try {
        await syncAllData();
      } catch (error) {
        console.error('Data sync failed:', error);
        // Fallback to individual fetch
        await fetchSettings();
      }
    };

    initializeData();
  }, [syncAllData, fetchSettings]);
}
