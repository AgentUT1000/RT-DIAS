/**
 * Sync Status Indicator Component
 * Shows connectivity and sync status with offline data info
 */

import { useState } from 'react';
import { useSyncStatus, useDatabaseStats, useDataExport, usePendingReports } from '../hooks/useOfflineDb';

const SyncStatusIndicator = () => {
  const { isOnline, lastSync, pendingChanges, syncInProgress, triggerSync } = useSyncStatus();
  const { stats } = useDatabaseStats();
  const { exportAllData, exporting } = useDataExport();
  const { reports: pendingReports } = usePendingReports();
  const [expanded, setExpanded] = useState(false);

  const formatLastSync = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleSync = async () => {
    if (!isOnline || syncInProgress) return;
    await triggerSync();
  };

  return (
    <div className="sync-status-container">
      {/* Compact Indicator */}
      <button 
        className={`sync-status-btn ${isOnline ? 'online' : 'offline'} ${pendingChanges > 0 ? 'has-pending' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
        <span className="status-text">
          {isOnline ? 'Online' : 'Offline'}
        </span>
        {pendingChanges > 0 && (
          <span className="pending-badge">{pendingChanges}</span>
        )}
        <svg 
          className={`expand-icon ${expanded ? 'expanded' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Expanded Panel */}
      {expanded && (
        <div className="sync-panel">
          <div className="sync-panel-header">
            <h4>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"></path>
              </svg>
              Sync Status
            </h4>
            <button className="close-btn" onClick={() => setExpanded(false)}>×</button>
          </div>

          <div className="sync-panel-body">
            {/* Connection Status */}
            <div className="sync-section">
              <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                <div className="connection-icon">
                  {isOnline ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                      <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                      <circle cx="12" cy="20" r="1"></circle>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                      <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                      <circle cx="12" cy="20" r="1"></circle>
                    </svg>
                  )}
                </div>
                <div className="connection-info">
                  <span className="connection-label">{isOnline ? 'Connected' : 'No Connection'}</span>
                  <span className="connection-desc">
                    {isOnline 
                      ? 'Data will sync automatically' 
                      : 'Changes saved locally'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Changes */}
            {pendingChanges > 0 && (
              <div className="sync-section pending-section">
                <div className="pending-info">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <div>
                    <span className="pending-count">{pendingChanges} pending change{pendingChanges > 1 ? 's' : ''}</span>
                    <span className="pending-desc">Waiting to sync</span>
                  </div>
                </div>
                {isOnline && (
                  <button 
                    className="sync-now-btn" 
                    onClick={handleSync}
                    disabled={syncInProgress}
                  >
                    {syncInProgress ? (
                      <>
                        <span className="spinner"></span>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 2v6h-6"></path>
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                          <path d="M3 22v-6h6"></path>
                          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                        </svg>
                        Sync Now
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Last Sync */}
            <div className="sync-section">
              <div className="last-sync-info">
                <span className="sync-label">Last synchronized</span>
                <span className="sync-time">{formatLastSync(lastSync)}</span>
              </div>
            </div>

            {/* Database Stats */}
            {stats && (
              <div className="sync-section stats-section">
                <h5>Local Data</h5>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <span className="stat-value">{stats.disasters || 0}</span>
                    <span className="stat-name">Disasters</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📝</span>
                    <span className="stat-value">{stats.reports || 0}</span>
                    <span className="stat-name">Reports</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🔔</span>
                    <span className="stat-value">{stats.alerts || 0}</span>
                    <span className="stat-name">Alerts</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏳</span>
                    <span className="stat-value">{stats.pendingSync || 0}</span>
                    <span className="stat-name">Queue</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Reports */}
            {pendingReports.length > 0 && (
              <div className="sync-section">
                <h5>Pending Field Reports</h5>
                <div className="pending-reports-list">
                  {pendingReports.slice(0, 3).map((report) => (
                    <div key={report._id} className="pending-report-item">
                      <span className="report-type">{report.type || 'Report'}</span>
                      <span className="report-time">
                        {new Date(report.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {pendingReports.length > 3 && (
                    <span className="more-reports">
                      +{pendingReports.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="sync-actions">
              <button 
                className="action-btn export-btn"
                onClick={exportAllData}
                disabled={exporting}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                {exporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncStatusIndicator;
