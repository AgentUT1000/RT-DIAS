import { useState, useEffect } from 'react';

export const Header = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatDate = (date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear().toString().slice(-2);
        const h = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        const s = date.getSeconds().toString().padStart(2, '0');

        return `${days[date.getDay()]}, ${d}-${m}-${y} ${h}:${min}:${s}`;
    };

    return (
        <header className="header">
            <div className="status-indicator">
                <div className="status-dot"></div>
                <span className="status-text">System Online</span>
            </div>

            <div className="header-title">RT - DIAS</div>

            <div className="header-time">
                {formatDate(time)}
            </div>
        </header>
    );
};
