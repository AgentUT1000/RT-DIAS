import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BackgroundAnimation } from './BackgroundAnimation';
import { DisasterCards } from './DisasterCards';
import { DisasterDetail } from './DisasterDetail';
import KafkaStatus from './KafkaStatus';
import LiveEventFeed from './LiveEventFeed';

export const Layout = () => {
    const [selectedDisaster, setSelectedDisaster] = useState(null);
    const [showLiveFeed, setShowLiveFeed] = useState(false);

    return (
        <div className="app-container">
            <BackgroundAnimation />

            <Sidebar />

            <div className="main-content">
                <Header />

                <main className="content-area">
                    <KafkaStatus />
                    
                    <div className="view-toggle">
                        <button 
                            className={!showLiveFeed ? 'active' : ''} 
                            onClick={() => setShowLiveFeed(false)}
                        >
                            📊 Dashboard
                        </button>
                        <button 
                            className={showLiveFeed ? 'active' : ''} 
                            onClick={() => setShowLiveFeed(true)}
                        >
                            📡 Live Kafka Feed
                        </button>
                    </div>

                    {showLiveFeed ? (
                        <LiveEventFeed />
                    ) : !selectedDisaster ? (
                        <DisasterCards onSelect={setSelectedDisaster} />
                    ) : (
                        <DisasterDetail
                            data={selectedDisaster}
                            onBack={() => setSelectedDisaster(null)}
                        />
                    )}
                </main>
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
