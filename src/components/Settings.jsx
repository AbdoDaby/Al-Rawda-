import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../contexts/StoreContext';

const Settings = () => {
    const { t } = useTranslation();
    const { settings, setSettings } = useStore();
    const [formData, setFormData] = useState(settings);
    const [saved, setSaved] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSettings(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleSync = async () => {
        try {
            const { supabase } = await import('../supabaseClient');
            if (!supabase) {
                alert('Supabase client not configured. Please check your .env file.');
                return;
            }

            const { data: d, error: e } = await supabase.from('products').select('id').limit(1);
            if (e) {
                alert('Connection failed: ' + e.message);
                return;
            }

            if (window.confirm(t('settings.syncConfirm'))) {
                const localProducts = JSON.parse(localStorage.getItem('products') || '[]');

                // Use the store's addProduct for each item to ensure robust sync and deduplication
                for (const product of localProducts) {
                    await addProduct(product);
                }

                alert(t('settings.syncSuccess'));
            }
        } catch (err) {
            console.error(err);
            alert(t('settings.syncFail') + err.message);
        }
    };

    return (
        <div className="settings-page fade-in">
            <h2>{t('settings.title')}</h2>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('settings.merchantName')}</label>
                        <input
                            type="text"
                            value={formData.merchantName}
                            onChange={e => setFormData({ ...formData, merchantName: e.target.value })}
                            placeholder="Al Rawda Trading Company"
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('settings.phoneNumber')}</label>
                        <input
                            type="text"
                            value={formData.merchantPhone}
                            onChange={e => setFormData({ ...formData, merchantPhone: e.target.value })}
                            placeholder="01xxxxxxxxx"
                        />
                    </div>

                    <hr className="my-4 border-gray-700" style={{ margin: '1rem 0', borderColor: '#334155' }} />
                    <h3>{t('settings.telegramTitle')}</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {t('settings.telegramDesc')}
                    </p>

                    <div className="form-group">
                        <label>{t('settings.botToken')}</label>
                        <input
                            type="password"
                            value={formData.telegramBotToken || ''}
                            onChange={e => setFormData({ ...formData, telegramBotToken: e.target.value })}
                            placeholder="123456789:ABCdef..."
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('settings.chatId')}</label>
                        <input
                            type="text"
                            value={formData.telegramChatId || ''}
                            onChange={e => setFormData({ ...formData, telegramChatId: e.target.value })}
                            placeholder="123456789"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">{t('settings.saveSettings')}</button>

                    {saved && <span className="success-message" style={{ marginLeft: '10px', color: '#10B981' }}>{t('settings.settingsSaved')}</span>}
                </form>

                <hr style={{ margin: '2rem 0', borderColor: '#334155' }} />

                <h3>{t('settings.dataManagement')}</h3>
                <p className="text-muted" style={{ marginBottom: '1rem' }}>
                    {t('settings.syncDesc')}
                </p>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSync}
                >
                    {t('settings.syncBtn')}
                </button>
            </div>
        </div>
    );
};

export default Settings;
