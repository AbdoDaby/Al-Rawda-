import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import ProductForm from './ProductForm';

const ProductList = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useStore();
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h2>Product Management</h2>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search products..."
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
                    <h3>Product Inventory</h3>
                    {products.length === 0 ? (
                        <p className="empty-state">No products added yet.</p>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Cost</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(product => (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="product-name">{product.name}</div>
                                                <small className="text-muted">{product.description}</small>
                                            </td>
                                            <td className="price-cell">{product.price.toFixed(2)} EGP</td>
                                            <td className="price-cell text-muted">{(product.cost || 0).toFixed(2)} EGP</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => setEditingProduct(product)}
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-icon delete"
                                                    onClick={() => deleteProduct(product.id)}
                                                    title="Delete"
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
