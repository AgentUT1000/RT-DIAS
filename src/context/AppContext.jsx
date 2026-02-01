import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

// Mock disaster data with more details
export const MOCK_DISASTERS = [
    {
        id: 1,
        type: 'Landslide',
        location: 'Uttarakhand',
        district: 'Chamoli',
        coordinates: { lat: 30.37, lng: 79.31 },
        severity: 'critical',
        severityIndex: 8.5,
        affectedPopulation: 12500,
        reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
        status: 'active',
        stats: {
            temp: '8°C',
            wind: '45 km/h',
            visibility: '1.2 km',
            pressure: '1004 hPa'
        },
        description: 'Major landslide reported near Chamoli tunnel. Multiple roads blocked.'
    },
    {
        id: 2,
        type: 'Earthquake',
        location: 'Delhi',
        district: 'Central Delhi',
        coordinates: { lat: 28.6139, lng: 77.2090 },
        severity: 'high',
        severityIndex: 6.2,
        affectedPopulation: 45000,
        reportedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        lastUpdate: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
        status: 'active',
        stats: {
            temp: '22°C',
            wind: '12 km/h',
            visibility: '8 km',
            pressure: '1012 hPa'
        },
        description: 'Earthquake of magnitude 6.2 felt across NCR region. Aftershocks expected.'
    },
    {
        id: 3,
        type: 'Flood',
        location: 'Kerala',
        district: 'Wayanad',
        coordinates: { lat: 11.6854, lng: 76.1320 },
        severity: 'high',
        severityIndex: 7.1,
        affectedPopulation: 28000,
        reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        lastUpdate: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
        status: 'active',
        stats: {
            temp: '26°C',
            wind: '35 km/h',
            visibility: '3 km',
            pressure: '998 hPa'
        },
        description: 'Heavy flooding due to continuous rainfall. Multiple villages affected.'
    },
    {
        id: 4,
        type: 'Cyclone',
        location: 'Odisha',
        district: 'Puri',
        coordinates: { lat: 19.8135, lng: 85.8312 },
        severity: 'critical',
        severityIndex: 9.0,
        affectedPopulation: 85000,
        reportedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        lastUpdate: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
        status: 'active',
        stats: {
            temp: '28°C',
            wind: '180 km/h',
            visibility: '0.5 km',
            pressure: '965 hPa'
        },
        description: 'Severe cyclonic storm approaching coast. Evacuation in progress.'
    },
    {
        id: 5,
        type: 'Wildfire',
        location: 'Himachal Pradesh',
        district: 'Kullu',
        coordinates: { lat: 31.9579, lng: 77.1095 },
        severity: 'medium',
        severityIndex: 5.5,
        affectedPopulation: 3500,
        reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        lastUpdate: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        status: 'contained',
        stats: {
            temp: '32°C',
            wind: '25 km/h',
            visibility: '2 km',
            pressure: '1008 hPa'
        },
        description: 'Forest fire in Kullu region. Fire crews actively working on containment.'
    }
];

export const MOCK_ALERTS = [
    {
        id: 1,
        type: 'critical',
        title: 'Cyclone Warning',
        message: 'Severe cyclonic storm expected to make landfall in 6 hours',
        location: 'Odisha Coast',
        timestamp: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
        id: 2,
        type: 'warning',
        title: 'Aftershock Alert',
        message: 'Multiple aftershocks expected in the next 24 hours',
        location: 'Delhi NCR',
        timestamp: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
        id: 3,
        type: 'info',
        title: 'Road Closure',
        message: 'NH-7 closed due to landslide debris. Use alternate routes.',
        location: 'Uttarakhand',
        timestamp: new Date(Date.now() - 45 * 60 * 1000)
    }
];

export const AppProvider = ({ children }) => {
    const [disasters, setDisasters] = useState(MOCK_DISASTERS);
    const [alerts, setAlerts] = useState(MOCK_ALERTS);
    const [selectedDisaster, setSelectedDisaster] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard'); // dashboard, map, alerts, settings
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notification) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { ...notification, id }]);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getDisastersByLocation = (location) => {
        return disasters.filter(d => 
            d.location.toLowerCase().includes(location.toLowerCase())
        );
    };

    const getDisastersBySeverity = (severity) => {
        return disasters.filter(d => d.severity === severity);
    };

    return (
        <AppContext.Provider value={{
            disasters,
            alerts,
            selectedDisaster,
            setSelectedDisaster,
            currentView,
            setCurrentView,
            notifications,
            addNotification,
            removeNotification,
            getDisastersByLocation,
            getDisastersBySeverity
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
