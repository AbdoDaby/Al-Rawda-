
export const sendTelegramMessage = async (botToken, chatId, message) => {
    if (!botToken || !chatId) return;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            }),
        });

        if (!response.ok) {
            console.error('Telegram notification failed:', await response.text());
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
};

export const formatOrderMessage = (order) => {
    const itemsList = order.items
        .map(item => `- ${item.name} (x${item.quantity}) - ${item.total.toFixed(2)}`)
        .join('\n');

    return `
<b>🆕 New Order Received!</b>

<b>Customer:</b> ${order.customer.name || 'Guest'}
<b>Phone:</b> ${order.customer.phone || 'N/A'}

<b>Items:</b>
${itemsList}

<b>Subtotal:</b> ${order.subtotal.toFixed(2)} EGP
<b>Discount:</b> -${order.discountAmount.toFixed(2)} EGP
<b>TOTAL:</b> ${order.total.toFixed(2)} EGP

#Order${order.id}
  `.trim();
};

export const formatDeleteMessage = (order) => {
    return `
<b>❌ Order Cancelled/Deleted</b>

<b>Order ID:</b> #${order.id}
<b>Customer:</b> ${order.customer.name || 'Guest'}
<b>Amount:</b> ${order.total.toFixed(2)} EGP

The order has been removed from the history.
  `.trim();
};
