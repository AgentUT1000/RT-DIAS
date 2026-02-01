import { useState, useEffect, useCallback } from 'react';
import { 
  fetchDisasterNews, 
  fetchBreakingNews, 
  searchNews,
  DISASTER_TYPES 
} from '../services/newsApi';

const NewsPanel = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const loadNews = useCallback(async (disasterType = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = disasterType === 'all' 
        ? await fetchBreakingNews()
        : await fetchDisasterNews(disasterType);
      
      if (result.success) {
        setArticles(result.articles);
      } else {
        setError(result.error || 'Failed to load news');
      }
    } catch (err) {
      setError('Failed to connect to news service');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setLoading(true);
    setError(null);
    
    try {
      const result = await searchNews(searchQuery);
      if (result.success) {
        setArticles(result.articles);
      } else {
        setError(result.error || 'Search failed');
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    loadNews(activeFilter);
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setIsSearching(false);
    setSearchQuery('');
    loadNews(filterId);
  };

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="news-panel">
      <div className="news-panel-header">
        <div className="news-title-row">
          <h2 className="news-panel-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
              <path d="M18 14h-8"/>
              <path d="M15 18h-5"/>
              <path d="M10 6h8v4h-8V6Z"/>
            </svg>
            Live News Feed
          </h2>
          <span className="news-source-badge">
            <span className="live-dot"></span>
            newsdata.io
          </span>
        </div>
        
        <form className="news-search-form" onSubmit={handleSearch}>
          <div className="news-search-input-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="news-search-input"
            />
            {isSearching && (
              <button type="button" className="search-clear-btn" onClick={clearSearch}>
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="news-search-btn">Search</button>
        </form>
      </div>

      <div className="news-filters">
        {DISASTER_TYPES.map((type) => (
          <button
            key={type.id}
            className={`news-filter-btn ${activeFilter === type.id && !isSearching ? 'active' : ''}`}
            onClick={() => handleFilterChange(type.id)}
          >
            <span className="filter-icon">{type.icon}</span>
            <span className="filter-label">{type.label}</span>
          </button>
        ))}
      </div>

      <div className="news-content">
        {loading ? (
          <div className="news-loading">
            <div className="news-loading-spinner"></div>
            <p>Fetching latest news...</p>
          </div>
        ) : error ? (
          <div className="news-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4"/>
              <path d="M12 16h.01"/>
            </svg>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => loadNews(activeFilter)}>
              Try Again
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="news-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
            </svg>
            <p>No news articles found</p>
            <span>Try a different search or filter</span>
          </div>
        ) : (
          <div className="news-articles-list">
            {articles.map((article, index) => (
              <article key={article.article_id || index} className="news-article-card">
                {article.image_url && (
                  <div className="article-image">
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="article-content">
                  <div className="article-meta">
                    {article.source_name && (
                      <span className="article-source">{article.source_name}</span>
                    )}
                    <span className="article-time">{formatTimeAgo(article.pubDate)}</span>
                  </div>
                  <h3 className="article-title">
                    <a href={article.link} target="_blank" rel="noopener noreferrer">
                      {article.title}
                    </a>
                  </h3>
                  {article.description && (
                    <p className="article-description">
                      {truncateText(article.description)}
                    </p>
                  )}
                  <div className="article-footer">
                    {article.category && article.category.length > 0 && (
                      <div className="article-categories">
                        {article.category.slice(0, 2).map((cat, i) => (
                          <span key={i} className="category-tag">{cat}</span>
                        ))}
                      </div>
                    )}
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="read-more-link"
                    >
                      Read more
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7"/>
                        <path d="M7 7h10v10"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="news-panel-footer">
        <button className="refresh-news-btn" onClick={() => loadNews(activeFilter)} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          Refresh
        </button>
        <span className="news-count">{articles.length} articles</span>
      </div>
    </div>
  );
};

export default NewsPanel;
