import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BackgroundAnimation } from './BackgroundAnimation';
import { DisasterCards } from './DisasterCards';
import { DisasterDetail } from './DisasterDetail';
import { DisasterMap } from './DisasterMap';
import { AlertsView } from './AlertsView';
import { SettingsView } from './SettingsView';
import NewsPanel from './NewsPanel';
import GdeltEventsPanel from './GdeltEventsPanel';
import HotspotDashboard from './HotspotDashboard';
import { useApp } from '../context/AppContext';

export const Layout = () => {
    const { currentView, selectedDisaster, setSelectedDisaster, notifications, removeNotification } = useApp();

    const renderContent = () => {
        // If a disaster is selected from dashboard, show detail view
        if (selectedDisaster && currentView === 'dashboard') {
            return (
                <DisasterDetail
                    data={selectedDisaster}
                    onBack={() => setSelectedDisaster(null)}
                />
            );
        }

        switch (currentView) {
            case 'dashboard':
                return <DisasterCards />;
            case 'map':
                return <DisasterMap />;
            case 'hotspots':
                return <HotspotDashboard />;
            case 'alerts':
                return <AlertsView />;
            case 'news':
                return <NewsPanel />;
            case 'gdelt':
                return <GdeltEventsPanel />;
            case 'settings':
                return <SettingsView />;
            default:
                return <DisasterCards />;
        }
    };

    return (
        <div className="app-container">
            <BackgroundAnimation />

            <Sidebar />

            <div className="main-content">
                <Header />

                <main className="content-area">
                    {renderContent()}
                </main>
            </div>

            {/* Notifications Toast */}
            <div className="notifications-container">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`notification-toast ${notification.type || 'info'}`}
                    >
                        <span className="notification-message">{notification.message}</span>
                        <button
                            className="notification-close"
                            onClick={() => removeNotification(notification.id)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <div className="connection-status">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
            </div>
        </div>
    );
};
