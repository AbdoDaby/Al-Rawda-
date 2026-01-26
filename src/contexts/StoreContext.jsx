import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { sendTelegramMessage, formatOrderMessage, formatDeleteMessage } from '../services/telegram';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
    // Products State
    const [products, setProducts] = useState([]);

    // Load products from Supabase on mount
    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                console.error('Error fetching products:', error);
                // Fallback to localStorage if Supabase fails (offline support basic)
                const saved = localStorage.getItem('products');
                if (saved) setProducts(JSON.parse(saved));
            } else {
                setProducts(data || []);
            }
        };

        fetchProducts();
    }, []);

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('settings');
        return saved ? JSON.parse(saved) : {
            merchantName: 'Al Rawda Trading',
            merchantPhone: '',
            telegramBotToken: '',
            telegramChatId: ''
        };
    });

    const [cart, setCart] = useState([]);

    const [orders, setOrders] = useState([]);

    // Load orders from Supabase on mount
    useEffect(() => {
        const fetchOrders = async () => {
            const loadLocalOrders = () => {
                const saved = localStorage.getItem('orders');
                if (saved) setOrders(JSON.parse(saved));
            };

            if (!supabase) {
                loadLocalOrders();
                return;
            }

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50); // Limit to recent 50 orders for performance

            if (error) {
                console.error('Error fetching orders:', error);
                loadLocalOrders();
            } else {
                setOrders(data || []);
            }
        };

        fetchOrders();
    }, []);

    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [discount, setDiscount] = useState({ type: 'fixed', value: 0 }); // type: 'fixed' | 'percent'

    // Save Settings to localStorage (remains local)
    useEffect(() => {
        localStorage.setItem('settings', JSON.stringify(settings));
    }, [settings]);

    // Product Actions (Sync with Supabase)
    const addProduct = async (product) => {
        const newProduct = { ...product, id: Date.now() }; // Temporary ID for UI

        // Optimistic UI update
        setProducts(prev => [...prev, newProduct]);

        const { data, error } = await supabase
            .from('products')
            .insert([product]) // Supabase will generate ID if set to auto-increment, but we might want to send one
            .select();

        if (error) {
            console.error('Error adding product to Supabase:', error);
            // Revert changes optionally or show error
        } else if (data) {
            // Update with real ID from DB
            setProducts(prev => prev.map(p => p.id === newProduct.id ? data[0] : p));
        }
    };

    const updateProduct = async (updatedProduct) => {
        // Optimistic UI update
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));

        if (!supabase) return;

        const { error } = await supabase
            .from('products')
            .update(updatedProduct)
            .eq('id', updatedProduct.id);

        if (error) console.error('Error updating product in Supabase:', error);
    };

    const deleteProduct = async (id) => {
        // Optimistic UI update
        setProducts(products.filter(p => p.id !== id));

        if (!supabase) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) console.error('Error deleting product from Supabase:', error);
    };

    // Cart Actions (Remains Local)
    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1, total: product.price }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateCartQuantity = (id, quantity) => {
        if (quantity < 1) return;
        setCart(cart.map(item =>
            item.id === id
                ? { ...item, quantity, total: quantity * item.price }
                : item
        ));
    };

    const clearCart = () => {
        setCart([]);
        setCustomer({ name: '', phone: '' });
        setDiscount({ type: 'fixed', value: 0 });
    };

    // Order Actions
    const saveOrder = async (paymentMethod = 'Cash') => {
        // Validate Stock first
        for (const item of cart) {
            const product = products.find(p => p.id === item.id);
            if (product && (product.stock || 0) < item.quantity) {
                alert(`Insufficient stock for ${item.name}. Available: ${product.stock || 0}`);
                return null;
            }
        }

        const { subtotal, discountAmount, total } = calculateTotal();

        // Calculate Profit
        const totalProfit = cart.reduce((sum, item) => {
            const cost = item.cost || 0;
            const profitPerItem = item.price - cost;
            return sum + (profitPerItem * item.quantity);
        }, 0) - discountAmount;

        // Deduct Stock Locally
        const updatedProducts = products.map(p => {
            const cartItem = cart.find(c => c.id === p.id);
            if (cartItem) {
                return { ...p, stock: Math.max(0, (p.stock || 0) - cartItem.quantity) };
            }
            return p;
        });
        setProducts(updatedProducts);

        const newOrder = {
            id: Date.now(), // Speculative ID
            created_at: new Date().toISOString(),
            items: cart,
            customer,
            discount,
            paymentMethod,
            subtotal,
            discountAmount,
            total,
            totalProfit // Store profit in order
        };

        // Optimistic update
        setOrders([newOrder, ...orders]);

        // Send Telegram Notification
        if (settings.telegramBotToken && settings.telegramChatId) {
            sendTelegramMessage(
                settings.telegramBotToken,
                settings.telegramChatId,
                formatOrderMessage(newOrder)
            );
        }

        clearCart();

        // Save to Supabase
        if (supabase) {
            // 1. Deduct Stock in DB
            for (const item of cart) {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const newStock = Math.max(0, (product.stock || 0) - item.quantity);
                    await supabase.from('products').update({ stock: newStock }).eq('id', product.id);
                }
            }

            // 2. Save Order
            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    items: cart,
                    customer_info: customer,
                    discount_info: discount,
                    payment_method: paymentMethod,
                    subtotal,
                    discount_amount: discountAmount,
                    total_amount: total,
                    total_profit: totalProfit
                }])
                .select();

            if (error) {
                console.error('Error saving order to Supabase:', error);
                alert('Failed to save order to database. Please check connection.');
            } else if (data && data[0]) {
                const realOrder = data[0];
                setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...newOrder, id: realOrder.id, created_at: realOrder.created_at } : o));
                return { ...newOrder, id: realOrder.id, created_at: realOrder.created_at };
            }
        }

        return newOrder;
    };

    const loadOrder = (order) => {
        setCart(order.items);
        setCustomer(order.customer || order.customer_info); // Handle both DB structures if mixing
        setDiscount(order.discount || order.discount_info);
    };

    const deleteOrder = async (id) => {
        const orderToDelete = orders.find(o => o.id === id);
        setOrders(orders.filter(o => o.id !== id));

        // Send Telegram Notification for Deletion
        if (orderToDelete && settings.telegramBotToken && settings.telegramChatId) {
            sendTelegramMessage(
                settings.telegramBotToken,
                settings.telegramChatId,
                formatDeleteMessage(orderToDelete)
            );
        }
        if (supabase) {
            const { error } = await supabase.from('orders').delete().eq('id', id);
            if (error) console.error('Error deleting order:', error);
        }
    };

    // Order Calculations
    const calculateTotal = () => {
        const subtotal = cart.reduce((sum, item) => sum + item.total, 0);

        let discountAmount = 0;
        if (discount.type === 'fixed') {
            discountAmount = discount.value;
        } else {
            discountAmount = subtotal * (discount.value / 100);
        }

        // Ensure discount doesn't exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal);

        const total = subtotal - discountAmount;

        return {
            subtotal,
            discountAmount,
            total
        };
    };

    return (
        <StoreContext.Provider value={{
            products, addProduct, updateProduct, deleteProduct,
            cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
            customer, setCustomer,
            discount, setDiscount,
            orders, saveOrder, loadOrder, deleteOrder,
            settings, setSettings,
            calculateTotal
        }}>
            {children}
        </StoreContext.Provider>
    );
};

