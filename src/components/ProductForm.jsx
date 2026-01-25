import React, { useState, useEffect } from 'react';

const ProductForm = ({ onSave, initialData, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        cost: '',
        stock: '',
        description: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;
        onSave({
            ...formData,
            price: parseFloat(formData.price),
            cost: parseFloat(formData.cost) || 0,
            stock: parseInt(formData.stock) || 0
        });
        setFormData({ name: '', price: '', cost: '', stock: '', description: '' });
    };

    return (
        <div className="card product-form">
            <h3>{initialData ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Product Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Premium Dates"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Price (EGP)</label>
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
                    <label>Cost Price (EGP) - Hidden from Customer</label>
                    <input
                        type="number"
                        value={formData.cost}
                        onChange={e => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                    />
                </div>
                <div className="form-group">
                    <label>Current Stock Quantity</label>
                    <input
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="e.g. 50"
                    />
                </div>
                <div className="form-group">
                    <label>Description (Optional)</label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        rows="3"
                    />
                </div>
                <div className="form-actions">
                    {onCancel && (
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="btn btn-primary">
                        {initialData ? 'Update Product' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
