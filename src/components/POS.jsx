import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../contexts/StoreContext';
import { sendTelegramNotification } from '../services/notificationService';

const POS = () => {
    const { t } = useTranslation();
    const {
        products,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        calculateTotal,
        clearCart,
        settings,
        customer, setCustomer,
        discount, setDiscount,
        saveOrder
    } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [receiptData, setReceiptData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { subtotal, discountAmount, total } = calculateTotal();

    const handleCheckout = async () => {
        const order = await saveOrder(paymentMethod);
        setReceiptData(order);
        setPaymentMethod('Cash'); // Reset to default

        // Send Notification in background
        sendTelegramNotification(order);

        // Wait for state update before printing
        setTimeout(() => {
            window.print();
        }, 100);
    };

    // Data to display in receipt (prefer receiptData if available, else current cart/calculations)
    const printItems = receiptData ? receiptData.items : cart;
    const printSubtotal = receiptData ? receiptData.subtotal : subtotal;
    const printDiscount = receiptData ? receiptData.discount : discount;
    const printDiscountAmount = receiptData ? receiptData.discountAmount : discountAmount;
    const printTotal = receiptData ? receiptData.total : total;
    const printCustomer = receiptData ? receiptData.customer : customer;
    const printPaymentMethod = receiptData ? receiptData.paymentMethod : paymentMethod;

    return (
        <div className="pos-page fade-in">
            <div className="pos-layout">
                <div className="product-section">
                    <div className="card">
                        <input
                            type="text"
                            className="pos-search"
                            placeholder={t('pos.searchProducts')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        <div className="product-grid">
                            {filteredProducts.length === 0 ? (
                                <p className="no-results">{t('common.noResults')}</p>
                            ) : (
                                filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className="product-card-small"
                                        onClick={() => addToCart(product)}
                                    >
                                        <div className="pc-name">{product.name}</div>
                                        <div className="pc-price">{product.price.toFixed(2)} {t('common.egp')}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="cart-section">
                    <div className="card cart-card">
                        <div className="cart-header">
                            <h3>{t('pos.currentOrder')}</h3>
                            <button className="btn-text" onClick={clearCart}>{t('pos.clearCart')}</button>
                        </div>

                        <div className="customer-form p-2 mb-2 border-b border-gray-700">
                            <input
                                type="text"
                                placeholder={t('pos.customerName')}
                                value={customer.name}
                                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                className="mb-2"
                            />
                            <input
                                type="text"
                                placeholder={t('pos.phoneNumber')}
                                value={customer.phone}
                                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                            />
                        </div>

                        <div className="cart-items">
                            {cart.length === 0 ? (
                                <div className="empty-cart">
                                    <span>🛒</span>
                                    <p>{t('pos.cartEmpty')}</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="item-info">
                                            <div className="item-name">{item.name}</div>
                                            <div className="item-price-unit">{item.price.toFixed(2)} x</div>
                                        </div>
                                        <div className="item-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="qty">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="item-total">
                                            {item.total.toFixed(2)}
                                            <button className="remove-btn" onClick={() => removeFromCart(item.id)}>×</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="cart-footer">
                            <div className="discount-controls mb-2">
                                <label>{t('pos.discount')}</label>
                                <div className="flex gap-2">
                                    <select
                                        value={discount.type}
                                        onChange={e => setDiscount({ ...discount, type: e.target.value })}
                                        className="w-1/3"
                                    >
                                        <option value="fixed">{t('common.egp')}</option>
                                        <option value="percent">%</option>
                                    </select>
                                    <input
                                        type="number"
                                        value={discount.value}
                                        onChange={e => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}
                                        className="w-2/3"
                                    />
                                </div>
                            </div>

                            <div className="payment-method">
                                <label className="block">{t('pos.paymentMethod')}</label>
                                <div className="payment-options">
                                    <label className={`payment-option-label ${paymentMethod === 'Cash' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Cash"
                                            checked={paymentMethod === 'Cash'}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                        />
                                        <span>{t('pos.cash')}</span>
                                    </label>
                                    <label className={`payment-option-label ${paymentMethod === 'InstaPay' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="InstaPay"
                                            checked={paymentMethod === 'InstaPay'}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                        />
                                        <span>{t('pos.instapay')}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="summary-row">
                                    <span>{t('pos.subtotal')}</span>
                                    <span>{subtotal.toFixed(2)} {t('common.egp')}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="summary-row discount">
                                        <span>{t('pos.discount')} ({discount.type === 'percent' ? `${discount.value}%` : t('common.egp')})</span>
                                        <span>-{discountAmount.toFixed(2)} {t('common.egp')}</span>
                                    </div>
                                )}
                                <div className="summary-row total">
                                    <span>{t('pos.total')}</span>
                                    <span>{total.toFixed(2)} {t('common.egp')}</span>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary btn-block checkout-btn"
                                disabled={cart.length === 0}
                                onClick={handleCheckout}
                            >
                                {t('pos.checkout')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Receipt Template */}
            <div className="print-area">
                <div className="receipt-header">
                    <h1>{settings.merchantName || t('sidebar.title')}</h1>
                    <p>{settings.merchantPhone}</p>
                    {printCustomer.name && <h2>{t('pos.receipt.customer')}: {printCustomer.name}</h2>}
                    {printCustomer.phone && <p>{t('pos.receipt.phone')}: {printCustomer.phone}</p>}
                    <hr />
                    <div className="receipt-meta">
                        <span>{t('pos.receipt.date')}: {new Date().toLocaleDateString()}</span>
                        <span>{t('pos.receipt.time')}: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>

                <table className="receipt-table">
                    <thead>
                        <tr>
                            <th style={{ width: '10%' }}>#</th>
                            <th style={{ textAlign: 'inherit' }}>{t('pos.receipt.item')}</th>
                            <th style={{ width: '15%' }}>{t('pos.receipt.qty')}</th>
                            <th style={{ width: '20%' }}>{t('pos.receipt.price')}</th>
                            <th style={{ width: '20%' }}>{t('pos.receipt.total')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {printItems.map((item, index) => (
                            <tr key={item.id}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td style={{ textAlign: 'inherit' }}>{item.name}</td>
                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'center' }}>{item.price.toFixed(2)}</td>
                                <td style={{ textAlign: 'center' }}>{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <hr />

                <div className="receipt-summary">
                    <div className="row">
                        <span>{t('pos.subtotal')}:</span>
                        <span>{printSubtotal.toFixed(2)} {t('common.egp')}</span>
                    </div>
                    {printDiscountAmount > 0 && (
                        <div className="row">
                            <span>{t('pos.discount')} ({printDiscount.type === 'percent' ? `${printDiscount.value}%` : t('common.egp')}):</span>
                            <span>-{printDiscountAmount.toFixed(2)} {t('common.egp')}</span>
                        </div>
                    )}
                    <div className="row total">
                        <span>{t('pos.total')}:</span>
                        <span>{printTotal.toFixed(2)} {t('common.egp')}</span>
                    </div>
                    <div className="row" style={{ marginTop: '10px' }}>
                        <span>{t('pos.paymentMethod')}:</span>
                        <span>{printPaymentMethod === 'Cash' ? t('pos.cash') : t('pos.instapay')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;
