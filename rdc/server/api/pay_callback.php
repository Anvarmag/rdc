<?php
/**
 * pay_callback.php
 * Заглушка для обработки серверного коллбека об успешной оплате (от Ак Барс)
 */

$input_json = file_get_contents('php://input');
// В реальности банк может отправлять данные как application/x-www-form-urlencoded

// 1. TODO: Проверка подписи от банка (ОБЯЗАТЕЛЬНО!)
// $sign = $_POST['sign'];
// $calculated_sign = hash_hmac('sha256', string_to_sign, $akbars_secret);
// if ($sign !== $calculated_sign) die('Bad sign');

// 2. Получение ID заказа
$order_id = $_POST['orderId'] ?? 'UNKNOWN';
$status = $_POST['status'] ?? 'SUCCESS'; // DEPOSITED, DECLINED etc.
$amount = $_POST['amount'] ?? 0;

// Если в orderId сидит наш LeadId, вытаскиваем его
// list($lead_id, $timestamp) = explode('_', $order_id);

if ($status === 'SUCCESS' || $status === 'DEPOSITED') {
    // 3. TODO: Запрос в Bitrix24 для обновления статуса сделки (Лида)
    // $bitrix_webhook_url_update = 'https://portal.bitrix24.ru/rest/1/secret/crm.lead.update.json';
    // Обновляем статус: ОПЛАЧЕНО
    
    // Логирование
    file_put_contents(__DIR__ . '/payment_success.log', date('Y-m-d H:i:s') . " - Order $order_id paid \n", FILE_APPEND);
    
    echo "OK";
} else {
    // Оплата не прошла
    file_put_contents(__DIR__ . '/payment_fail.log', date('Y-m-d H:i:s') . " - Order $order_id failed \n", FILE_APPEND);
    echo "OK"; // Все равно говорим банку OK, чтобы он перестал слать коллбеки
}
