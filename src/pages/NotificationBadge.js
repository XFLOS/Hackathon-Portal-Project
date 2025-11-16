import React, { useState, useEffect } from 'react';
import './NotificationBadge.css';

const fetchUnreadNotifications = (role) => {
    const mockData = {
        Student: 3,
        Mentor: 1,
        Judge: 0,
        Coordinator: 5 
    };
    return mockData[role] || 0;
};

export default function NotificationBadge({ role }) {
    const [count, setCount] = useState(0);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        setCount(fetchUnreadNotifications(role));
        
        const interval = setInterval(() => {
            setCount(fetchUnreadNotifications(role));
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [role]);

    const handleClick = () => {

        if (count > 0) {
            alert(`Opening Notification Center for ${role}. ${count} unread messages cleared.`);
            setCount(0);
        } else {
            alert(`No new notifications for ${role}.`);
        }
    };

    if (count === 0) return null;

    return (
        <div 
            className="notification-badge" 
            onClick={handleClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <span className="notification-icon">💬</span>
            <span className="notification-count">{count}</span>
            {showTooltip && (
                <div className="notification-tooltip">
                    You have {count} unread system messages or announcements.
                </div>
            )}
        </div>
    );
}