import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { t } = useTranslation();

    const menuItems = [
        { id: 'pos', icon: '🛒', label: t('sidebar.pos') },
        { id: 'orders', icon: '📜', label: t('sidebar.orders') },
        { id: 'products', icon: '📦', label: t('sidebar.products') },
        { id: 'analytics', icon: '📊', label: t('sidebar.analytics') },
        { id: 'settings', icon: '⚙️', label: t('sidebar.settings') },
    ];

    return (
        <aside className="sidebar">
            <div className="logoarea text-center" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{t('sidebar.title')}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{t('sidebar.subtitle')}</p>
            </div>
            <nav style={{ flex: 1 }}>
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
            <LanguageSwitcher />
        </aside>
    );
};

export default Sidebar;
