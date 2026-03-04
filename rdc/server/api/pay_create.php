<?php
/**
 * pay_create.php
 * Заглушка для инициализации платежа в банке (Ак Барс)
 */

header('Content-Type: application/json; charset=utf-8');

// Симуляция задержки сети
sleep(1);

$input_json = file_get_contents('php://input');
$data = json_decode($input_json, true);

if (!$data || empty($data['leadId']) || empty($data['amount'])) {
    echo json_encode(['error' => 'Missing required fields']);
    http_response_code(400);
    exit;
}

$lead_id = $data['leadId'];
$amount_kopecks = $data['amount'];
$description = $data['description'];

// TODO: Интеграция с API Ак Барс Банка
// Обычно это POST запрос к банковскому шлюзу с передачей orderId, amount, returnUrl
$akbars_merchant_id = 'YOUR_MERCHANT_ID';
$akbars_secret = 'YOUR_SECRET_KEY';

/*
// Пример вызова банковского API:
$paymentRequest = [
    'orderNumber' => $lead_id . '_' . time(),
    'amount' => $amount_kopecks,
    'returnUrl' => 'https://rdc-rt.ru/thank-you.html',
    'description' => $description
];
// Отправка через cURL...
// Возврат URL для редиректа на страницу оплаты
*/

// Фейковый ответ
echo json_encode([
    'success' => true,
    'orderId' => $lead_id . '_TEST_' . time(),
    // Фейковая ссылка на успешную страницу для тестирования
    'paymentUrl' => '/accessible.html?status=success_mock'
]);
