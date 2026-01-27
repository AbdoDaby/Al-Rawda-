import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../contexts/StoreContext';

const OrderList = ({ setActiveTab }) => {
    const { t } = useTranslation();
    const { orders, loadOrder, deleteOrder } = useStore();

    const handleEdit = (order) => {
        if (window.confirm(t('orders.loadConfirm'))) {
            loadOrder(order);
            setActiveTab('pos');
        }
    };

    const handlePrint = (order) => {
        handleEdit(order);
    };

    return (
        <div className="orders-page fade-in">
            <h2>{t('orders.title')}</h2>
            <div className="card">
                {orders.length === 0 ? (
                    <p className="empty-state">{t('common.noResults')}</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('orders.date')}</th>
                                    <th>{t('orders.customer')}</th>
                                    <th>{t('orders.items')}</th>
                                    <th>{t('orders.payment')}</th>
                                    <th>{t('orders.total')}</th>
                                    <th>{t('orders.actions')}</th>
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
                                        <td>{order.items.length} {t('orders.items')}</td>
                                        <td>{order.paymentMethod === 'Cash' ? t('pos.cash') : t('pos.instapay')}</td>
                                        <td>{order.total.toFixed(2)} {t('common.egp')}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleEdit(order)}
                                                title={t('orders.viewEdit')}
                                            >
                                                {t('orders.viewEdit')}
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm delete"
                                                style={{ marginLeft: '10px', background: '#EF4444' }}
                                                onClick={() => {
                                                    if (window.confirm(t('orders.deleteConfirm'))) {
                                                        deleteOrder(order.id);
                                                    }
                                                }}
                                                title={t('common.delete')}
                                            >
                                                {t('common.delete')}
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
