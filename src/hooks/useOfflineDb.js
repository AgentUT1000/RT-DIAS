/**
 * React Hook for Offline Database & Sync Status
 * Provides easy access to PouchDB offline capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import {
  initializeOfflineDb,
  getSyncStatus,
  onSyncStatusChange,
  processSyncQueue,
  createFieldReport,
  getFieldReports,
  getPendingReports,
  updateFieldReport,
  saveDisaster,
  getDisasters,
  bulkSaveDisasters,
  saveAlert,
  getAlerts,
  markAlertRead,
  getDatabaseStats,
  exportData,
  clearAllData,
} from '../services/offlineDb';

/**
 * Hook for sync status monitoring
 */
export const useSyncStatus = () => {
  const [status, setStatus] = useState(getSyncStatus());

  useEffect(() => {
    const unsubscribe = onSyncStatusChange(setStatus);
    return unsubscribe;
  }, []);

  const triggerSync = useCallback(async () => {
    return await processSyncQueue();
  }, []);

  return {
    ...status,
    triggerSync,
  };
};

/**
 * Hook for offline database initialization
 */
export const useOfflineDb = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeOfflineDb();
        setInitialized(true);
      } catch (err) {
        setError(err.message);
      }
    };
    init();
  }, []);

  return { initialized, error };
};

/**
 * Hook for field reports (offline-capable)
 */
export const useFieldReports = (options = {}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFieldReports(options);
      if (result.success) {
        setReports(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options.status, options.disasterId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const addReport = useCallback(async (report) => {
    const result = await createFieldReport(report);
    if (result.success) {
      await loadReports();
    }
    return result;
  }, [loadReports]);

  const editReport = useCallback(async (id, updates) => {
    const result = await updateFieldReport(id, updates);
    if (result.success) {
      await loadReports();
    }
    return result;
  }, [loadReports]);

  return {
    reports,
    loading,
    error,
    addReport,
    editReport,
    refresh: loadReports,
  };
};

/**
 * Hook for pending (unsynced) reports
 */
export const usePendingReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPendingReports();
      if (result.success) {
        setReports(result.data);
      }
    } catch (err) {
      console.error('Failed to load pending reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
    
    // Refresh when sync status changes
    const unsubscribe = onSyncStatusChange(() => {
      loadPending();
    });
    
    return unsubscribe;
  }, [loadPending]);

  return { reports, loading, refresh: loadPending };
};

/**
 * Hook for local disasters
 */
export const useLocalDisasters = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDisasters = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDisasters();
      if (result.success) {
        setDisasters(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisasters();
  }, [loadDisasters]);

  const addDisaster = useCallback(async (disaster) => {
    const result = await saveDisaster(disaster);
    if (result.success) {
      await loadDisasters();
    }
    return result;
  }, [loadDisasters]);

  const bulkAdd = useCallback(async (disasterList) => {
    const result = await bulkSaveDisasters(disasterList);
    if (result.success) {
      await loadDisasters();
    }
    return result;
  }, [loadDisasters]);

  return {
    disasters,
    loading,
    error,
    addDisaster,
    bulkAdd,
    refresh: loadDisasters,
  };
};

/**
 * Hook for local alerts
 */
export const useLocalAlerts = (options = {}) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAlerts(options);
      if (result.success) {
        setAlerts(result.data);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [options.unreadOnly]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const addAlert = useCallback(async (alert) => {
    const result = await saveAlert(alert);
    if (result.success) {
      await loadAlerts();
    }
    return result;
  }, [loadAlerts]);

  const markRead = useCallback(async (id) => {
    const result = await markAlertRead(id);
    if (result.success) {
      await loadAlerts();
    }
    return result;
  }, [loadAlerts]);

  return {
    alerts,
    loading,
    addAlert,
    markRead,
    refresh: loadAlerts,
  };
};

/**
 * Hook for database statistics
 */
export const useDatabaseStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDatabaseStats();
      setStats(result);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    
    // Refresh when sync status changes
    const unsubscribe = onSyncStatusChange(() => {
      loadStats();
    });
    
    return unsubscribe;
  }, [loadStats]);

  return { stats, loading, refresh: loadStats };
};

/**
 * Hook for data export/backup
 */
export const useDataExport = () => {
  const [exporting, setExporting] = useState(false);

  const exportAllData = useCallback(async () => {
    setExporting(true);
    try {
      const data = await exportData();
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rt-dias-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportAllData, exporting };
};

/**
 * Hook for clearing local data
 */
export const useClearData = () => {
  const [clearing, setClearing] = useState(false);

  const clearAll = useCallback(async () => {
    setClearing(true);
    try {
      const result = await clearAllData();
      return result;
    } finally {
      setClearing(false);
    }
  }, []);

  return { clearAll, clearing };
};

export default {
  useSyncStatus,
  useOfflineDb,
  useFieldReports,
  usePendingReports,
  useLocalDisasters,
  useLocalAlerts,
  useDatabaseStats,
  useDataExport,
  useClearData,
};
