import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock users database
const MOCK_USERS = [
    {
        id: '1',
        email: 'demo@rtdias.com',
        password: 'demo123',
        name: 'Demo User',
        savedLocations: ['Uttarakhand', 'Delhi'],
        emergencyContacts: [
            { name: 'Emergency Services', phone: '112' },
            { name: 'NDRF Helpline', phone: '011-24363260' }
        ],
        preferences: {
            notifications: true,
            alertSound: true,
            theme: 'dark'
        }
    }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved session
        const savedUser = localStorage.getItem('rtdias_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const foundUser = MOCK_USERS.find(
            u => u.email === email && u.password === password
        );

        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            localStorage.setItem('rtdias_user', JSON.stringify(userWithoutPassword));
            return { success: true };
        }

        return { success: false, error: 'Invalid email or password' };
    };

    const signup = async (name, email, password) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Check if user exists
        if (MOCK_USERS.find(u => u.email === email)) {
            return { success: false, error: 'Email already registered' };
        }

        const newUser = {
            id: Date.now().toString(),
            email,
            name,
            savedLocations: [],
            emergencyContacts: [],
            preferences: {
                notifications: true,
                alertSound: true,
                theme: 'dark'
            }
        };

        setUser(newUser);
        localStorage.setItem('rtdias_user', JSON.stringify(newUser));
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('rtdias_user');
    };

    const updateUserPreferences = (preferences) => {
        const updatedUser = { ...user, preferences: { ...user.preferences, ...preferences } };
        setUser(updatedUser);
        localStorage.setItem('rtdias_user', JSON.stringify(updatedUser));
    };

    const addSavedLocation = (location) => {
        if (!user.savedLocations.includes(location)) {
            const updatedUser = {
                ...user,
                savedLocations: [...user.savedLocations, location]
            };
            setUser(updatedUser);
            localStorage.setItem('rtdias_user', JSON.stringify(updatedUser));
        }
    };

    const removeSavedLocation = (location) => {
        const updatedUser = {
            ...user,
            savedLocations: user.savedLocations.filter(l => l !== location)
        };
        setUser(updatedUser);
        localStorage.setItem('rtdias_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            signup,
            logout,
            updateUserPreferences,
            addSavedLocation,
            removeSavedLocation
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
