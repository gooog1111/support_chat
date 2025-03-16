<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';
require_once '../includes/storage.php';

// Проверка авторизации
if (!isset($_SESSION['admin_logged_in'])) {
    http_response_code(403); // Доступ запрещен
    echo json_encode(['error' => 'Доступ запрещен. Пожалуйста, войдите в систему.']);
    exit();
}

// Проверка ID чата
$chatId = sanitizeInput($_GET['id']);
if (!$chatId || !file_exists(CHATS_DIR . "$chatId.json")) {
    http_response_code(404);
    echo json_encode(['error' => 'Чат не найден.']);
    exit();
}
updateLastViewTime($chatId);
// Возвращение сообщений
header('Content-Type: application/json');
try {
    $messages = getMessages($chatId);
    echo json_encode($messages);
} catch (Exception $e) {
    http_response_code(500); // Внутренняя ошибка сервера
    echo json_encode(['error' => 'Ошибка при получении сообщений.']);
}
?>
