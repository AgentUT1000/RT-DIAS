import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const SettingsView = () => {
    const { user, updateUserPreferences, addSavedLocation, removeSavedLocation, logout } = useAuth();
    const [newLocation, setNewLocation] = useState('');
    const [activeTab, setActiveTab] = useState('profile');

    const handleAddLocation = (e) => {
        e.preventDefault();
        if (newLocation.trim()) {
            addSavedLocation(newLocation.trim());
            setNewLocation('');
        }
    };

    const handleToggle = (key) => {
        updateUserPreferences({ [key]: !user.preferences[key] });
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2 className="settings-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Settings
                </h2>
            </div>

            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </button>
                <button
                    className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Notifications
                </button>
                <button
                    className={`settings-tab ${activeTab === 'locations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('locations')}
                >
                    Saved Locations
                </button>
                <button
                    className={`settings-tab ${activeTab === 'emergency' ? 'active' : ''}`}
                    onClick={() => setActiveTab('emergency')}
                >
                    Emergency Contacts
                </button>
            </div>

            <div className="settings-content">
                {activeTab === 'profile' && (
                    <div className="settings-section">
                        <div className="profile-card">
                            <div className="profile-avatar">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="profile-info">
                                <h3>{user?.name}</h3>
                                <p>{user?.email}</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" value={user?.name || ''} readOnly />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={user?.email || ''} readOnly />
                        </div>

                        <button className="btn-danger" onClick={logout}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                        </button>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="settings-section">
                        <div className="toggle-row">
                            <div className="toggle-info">
                                <h4>Push Notifications</h4>
                                <p>Receive alerts for disasters in your saved locations</p>
                            </div>
                            <button
                                className={`toggle-switch ${user?.preferences?.notifications ? 'active' : ''}`}
                                onClick={() => handleToggle('notifications')}
                            >
                                <span className="toggle-knob"></span>
                            </button>
                        </div>

                        <div className="toggle-row">
                            <div className="toggle-info">
                                <h4>Alert Sounds</h4>
                                <p>Play sound for critical alerts</p>
                            </div>
                            <button
                                className={`toggle-switch ${user?.preferences?.alertSound ? 'active' : ''}`}
                                onClick={() => handleToggle('alertSound')}
                            >
                                <span className="toggle-knob"></span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'locations' && (
                    <div className="settings-section">
                        <form onSubmit={handleAddLocation} className="add-location-form">
                            <input
                                type="text"
                                placeholder="Add a location (e.g., Mumbai, Chennai)"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                            />
                            <button type="submit" className="btn-primary">Add</button>
                        </form>

                        <div className="locations-list">
                            {user?.savedLocations?.length > 0 ? (
                                user.savedLocations.map((location, index) => (
                                    <div key={index} className="location-item">
                                        <span className="location-icon">📍</span>
                                        <span className="location-name">{location}</span>
                                        <button
                                            className="location-remove"
                                            onClick={() => removeSavedLocation(location)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state">No saved locations. Add locations to receive targeted alerts.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'emergency' && (
                    <div className="settings-section">
                        <div className="emergency-contacts">
                            {user?.emergencyContacts?.map((contact, index) => (
                                <div key={index} className="contact-card">
                                    <div className="contact-icon">📞</div>
                                    <div className="contact-info">
                                        <h4>{contact.name}</h4>
                                        <p>{contact.phone}</p>
                                    </div>
                                    <button className="contact-call">Call</button>
                                </div>
                            ))}
                        </div>

                        <div className="emergency-numbers">
                            <h4>National Emergency Numbers</h4>
                            <div className="number-grid">
                                <div className="number-item">
                                    <span className="number">112</span>
                                    <span className="label">Emergency</span>
                                </div>
                                <div className="number-item">
                                    <span className="number">100</span>
                                    <span className="label">Police</span>
                                </div>
                                <div className="number-item">
                                    <span className="number">101</span>
                                    <span className="label">Fire</span>
                                </div>
                                <div className="number-item">
                                    <span className="number">108</span>
                                    <span className="label">Ambulance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
