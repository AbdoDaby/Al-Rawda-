import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';

const Settings = () => {
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
            // Need to import supabase and check connection
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

            if (window.confirm('This will upload all local products to the database. Continue?')) {
                const localProducts = settings.products || JSON.parse(localStorage.getItem('products') || '[]');

                // We need to clean IDs if they are timestamps (since Supabase generates IDs generally, 
                // OR we force them. Best to let Supabase generate new IDs for migration or upsert if we track UUIDs).
                // For simplicity: Insert and ignore ID conflict? Or remove ID?
                // Let's remove ID so Supabase generates unique Postgres IDs.

                const productsToUpload = localProducts.map(({ id, ...rest }) => rest);

                const { error } = await supabase.from('products').insert(productsToUpload);

                if (error) throw error;
                alert('Products synced successfully!');
            }
        } catch (err) {
            console.error(err);
            alert('Sync failed: ' + err.message);
        }
    };

    return (
        <div className="settings-page fade-in">
            <h2>System Settings</h2>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Merchant Name / Company Name</label>
                        <input
                            type="text"
                            value={formData.merchantName}
                            onChange={e => setFormData({ ...formData, merchantName: e.target.value })}
                            placeholder="Al Rawda Trading Company"
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            value={formData.merchantPhone}
                            onChange={e => setFormData({ ...formData, merchantPhone: e.target.value })}
                            placeholder="01xxxxxxxxx"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Save Settings</button>

                    {saved && <span className="success-message" style={{ marginLeft: '10px', color: '#10B981' }}>Settings Saved!</span>}
                </form>

                <hr style={{ margin: '2rem 0', borderColor: '#334155' }} />

                <h3>Data Management</h3>
                <p className="text-muted" style={{ marginBottom: '1rem' }}>
                    Upload your local products to the cloud database (Supabase).
                </p>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSync}
                >
                    ☁️ Sync Products to Cloud
                </button>
            </div>
        </div>
    );
};

export default Settings;
