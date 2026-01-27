import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../contexts/StoreContext';
import ProductForm from './ProductForm';

const ProductList = () => {
    const { t } = useTranslation();
    const { products, addProduct, updateProduct, deleteProduct } = useStore();
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSave = (product) => {
        if (editingProduct) {
            updateProduct(product);
            setEditingProduct(null);
        } else {
            addProduct(product);
        }
    };

    return (
        <div className="products-page fade-in">
            <div className="page-header">
                <h2>{t('products.title')}</h2>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder={t('common.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="content-grid">
                <ProductForm
                    onSave={handleSave}
                    initialData={editingProduct}
                    onCancel={editingProduct ? () => setEditingProduct(null) : null}
                />

                <div className="card product-list-card">
                    <h3>{t('products.inventory')}</h3>
                    {products.length === 0 ? (
                        <p className="empty-state">{t('common.noResults')}</p>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('products.name')}</th>
                                        <th>{t('products.code')}</th>
                                        <th>{t('products.price')}</th>
                                        <th>{t('products.cost')}</th>
                                        <th>{t('orders.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(product => (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="product-name">{product.name}</div>
                                                <small className="text-muted">{product.description}</small>
                                            </td>
                                            <td><code className="bg-gray-800 px-1 rounded">{product.code || '-'}</code></td>
                                            <td className="price-cell">{product.price.toFixed(2)} {t('common.egp')}</td>
                                            <td className="price-cell text-muted">{(product.cost || 0).toFixed(2)} {t('common.egp')}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => setEditingProduct(product)}
                                                    title={t('common.edit')}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-icon delete"
                                                    onClick={() => {
                                                        if (window.confirm(t('common.delete') + '?')) {
                                                            deleteProduct(product.id);
                                                        }
                                                    }}
                                                    title={t('common.delete')}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductList;
