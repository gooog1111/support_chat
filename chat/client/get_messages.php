<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';
require_once '../includes/storage.php';

// Проверяем сессию пользователя
if (!isset($_SESSION['client_name'])) {
    http_response_code(403); // Запрещено
    echo json_encode(['error' => 'Сессия не активна. Пожалуйста, перезагрузите страницу.']);
    exit();
}

$clientName = $_SESSION['client_name'];
$chatId = md5($clientName . getClientIP());

header('Content-Type: application/json');
$messages = getMessages($chatId);
echo json_encode($messages);
?>