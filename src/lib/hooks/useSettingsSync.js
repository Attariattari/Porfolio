import { useEffect } from 'react';
import { disposeSocket, initializeSocket, SOCKET_EVENTS } from '@/lib/socket';
import useAdminStore from '@/lib/store/adminStore';
import usePublicSettingsStore from '@/lib/store/publicSettingsStore';

/**
 * Hook for real-time settings synchronization
 * Listens for settings updates and refreshes the store
 */
export function useSettingsSync() {
  const fetchSettings = usePublicSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    let active = true;
    const syncSettings = () => {
      if (active && document.visibilityState === "visible") fetchSettings();
    };

    const interval = window.setInterval(syncSettings, 10000);
    window.addEventListener("focus", syncSettings);
    document.addEventListener("visibilitychange", syncSettings);

    let socket = null;
    try {
      socket = initializeSocket();
      
      // Listen for settings updates from other clients
      socket?.on(SOCKET_EVENTS.SETTINGS_UPDATED, (updatedSettings) => {
        // Update store with real-time settings
        usePublicSettingsStore.setState({ settings: updatedSettings });
      });
    } catch (error) {
      console.error('Socket initialization failed:', error);
    }

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", syncSettings);
      document.removeEventListener("visibilitychange", syncSettings);
      socket?.off(SOCKET_EVENTS.SETTINGS_UPDATED);
      disposeSocket(socket);
    };
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
