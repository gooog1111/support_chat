<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';

// Проверка и обработка запроса
if (isset($_GET['name'])) {
    $clientName = sanitizeInput($_GET['name']);

    if (!empty($clientName)) {
        $_SESSION['client_name'] = $clientName;
        $_SESSION['client_token'] = bin2hex(random_bytes(16)); // Генерация уникального токена
        echo json_encode(['success' => true]);
		$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';

// Получаем текущий домен
$host = $_SERVER['HTTP_HOST'];

// Формируем полный URL для перенаправления
$redirectUrl = $protocol . $host . '/chat/client';

// Перенаправляем на нужный URL
header('Location: ' . $redirectUrl);
        exit();
    }
}

// Возвращение ошибки, если имя клиента не указано
http_response_code(400); // HTTP-код для неверного запроса
echo json_encode(['success' => false, 'error' => 'Имя клиента не указано.']);

exit();
?>