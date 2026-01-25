
// Service to handle Telegram notifications

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export const sendTelegramNotification = async (order) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('Telegram credentials are not set. Notification skipped.');
        return;
    }

    // Format the message
    const itemsList = order.items.map(item =>
        `- ${item.name} (${item.quantity}x) - ${item.total.toFixed(2)} EGP`
    ).join('\n');

    const message = `
📦 *New Order Received!*

*Customer:* ${order.customer.name || 'Walk-in Customer'}
*Phone:* ${order.customer.phone || 'N/A'}
*Payment:* ${order.paymentMethod}

🛒 *Items:*
${itemsList}

--------------------------
*Subtotal:* ${order.subtotal.toFixed(2)} EGP
*Discount:* ${order.discountAmount.toFixed(2)} EGP
💰 *Total:* ${order.total.toFixed(2)} EGP
    `;

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        const data = await response.json();
        if (!data.ok) {
            console.error('Failed to send Telegram notification:', data);
        } else {
            console.log('Telegram notification sent successfully!');
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
};
