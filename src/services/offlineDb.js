/**
 * PouchDB Offline Database Service
 * Ensures field data synchronization when connectivity is restored
 */

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

// Add find plugin for querying
PouchDB.plugin(PouchDBFind);

// Local databases
const disastersDb = new PouchDB('rt_dias_disasters');
const reportsDb = new PouchDB('rt_dias_field_reports');
const alertsDb = new PouchDB('rt_dias_alerts');
const queueDb = new PouchDB('rt_dias_sync_queue');

// Remote CouchDB URL (configure for production)
const REMOTE_COUCH_URL = import.meta.env.VITE_COUCHDB_URL || null;

// Sync status
let syncStatus = {
  isOnline: navigator.onLine,
  lastSync: null,
  pendingChanges: 0,
  syncInProgress: false,
};

// Listeners for sync status changes
const statusListeners = new Set();

/**
 * Notify all listeners of status change
 */
const notifyStatusChange = () => {
  statusListeners.forEach(listener => listener({ ...syncStatus }));
};

/**
 * Subscribe to sync status changes
 */
export const onSyncStatusChange = (callback) => {
  statusListeners.add(callback);
  // Return unsubscribe function
  return () => statusListeners.delete(callback);
};

/**
 * Get current sync status
 */
export const getSyncStatus = () => ({ ...syncStatus });

/**
 * Initialize indexes for efficient querying
 */
const initializeIndexes = async () => {
  try {
    // Index for disasters by type and severity
    await disastersDb.createIndex({
      index: { fields: ['type', 'severity', 'reportedAt'] }
    });
    
    // Index for field reports by status
    await reportsDb.createIndex({
      index: { fields: ['status', 'createdAt', 'disasterId'] }
    });
    
    // Index for alerts by priority
    await alertsDb.createIndex({
      index: { fields: ['priority', 'createdAt', 'read'] }
    });
    
    // Index for sync queue
    await queueDb.createIndex({
      index: { fields: ['status', 'createdAt', 'retries'] }
    });
    
    console.log('PouchDB indexes initialized');
  } catch (error) {
    console.error('Failed to create indexes:', error);
  }
};

// ==========================================
// DISASTER DATA OPERATIONS
// ==========================================

/**
 * Save disaster to local database
 */
