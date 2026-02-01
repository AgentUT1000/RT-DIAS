// Time formatting helpers
export const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

export const formatDateTime = (date) => {
    const d = new Date(date);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(-2);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');

    return `${days[d.getDay()]}, ${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

// Severity helpers
export const getSeverityColor = (severity) => {
    switch (severity) {
        case 'critical':
            return '#ef4444'; // red
        case 'high':
            return '#f97316'; // orange
        case 'medium':
            return '#eab308'; // yellow
        case 'low':
            return '#22c55e'; // green
        default:
            return '#64748b'; // gray
    }
};

export const getSeverityLabel = (severity) => {
    switch (severity) {
        case 'critical':
            return 'CRITICAL';
        case 'high':
            return 'HIGH';
        case 'medium':
            return 'MEDIUM';
        case 'low':
            return 'LOW';
        default:
            return 'UNKNOWN';
    }
};

// Disaster type icons
export const getDisasterIcon = (type) => {
    switch (type.toLowerCase()) {
        case 'earthquake':
            return '🌍';
        case 'landslide':
            return '⛰️';
        case 'flood':
            return '🌊';
        case 'cyclone':
            return '🌀';
        case 'wildfire':
            return '🔥';
        case 'tsunami':
            return '🌊';
        default:
            return '⚠️';
    }
};

// Format numbers with commas
export const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Validate email
export const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
