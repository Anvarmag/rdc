<?php
/**
 * lead_create.php
 * Заглушка для создания лида/сделки в Bitrix24
 */

header('Content-Type: application/json; charset=utf-8');

// Симуляция задержки сети
sleep(1);

// Чтение входных данных (JSON)
$input_json = file_get_contents('php://input');
$data = json_decode($input_json, true);

if (!$data) {
    echo json_encode(['error' => 'No data provided']);
    http_response_code(400);
    exit;
}

// TODO: Здесь должен быть реальный вызов к Bitrix24
$bitrix_webhook_url = 'https://portal.bitrix24.ru/rest/1/secret_token/crm.lead.add.json';

/*
// Пример реального вызова:
$leadData = [
    'fields' => [
        'TITLE' => 'Новая заявка с конфигуратора РДЦ',
        'NAME' => $data['fullName'],
        'PHONE' => [['VALUE' => $data['phone'], 'VALUE_TYPE' => 'WORK']],
        'EMAIL' => [['VALUE' => $data['email'], 'VALUE_TYPE' => 'WORK']],
        'COMMENTS' => "Услуга: {$data['serviceId']}\nИИ: " . ($data['aiEnabled'] ? 'Да' : 'Нет'),
        'SOURCE_ID' => 'WEB'
    ]
];
$ch = curl_init($bitrix_webhook_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($leadData));
$response = curl_exec($ch);
curl_close($ch);
*/

// Фейковый ответ на время разработки
$fake_lead_id = rand(10000, 99999);

echo json_encode([
    'success' => true,
    'leadId' => $fake_lead_id,
    'message' => 'Lead created successfully'
]);
