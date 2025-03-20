<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';
require_once '../includes/storage.php';
require_once '../includes/upload_functions.php';

header('Content-Type: application/json');

$response = ['success' => false, 'error' => ''];

// Проверка CSRF-токена
if (!isset($_POST['csrf_token']) || !validateCsrfToken($_POST['csrf_token'])) {
    $response['error'] = 'Ошибка валидации CSRF токена';
    echo json_encode($response);
    exit();
}

// Проверка активности сессии клиента
if (!isset($_SESSION['client_name'])) {
    $response['error'] = 'Сессия не активна. Пожалуйста, перезагрузите страницу.';
    echo json_encode($response);
    exit();
}

$clientName = $_SESSION['client_name'];
$chatId = md5($clientName . getClientIP());

// Проверка содержимого сообщения
$message = sanitizeInput($_POST['message'] ?? '');
$image = null;

if (empty($message) && (empty($_FILES['image']['name']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK)) {
    $response['error'] = 'Пожалуйста, введите сообщение или выберите изображение';
    echo json_encode($response);
    exit();
}

// Обработка изображения
if (!empty($_FILES['image']['name']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $image = handleFileUpload($_FILES['image']);
    if (is_string($image) && strpos($image, 'Ошибка') !== false) {
        $response['error'] = $image;
        echo json_encode($response);
        exit();
    }
}

// Работа с информацией о клиенте
$clientInfoPath = CLIENTS_DIR . "$chatId.json";
$clientInfo = [];

if (file_exists($clientInfoPath)) {
    $clientInfo = json_decode(file_get_contents($clientInfoPath), true);
    if (!$clientInfo) {
        $response['error'] = 'Ошибка чтения данных клиента';
        echo json_encode($response);
        exit();
    }

    // Автоматическое открытие закрытого чата
    if (strpos($clientInfo['status'], 'Закрыт') !== false) {
        $clientInfo['status'] = 'Открыт';
    }
} else {
    // Создание новой записи клиента
    $hostname = 'Неизвестный хост'; // Значение по умолчанию

    if (!DISABLE_DNS_LOOKUP) {
        $hostname = @gethostbyaddr(getClientIP()) ?: 'Неизвестный хост';
    }

    $clientInfo = [
        'name' => $clientName,
        'ip' => getClientIP(),
        'hostname' => $hostname,
        'created_at' => date('Y-m-d H:i:s'),
        'status' => 'Открыт',
        'last_activity' => date('Y-m-d H:i:s'),
        'last_admin_view' => '1970-01-01 00:00:00'
    ];
}

// Обновление активности
$clientInfo['last_activity'] = date('Y-m-d H:i:s');

// Сохранение информации о клиенте
if (!file_put_contents($clientInfoPath, 
    json_encode($clientInfo, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    $response['error'] = 'Ошибка сохранения данных клиента';
    echo json_encode($response);
    exit();
}

// Сохранение сообщения
if (!saveMessage($chatId, $message, false, $image)) {
    $response['error'] = 'Ошибка сохранения сообщения';
    echo json_encode($response);
    exit();
}

// Успешный ответ
$response['success'] = true;
$response['image'] = $image;
echo json_encode($response);
exit();
?>