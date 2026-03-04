/**
 * api.js
 * Handles backend communication for creating leads and payments.
 */

// Replace with actual production endpoints
const API_ENDPOINTS = {
    createLead: '/server/api/lead_create.php',
    createPayment: '/server/api/pay_create.php'
};

export async function createLeadAndPayment(state, totalPrice) {
    try {
        // Sanitize complaints input
        const complaints = state.form.complaints ? state.form.complaints.replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';

        // 1. Create Lead in Bitrix24
        const leadResponse = await fetch(API_ENDPOINTS.createLead, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...state.form,
                complaints: complaints,
                serviceId: state.serviceId,
                time: state.time,
                aiEnabled: state.aiEnabled,
                aiSubtypeId: state.aiSubtypeId,
                concilium: state.concilium,
                totalPrice: totalPrice,
                source: 'Конфигуратор услуг'
            })
        });

        if (!leadResponse.ok) {
            const err = new Error('Ошибка при создании заявки');
            err.type = 'SERVER_ERROR';
            throw err;
        }

        const leadData = await leadResponse.json();
        const leadId = leadData.leadId;

        if (!leadId) {
            const err = new Error('Не удалось получить ID заявки');
            err.type = 'SERVER_ERROR';
            throw err;
        }

        // 2. Create Payment in Ak Bars
        const payResponse = await fetch(API_ENDPOINTS.createPayment, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                leadId: leadId,
                amount: totalPrice * 100, // Usually in kopecks
                description: `Оплата заказа #${leadId} (РДЦ)`
            })
        });

        if (!payResponse.ok) {
            const err = new Error('Ошибка при инициализации платежа');
            err.type = 'SERVER_ERROR';
            throw err;
        }

        const payData = await payResponse.json();

        // Return payment URL to redirect the user
        return payData.paymentUrl;

    } catch (error) {
        console.error('API Error:', error);
        if (!error.type) {
            error.type = 'NETWORK_ERROR';
        }
        throw error;
    }
}
