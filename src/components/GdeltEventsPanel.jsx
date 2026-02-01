import { useState, useEffect, useCallback } from 'react';
import {
  fetchDisasterByType,
  GDELT_DISASTER_TYPES,
  TIME_SPANS,
  SOURCE_REGIONS,
  filterArticlesByCountry,
} from '../services/gdeltApi';

const GdeltEventsPanel = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeSpan, setTimeSpan] = useState('24h');
  const [sourceRegion, setSourceRegion] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list, grid

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use unified function that handles all combinations
      const result = await fetchDisasterByType(activeFilter, timeSpan, sourceRegion);

      if (result.success) {
        // Apply client-side filtering for more accurate region results
        let filteredArticles = result.articles;
        if (sourceRegion) {
          filteredArticles = filterArticlesByCountry(result.articles, sourceRegion);
        }
        setArticles(filteredArticles);
        
        // Show message if no results after filtering
        if (filteredArticles.length === 0 && result.articles.length > 0) {
          setError(null); // Clear error, just show empty state
        }
      } else {
        setError(result.error || 'Failed to load events');
      }
    } catch (err) {
      console.error('GDELT load error:', err);
      setError('Failed to connect to GDELT');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, timeSpan, sourceRegion]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    try {
      // GDELT date format: YYYYMMDDHHMMSS
      if (dateStr.length === 14) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(8, 10);
        const min = dateStr.substring(10, 12);
        const date = new Date(`${year}-${month}-${day}T${hour}:${min}:00`);
        return date.toLocaleString();
      }
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      let date;
      if (dateStr.length === 14) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(8, 10);
        const min = dateStr.substring(10, 12);
        date = new Date(`${year}-${month}-${day}T${hour}:${min}:00`);
      } else {
        date = new Date(dateStr);
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const getToneColor = (tone) => {
    if (!tone) return 'var(--text-muted)';
    const toneNum = parseFloat(tone);
    if (toneNum < -3) return '#ef4444'; // Very negative
    if (toneNum < 0) return '#f97316';  // Negative
    if (toneNum < 3) return '#eab308';  // Neutral
    return '#22c55e';                    // Positive
  };

  const getToneLabel = (tone) => {
    if (!tone) return 'Neutral';
    const toneNum = parseFloat(tone);
    if (toneNum < -3) return 'Critical';
    if (toneNum < 0) return 'Negative';
    if (toneNum < 3) return 'Neutral';
    return 'Positive';
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Source';
    }
  };

  return (
    <div className="gdelt-panel">
      <div className="gdelt-header">
        <div className="gdelt-title-row">
          <h2 className="gdelt-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Global Event Tracker
          </h2>
          <div className="gdelt-badge">
            <span className="live-indicator"></span>
            GDELT Project
          </div>
        </div>
        <p className="gdelt-subtitle">Real-time worldwide disaster monitoring from 100+ languages</p>

        <div className="gdelt-controls">
          <div className="control-group">
            <label>Time Range</label>
            <select 
              value={timeSpan} 
              onChange={(e) => setTimeSpan(e.target.value)}
              className="gdelt-select"
            >
              {TIME_SPANS.map((span) => (
                <option key={span.value} value={span.value}>
                  {span.label}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Region</label>
            <select 
              value={sourceRegion} 
              onChange={(e) => setSourceRegion(e.target.value)}
              className="gdelt-select"
            >
              {SOURCE_REGIONS.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.flag} {region.label}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>View</label>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="gdelt-filters">
        {GDELT_DISASTER_TYPES.slice(0, 8).map((type) => (
          <button
            key={type.id}
            className={`gdelt-filter-btn ${activeFilter === type.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(type.id)}
          >
            <span className="filter-icon">{type.icon}</span>
            <span className="filter-label">{type.label}</span>
          </button>
        ))}
      </div>

      <div className="gdelt-content">
        {loading ? (
          <div className="gdelt-loading">
            <div className="globe-loader">
              <div className="globe"></div>
              <div className="orbit"></div>
            </div>
            <p>Scanning global news sources...</p>
          </div>
        ) : error ? (
          <div className="gdelt-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4"/>
              <path d="M12 16h.01"/>
            </svg>
            <p>{error}</p>
            <button className="retry-btn" onClick={loadEvents}>
              Try Again
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="gdelt-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12h8"/>
            </svg>
            <p>No events found</p>
            <span>Try adjusting filters or time range</span>
          </div>
        ) : (
          <>
            <div className="gdelt-stats-bar">
              <div className="stat-item">
                <span className="stat-value">{articles.length}</span>
                <span className="stat-label">Events Found</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{new Set(articles.map(a => a.sourcecountry).filter(Boolean)).size}</span>
                <span className="stat-label">Countries</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{new Set(articles.map(a => a.language).filter(Boolean)).size}</span>
                <span className="stat-label">Languages</span>
              </div>
            </div>

            <div className={`gdelt-articles ${viewMode}`}>
              {articles.map((article, index) => (
                <article key={article.url || index} className="gdelt-article-card">
                  {article.socialimage && viewMode === 'grid' && (
                    <div className="article-thumbnail">
                      <img 
                        src={article.socialimage} 
                        alt=""
                        onError={(e) => e.target.parentElement.style.display = 'none'}
                      />
                    </div>
                  )}
                  <div className="article-body">
                    <div className="article-meta-row">
                      <span className="article-source">{getDomain(article.url)}</span>
                      <span className="article-time">{formatTimeAgo(article.seendate)}</span>
                      {article.tone && (
                        <span 
                          className="article-tone"
                          style={{ color: getToneColor(article.tone) }}
                        >
                          {getToneLabel(article.tone)}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="article-title">
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                    </h3>

                    <div className="article-details">
                      {article.sourcecountry && (
                        <span className="detail-tag country">
                          📍 {article.sourcecountry}
                        </span>
                      )}
                      {article.language && (
                        <span className="detail-tag lang">
                          🌐 {article.language.toUpperCase()}
                        </span>
                      )}
                      {article.domain && (
                        <span className="detail-tag domain">
                          {article.domain}
                        </span>
                      )}
                    </div>

                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="read-more"
                    >
                      Read Full Article
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="gdelt-footer">
        <button className="refresh-btn" onClick={loadEvents} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          Refresh
        </button>
        <span className="footer-info">
          Powered by GDELT Project • Updates every 15 minutes
        </span>
      </div>
    </div>
  );
};

export default GdeltEventsPanel;
