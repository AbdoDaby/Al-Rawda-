import React from 'react';
import { useStore } from '../contexts/StoreContext';

const OrderList = ({ setActiveTab }) => {
    const { orders, loadOrder, deleteOrder } = useStore();

    const handleEdit = (order) => {
        // Confirm before overwriting current cart? 
        // For simplicity, we just load it and switch tab.
        if (window.confirm('Load this order into POS? Current POS cart will be replaced.')) {
            loadOrder(order);
            setActiveTab('pos');
        }
    };

    const handlePrint = (order) => {
        // Direct printing of past orders is tricky because the print template lives in POS.
        // A trick is to load it, print, and optionally clear.
        // Or we can render a hidden print template here. 
        // For MVP, "View/Edit" -> Print from POS is the workflow.
        handleEdit(order);
    };

    return (
        <div className="orders-page fade-in">
            <h2>Order History</h2>
            <div className="card">
                {orders.length === 0 ? (
                    <p className="empty-state">No orders placed yet.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Payment</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>{new Date(order.created_at || order.date).toLocaleString()}</td>
                                        <td>
                                            <div>{order.customer.name || '-'}</div>
                                            <small className="text-muted">{order.customer.phone}</small>
                                        </td>
                                        <td>{order.items.length} items</td>
                                        <td>{order.paymentMethod || 'Cash'}</td>
                                        <td>{order.total.toFixed(2)} EGP</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleEdit(order)}
                                                title="View & Edit"
                                            >
                                                👁️ View / Edit
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm delete"
                                                style={{ marginLeft: '10px', background: '#EF4444' }}
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this order?')) {
                                                        deleteOrder(order.id);
                                                    }
                                                }}
                                                title="Delete Order"
                                            >
                                                🗑️ Delete
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
    );
};

export default OrderList;
