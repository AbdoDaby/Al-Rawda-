import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'pos', icon: '🛒', label: 'Point of Sale' },
        { id: 'orders', icon: '📜', label: 'Order History' },
        { id: 'products', icon: '📦', label: 'Products' },
        { id: 'analytics', icon: '📊', label: 'Sales & Profit' },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
    ];

    return (
        <aside className="sidebar">
            <div className="logo-area">
                <h1>Al Rawda</h1>
                <p>Trading Company</p>
            </div>
            <nav>
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
