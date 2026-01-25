import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { sendTelegramNotification } from '../services/notificationService';

const POS = () => {
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
                            placeholder="🔍 Search Products..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        <div className="product-grid">
                            {filteredProducts.length === 0 ? (
                                <p className="no-results">No products found.</p>
                            ) : (
                                filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className="product-card-small"
                                        onClick={() => addToCart(product)}
                                    >
                                        <div className="pc-name">{product.name}</div>
                                        <div className="pc-price">{product.price.toFixed(2)} EGP</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="cart-section">
                    <div className="card cart-card">
                        <div className="cart-header">
                            <h3>Current Order</h3>
                            <button className="btn-text" onClick={clearCart}>Clear</button>
                        </div>

                        <div className="customer-form p-2 mb-2 border-b border-gray-700">
                            <input
                                type="text"
                                placeholder="Customer Name (Optional)"
                                value={customer.name}
                                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                className="mb-2"
                            />
                            <input
                                type="text"
                                placeholder="Phone Number (Optional)"
                                value={customer.phone}
                                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                            />
                        </div>

                        <div className="cart-items">
                            {cart.length === 0 ? (
                                <div className="empty-cart">
                                    <span>🛒</span>
                                    <p>Cart is empty</p>
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
                                <label>Discount</label>
                                <div className="flex gap-2">
                                    <select
                                        value={discount.type}
                                        onChange={e => setDiscount({ ...discount, type: e.target.value })}
                                        className="w-1/3"
                                    >
                                        <option value="fixed">EGP</option>
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
                                <label className="block">Payment Method</label>
                                <div className="payment-options">
                                    <label className={`payment-option-label ${paymentMethod === 'Cash' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Cash"
                                            checked={paymentMethod === 'Cash'}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                        />
                                        <span>💵 Cash</span>
                                    </label>
                                    <label className={`payment-option-label ${paymentMethod === 'InstaPay' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="InstaPay"
                                            checked={paymentMethod === 'InstaPay'}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                        />
                                        <span>📱 InstaPay</span>
                                    </label>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{subtotal.toFixed(2)} EGP</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="summary-row discount">
                                        <span>Discount ({discount.type === 'percent' ? `${discount.value}%` : 'Fixed'})</span>
                                        <span>-{discountAmount.toFixed(2)} EGP</span>
                                    </div>
                                )}
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>{total.toFixed(2)} EGP</span>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary btn-block checkout-btn"
                                disabled={cart.length === 0}
                                onClick={handleCheckout}
                            >
                                Checkout & Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Receipt Template */}
            <div className="print-area">
                <div className="receipt-header">
                    <h1>{settings.merchantName || 'Al Rawda Trading'}</h1>
                    <p>{settings.merchantPhone}</p>
                    {printCustomer.name && <h2>Customer: {printCustomer.name}</h2>}
                    {printCustomer.phone && <p>Phone: {printCustomer.phone}</p>}
                    <hr />
                    <div className="receipt-meta">
                        <span>Date: {new Date().toLocaleDateString()}</span>
                        <span>Time: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>

                <table className="receipt-table">
                    <thead>
                        <tr>
                            <th style={{ width: '10%' }}>#</th>
                            <th style={{ textAlign: 'right' }}>Item</th>
                            <th style={{ width: '15%' }}>Qty</th>
                            <th style={{ width: '20%' }}>Price</th>
                            <th style={{ width: '20%' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {printItems.map((item, index) => (
                            <tr key={item.id}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td style={{ textAlign: 'right' }}>{item.name}</td>
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
                        <span>Subtotal:</span>
                        <span>{printSubtotal.toFixed(2)} EGP</span>
                    </div>
                    {printDiscountAmount > 0 && (
                        <div className="row">
                            <span>Discount ({printDiscount.type === 'percent' ? `${printDiscount.value}%` : 'Fixed'}):</span>
                            <span>-{printDiscountAmount.toFixed(2)} EGP</span>
                        </div>
                    )}
                    <div className="row total">
                        <span>Total:</span>
                        <span>{printTotal.toFixed(2)} EGP</span>
                    </div>
                    <div className="row" style={{ marginTop: '10px' }}>
                        <span>Payment Method:</span>
                        <span>{printPaymentMethod}</span>
                    </div>
                </div>

                <div className="receipt-footer">
                    <p>Thank you for your business!</p>
                    <p>Please come again.</p>
                </div>
            </div>
        </div>
    );
};

export default POS;
