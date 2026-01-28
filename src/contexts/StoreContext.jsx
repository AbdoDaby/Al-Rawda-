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
            const getLocalProducts = () => {
                const saved = localStorage.getItem('products');
                return saved ? JSON.parse(saved) : [];
            };

            const localProducts = getLocalProducts();

            if (!supabase) {
                setProducts(localProducts);
                return;
            }

            const { data: cloudProducts, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                console.error('Error fetching products from Supabase:', error);
                setProducts(localProducts);
            } else {
                const currentCloud = cloudProducts || [];
                // --- EXPERT MERGE LOGIC ---
                // Identify local products that are NOT in the cloud yet
                // Compare by name/code since local IDs are often temporary timestamps
                const missingInCloud = localProducts.filter(lp =>
                    !currentCloud.some(cp => cp.name === lp.name || (lp.code && cp.code === lp.code))
                );

                if (missingInCloud.length > 0) {
                    console.log(`Found ${missingInCloud.length} products locally not in cloud. Syncing...`);
                    const productsToUpload = missingInCloud.map(({ id, created_at, ...rest }) => rest);
                    const { data: uploadedData, error: uploadError } = await supabase
                        .from('products')
                        .insert(productsToUpload)
                        .select();

                    if (!uploadError && uploadedData) {
                        const finalProducts = [...currentCloud, ...uploadedData];
                        setProducts(finalProducts);
                        localStorage.setItem('products', JSON.stringify(finalProducts));
                    } else {
                        setProducts([...currentCloud, ...missingInCloud]);
                    }
                } else {
                    setProducts(currentCloud);
                    localStorage.setItem('products', JSON.stringify(currentCloud));
                }
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
                const parsed = saved ? JSON.parse(saved) : [];
                setOrders(parsed);
                return parsed;
            };

            if (!supabase) {
                loadLocalOrders();
                return;
            }

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching orders:', error);
                loadLocalOrders();
            } else {
                if (data && data.length > 0) {
                    setOrders(data);
                } else {
                    // Database is empty, try to migrate local orders
                    const localOrders = loadLocalOrders();
                    if (localOrders.length > 0) {
                        console.log('Migrating local orders to Supabase...');
                        const ordersToUpload = localOrders.map(({ id, ...rest }) => ({
                            ...rest,
                            customer_info: rest.customer || rest.customer_info,
                            discount_info: rest.discount || rest.discount_info,
                            payment_method: rest.paymentMethod || rest.payment_method,
                            total_amount: rest.total || rest.total_amount
                        }));
                        const { data: uploadedData, error: uploadError } = await supabase
                            .from('orders')
                            .insert(ordersToUpload)
                            .select();

                        if (!uploadError && uploadedData) {
                            setOrders(uploadedData);
                        }
                    }
                }
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

    const addProduct = async (product) => {
        // Strip ID and created_at if they exist
        const { id, created_at, ...productData } = product;

        if (!supabase) {
            const newProduct = { ...product, id: Date.now() };
            setProducts(prev => [...prev, newProduct]);
            const saved = JSON.parse(localStorage.getItem('products') || '[]');
            localStorage.setItem('products', JSON.stringify([...saved, newProduct]));
            return;
        }

        // --- EXPERT AUTO-RESOLVE LOGIC ---
        // Try to insert the full product
        let { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select();

        // If it fails specifically because a column is missing (e.g., 'description')
        if (error && error.message.includes('column') && error.message.includes('not found')) {
            console.warn('Database schema mismatch detected. Retrying with core fields only...', error.message);

            // Define core fields that MUST exist
            const coreData = {
                name: productData.name,
                price: productData.price,
                cost: productData.cost,
                stock: productData.stock,
                code: productData.code,
                category: productData.category
            };

            const retry = await supabase
                .from('products')
                .insert([coreData])
                .select();

            data = retry.data;
            error = retry.error;
        }

        if (error) {
            console.error('Final attempt to add product failed:', error);
            alert(`Error: ${error.message}. Please check your Supabase schema.`);
        } else if (data) {
            setProducts(prev => [...prev, data[0]]);
        }
    };

    const updateProduct = async (updatedProduct) => {
        if (!supabase) {
            const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
            setProducts(newProducts);
            localStorage.setItem('products', JSON.stringify(newProducts));
            return;
        }

        const { id, created_at, ...updateData } = updatedProduct;

        // --- EXPERT AUTO-RESOLVE LOGIC ---
        let { error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id);

        // If it fails specifically because a column is missing
        if (error && error.message.includes('column') && error.message.includes('not found')) {
            console.warn('Database schema mismatch detected during update. Retrying without extra fields...', error.message);

            const coreUpdate = {
                name: updateData.name,
                price: updateData.price,
                cost: updateData.cost,
                stock: updateData.stock,
                code: updateData.code,
                category: updateData.category
            };

            const retry = await supabase
                .from('products')
                .update(coreUpdate)
                .eq('id', id);

            error = retry.error;
        }

        if (error) {
            console.error('Error updating product in Supabase:', error);
            alert(`Error updating product: ${error.message}`);
        } else {
            setProducts(products.map(p => p.id === id ? updatedProduct : p));
        }
    };

    const deleteProduct = async (id) => {
        // Optimistic local update to keep UI fast
        const previousProducts = [...products];
        const updatedProducts = products.filter(p => p.id !== id);
        setProducts(updatedProducts);

        if (!supabase) {
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            return;
        }

        // --- EXPERT AUTO-RESOLVE LOGIC ---
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product from Supabase:', error);

            // If it's a schema error (table/column missing), revert local and alert
            if (error.message.includes('relation') || error.message.includes('not found')) {
                setProducts(previousProducts);
                alert(`Immediate Action Required: Your Supabase database tables are not ready. Please run the SQL script I provided to create the "products" table.`);
            } else {
                // For other errors, at least keep the local change synchronized
                localStorage.setItem('products', JSON.stringify(updatedProducts));
                alert(`Cloud sync issue: ${error.message}. Product was removed locally.`);
            }
        } else {
            // Success: update local cache
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            alert('Product deleted successfully from cloud!');
        }
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
            totalProfit
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

        if (!supabase) {
            localStorage.setItem('orders', JSON.stringify([newOrder, ...orders]));
            return newOrder;
        }

        // Save to Supabase
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
            // Fallback to local
            localStorage.setItem('orders', JSON.stringify([newOrder, ...orders]));
        } else if (data && data[0]) {
            const realOrder = data[0];
            setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...newOrder, id: realOrder.id, created_at: realOrder.created_at } : o));
            return { ...newOrder, id: realOrder.id, created_at: realOrder.created_at };
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
        const newOrders = orders.filter(o => o.id !== id);
        setOrders(newOrders);

        // Send Telegram Notification for Deletion
        if (orderToDelete && settings.telegramBotToken && settings.telegramChatId) {
            sendTelegramMessage(
                settings.telegramBotToken,
                settings.telegramChatId,
                formatDeleteMessage(orderToDelete)
            );
        }

        if (!supabase) {
            localStorage.setItem('orders', JSON.stringify(newOrders));
            return;
        }

        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) {
            console.error('Error deleting order:', error);
            localStorage.setItem('orders', JSON.stringify(newOrders));
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