export const saveDisaster = async (disaster) => {
  try {
    const doc = {
      _id: disaster.id || `disaster_${Date.now()}`,
      ...disaster,
      _localTimestamp: new Date().toISOString(),
      _synced: false,
    };
    
    // Check if exists and get revision
    try {
      const existing = await disastersDb.get(doc._id);
      doc._rev = existing._rev;
    } catch (e) {
      // Document doesn't exist, that's fine
    }
    
    const result = await disastersDb.put(doc);
    await addToSyncQueue('disasters', doc._id, 'upsert');
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Failed to save disaster:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all disasters from local database
 */
export const getDisasters = async (options = {}) => {
  try {
    const { type, severity, limit = 100 } = options;
    
    const selector = {};
    if (type) selector.type = type;
    if (severity) selector.severity = severity;
    
    const result = await disastersDb.find({
      selector,
      limit,
      sort: [{ reportedAt: 'desc' }]
    });
    
    return { success: true, data: result.docs };
  } catch (error) {
    // Fallback to allDocs if find fails
    try {
      const result = await disastersDb.allDocs({ include_docs: true });
      const docs = result.rows
        .map(row => row.doc)
        .filter(doc => !doc._id.startsWith('_'));
      return { success: true, data: docs };
    } catch (fallbackError) {
      console.error('Failed to get disasters:', fallbackError);
      return { success: false, data: [], error: fallbackError.message };
    }
  }
};

/**
 * Get single disaster by ID
 */
export const getDisasterById = async (id) => {
  try {
    const doc = await disastersDb.get(id);
    return { success: true, data: doc };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Bulk save disasters
 */
export const bulkSaveDisasters = async (disasters) => {
  try {
    const docs = disasters.map(d => ({
      _id: d.id || `disaster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...d,
      _localTimestamp: new Date().toISOString(),
      _synced: true, // Mark as synced since these come from server
    }));
    
    const result = await disastersDb.bulkDocs(docs);
    return { success: true, results: result };
  } catch (error) {
    console.error('Bulk save failed:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// FIELD REPORT OPERATIONS
// ==========================================

/**
 * Create a new field report (works offline)
 */
export const createFieldReport = async (report) => {
  try {
    const doc = {
      _id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...report,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _synced: false,
      _localOnly: true,
    };
    
    const result = await reportsDb.put(doc);
    await addToSyncQueue('reports', doc._id, 'create');
    await updatePendingCount();
    
    return { success: true, id: result.id, data: doc };
  } catch (error) {
    console.error('Failed to create field report:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update field report
 */
export const updateFieldReport = async (id, updates) => {
  try {
    const doc = await reportsDb.get(id);
    const updatedDoc = {
      ...doc,
      ...updates,
      updatedAt: new Date().toISOString(),
      _synced: false,
    };
    
    const result = await reportsDb.put(updatedDoc);
    await addToSyncQueue('reports', id, 'update');
    
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Failed to update field report:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all field reports
 */
export const getFieldReports = async (options = {}) => {
  try {
    const { status, disasterId, limit = 100 } = options;
    
    const selector = {};
    if (status) selector.status = status;
    if (disasterId) selector.disasterId = disasterId;
    
    const result = await reportsDb.find({
      selector,
      limit,
      sort: [{ createdAt: 'desc' }]
    });
    
    return { success: true, data: result.docs };
  } catch (error) {
    try {
      const result = await reportsDb.allDocs({ include_docs: true });
      const docs = result.rows
        .map(row => row.doc)
        .filter(doc => !doc._id.startsWith('_'));
      return { success: true, data: docs };
    } catch (fallbackError) {
      return { success: false, data: [], error: fallbackError.message };
    }
  }
};

/**
 * Get pending (unsynced) field reports
 */
export const getPendingReports = async () => {
  try {
    const result = await reportsDb.find({
      selector: { _synced: false }
    });
    return { success: true, data: result.docs };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
};

// ==========================================
// ALERTS OPERATIONS
// ==========================================

/**
 * Save alert locally
 */
export const saveAlert = async (alert) => {
  try {
    const doc = {
      _id: alert.id || `alert_${Date.now()}`,
      ...alert,
      createdAt: alert.createdAt || new Date().toISOString(),
      read: false,
      _synced: true,
    };
    
    try {
      const existing = await alertsDb.get(doc._id);
      doc._rev = existing._rev;
    } catch (e) {
      // New document
    }
    
    const result = await alertsDb.put(doc);
    return { success: true, id: result.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get all alerts
 */
export const getAlerts = async (options = {}) => {
  try {
    const { unreadOnly = false, limit = 50 } = options;
    
    const selector = unreadOnly ? { read: false } : {};
    
    const result = await alertsDb.find({
      selector,
      limit,
      sort: [{ createdAt: 'desc' }]
    });
    
    return { success: true, data: result.docs };
  } catch (error) {
    try {
      const result = await alertsDb.allDocs({ include_docs: true });
      const docs = result.rows
        .map(row => row.doc)
        .filter(doc => !doc._id.startsWith('_'));
      return { success: true, data: docs };
    } catch (fallbackError) {
      return { success: false, data: [], error: fallbackError.message };
    }
  }
};

/**
 * Mark alert as read
 */
export const markAlertRead = async (id) => {
  try {
    const doc = await alertsDb.get(id);
    doc.read = true;
    doc.readAt = new Date().toISOString();
    await alertsDb.put(doc);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==========================================
// SYNC QUEUE OPERATIONS
// ==========================================

/**
 * Add item to sync queue
 */
const addToSyncQueue = async (collection, docId, operation) => {
  try {
    const queueItem = {
      _id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      collection,
      docId,
      operation,
      status: 'pending',
      createdAt: new Date().toISOString(),
      retries: 0,
      maxRetries: 3,
    };
    
    await queueDb.put(queueItem);
    await updatePendingCount();
  } catch (error) {
    console.error('Failed to add to sync queue:', error);
  }
};

/**
 * Get pending sync items
 */
const getPendingSyncItems = async () => {
  try {
    const result = await queueDb.find({
      selector: { status: 'pending' },
      sort: [{ createdAt: 'asc' }]
    });
    return result.docs;
  } catch (error) {
    const result = await queueDb.allDocs({ include_docs: true });
    return result.rows
      .map(row => row.doc)
      .filter(doc => doc.status === 'pending');
  }
};

/**
 * Update pending changes count
 */
const updatePendingCount = async () => {
  try {
    const items = await getPendingSyncItems();
    syncStatus.pendingChanges = items.length;
    notifyStatusChange();
  } catch (error) {
    console.error('Failed to update pending count:', error);
  }
};

/**
 * Mark sync item as completed
 */
const markSyncComplete = async (queueItemId) => {
  try {
    const doc = await queueDb.get(queueItemId);
    doc.status = 'completed';
    doc.completedAt = new Date().toISOString();
    await queueDb.put(doc);
    await updatePendingCount();
  } catch (error) {
    console.error('Failed to mark sync complete:', error);
  }
};

/**
 * Mark sync item as failed
 */
const markSyncFailed = async (queueItemId, error) => {
  try {
    const doc = await queueDb.get(queueItemId);
    doc.retries += 1;
    doc.lastError = error;
    doc.lastRetryAt = new Date().toISOString();
    
    if (doc.retries >= doc.maxRetries) {
      doc.status = 'failed';
    }
    
    await queueDb.put(doc);
    await updatePendingCount();
  } catch (err) {
    console.error('Failed to mark sync failed:', err);
  }
};

// ==========================================
// SYNCHRONIZATION
// ==========================================

/**
 * Sync a single item to remote server
 */
const syncItem = async (queueItem) => {
  const { collection, docId, operation } = queueItem;
  
  // Get the document from appropriate database
  let db;
  switch (collection) {
    case 'disasters': db = disastersDb; break;
    case 'reports': db = reportsDb; break;
    case 'alerts': db = alertsDb; break;
    default: return { success: false, error: 'Unknown collection' };
  }
  
  try {
    const doc = await db.get(docId);
    
    // In production, this would send to your REST API
    // For now, simulate successful sync
    console.log(`[Sync] ${operation} ${collection}/${docId}`);
    
    // Mark document as synced
    doc._synced = true;
    doc._syncedAt = new Date().toISOString();
    await db.put(doc);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Process sync queue
 */
export const processSyncQueue = async () => {
  if (!syncStatus.isOnline || syncStatus.syncInProgress) {
    return { success: false, reason: 'Offline or sync in progress' };
  }
  
  syncStatus.syncInProgress = true;
  notifyStatusChange();
  
  try {
    const pendingItems = await getPendingSyncItems();
    console.log(`[Sync] Processing ${pendingItems.length} pending items`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const item of pendingItems) {
      const result = await syncItem(item);
      
      if (result.success) {
        await markSyncComplete(item._id);
        successCount++;
      } else {
        await markSyncFailed(item._id, result.error);
        failCount++;
      }
    }
    
    syncStatus.lastSync = new Date().toISOString();
    syncStatus.syncInProgress = false;
    notifyStatusChange();
    
    console.log(`[Sync] Complete: ${successCount} success, ${failCount} failed`);
    return { success: true, synced: successCount, failed: failCount };
  } catch (error) {
    syncStatus.syncInProgress = false;
    notifyStatusChange();
    console.error('[Sync] Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Setup live replication with remote CouchDB (if configured)
 */
let replicationHandlers = [];

export const setupReplication = (remoteUrl) => {
  if (!remoteUrl) return;
  
  const databases = [
    { local: disastersDb, remote: `${remoteUrl}/disasters` },
    { local: reportsDb, remote: `${remoteUrl}/reports` },
    { local: alertsDb, remote: `${remoteUrl}/alerts` },
  ];
  
  databases.forEach(({ local, remote }) => {
    const remoteDb = new PouchDB(remote);
    
    // Bidirectional sync
    const handler = local.sync(remoteDb, {
      live: true,
      retry: true,
    })
    .on('change', (info) => {
      console.log('[Replication] Change:', info.direction, info.change.docs.length, 'docs');
      updatePendingCount();
    })
    .on('paused', (err) => {
      if (err) {
        console.log('[Replication] Paused due to error:', err);
      } else {
        console.log('[Replication] Paused - up to date');
      }
    })
    .on('active', () => {
      console.log('[Replication] Active');
    })
    .on('denied', (err) => {
      console.error('[Replication] Denied:', err);
    })
    .on('complete', (info) => {
      console.log('[Replication] Complete:', info);
    })
    .on('error', (err) => {
      console.error('[Replication] Error:', err);
    });
    
    replicationHandlers.push(handler);
  });
};

/**
 * Cancel all replications
 */
export const cancelReplication = () => {
  replicationHandlers.forEach(handler => handler.cancel());
  replicationHandlers = [];
};

// ==========================================
// CONNECTIVITY MONITORING
// ==========================================

/**
 * Handle online event
 */
const handleOnline = async () => {
  console.log('[Connectivity] Back online');
  syncStatus.isOnline = true;
  notifyStatusChange();
  
  // Automatically sync when connectivity is restored
  setTimeout(async () => {
    await processSyncQueue();
  }, 1000);
};

/**
 * Handle offline event
 */
const handleOffline = () => {
  console.log('[Connectivity] Went offline');
  syncStatus.isOnline = false;
  notifyStatusChange();
};

/**
 * Initialize connectivity monitoring
 */
export const initConnectivityMonitor = () => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Check initial status
  syncStatus.isOnline = navigator.onLine;
  notifyStatusChange();
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// ==========================================
// DATABASE UTILITIES
// ==========================================

/**
 * Clear all local data
 */
export const clearAllData = async () => {
  try {
    await disastersDb.destroy();
    await reportsDb.destroy();
    await alertsDb.destroy();
    await queueDb.destroy();
    console.log('All local data cleared');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get database stats
 */
export const getDatabaseStats = async () => {
  try {
    const [disasterInfo, reportInfo, alertInfo, queueInfo] = await Promise.all([
      disastersDb.info(),
      reportsDb.info(),
      alertsDb.info(),
      queueDb.info(),
    ]);
    
    return {
      disasters: disasterInfo.doc_count,
      reports: reportInfo.doc_count,
      alerts: alertInfo.doc_count,
      pendingSync: queueInfo.doc_count,
    };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Export all data for backup
 */
export const exportData = async () => {
  try {
    const [disasters, reports, alerts] = await Promise.all([
      disastersDb.allDocs({ include_docs: true }),
      reportsDb.allDocs({ include_docs: true }),
      alertsDb.allDocs({ include_docs: true }),
    ]);
    
    return {
      disasters: disasters.rows.map(r => r.doc).filter(d => !d._id.startsWith('_')),
      reports: reports.rows.map(r => r.doc).filter(d => !d._id.startsWith('_')),
      alerts: alerts.rows.map(r => r.doc).filter(d => !d._id.startsWith('_')),
      exportedAt: new Date().toISOString(),
    };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Initialize the offline database system
 */
export const initializeOfflineDb = async () => {
  try {
    await initializeIndexes();
    initConnectivityMonitor();
    await updatePendingCount();
    
    // Setup replication if configured
    if (REMOTE_COUCH_URL) {
      setupReplication(REMOTE_COUCH_URL);
    }
    
    console.log('PouchDB offline database initialized');
    return { success: true };
  } catch (error) {
    console.error('Failed to initialize offline database:', error);
    return { success: false, error: error.message };
  }
};

export default {
  // Initialization
  initializeOfflineDb,
  initConnectivityMonitor,
  
  // Disasters
  saveDisaster,
  getDisasters,
  getDisasterById,
  bulkSaveDisasters,
  
  // Field Reports
  createFieldReport,
  updateFieldReport,
  getFieldReports,
  getPendingReports,
  
  // Alerts
  saveAlert,
  getAlerts,
  markAlertRead,
  
  // Sync
  processSyncQueue,
  getSyncStatus,
  onSyncStatusChange,
  setupReplication,
  cancelReplication,
  
  // Utilities
  clearAllData,
  getDatabaseStats,
  exportData,
};
