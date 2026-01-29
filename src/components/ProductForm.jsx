import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ProductForm = ({ onSave, initialData, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        price: '',
        cost: '',
        stock: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                code: initialData.code || '',
                is_active: initialData.is_active !== undefined ? initialData.is_active : true
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;
        onSave({
            ...formData,
            price: parseFloat(formData.price),
            cost: parseFloat(formData.cost) || 0,
            stock: parseInt(formData.stock) || 0,
            is_active: formData.is_active
        });
        setFormData({ name: '', code: '', price: '', cost: '', stock: '', description: '', is_active: true });
    };

    return (
        <div className="card product-form">
            <h3>{initialData ? t('products.editProduct') : t('products.addNew')}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>{t('products.name')}</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Premium Dates"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>{t('products.code')}</label>
                    <input
                        type="text"
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        placeholder="Barcode / SKU"
                    />
                </div>
                <div className="form-group">
                    <label>{t('products.price')}</label>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>{t('products.cost')}</label>
                    <input
                        type="number"
                        value={formData.cost}
                        onChange={e => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                    />
                </div>
                <div className="form-group">
                    <label>{t('products.stock')}</label>
                    <input
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="e.g. 50"
                    />
                </div>
                <div className="form-group">
                    <label>{t('products.description')}</label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        rows="3"
                    />
                </div>
                <div className="form-group checkbox-group flex items-center gap-2 mb-4">
                    <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-auto"
                    />
                    <label htmlFor="is_active" className="mb-0 cursor-pointer">{t('products.showInPOS')}</label>
                </div>
                <div className="form-actions">
                    {onCancel && (
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            {t('common.cancel')}
                        </button>
                    )}
                    <button type="submit" className="btn btn-primary">
                        {t('common.save')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
