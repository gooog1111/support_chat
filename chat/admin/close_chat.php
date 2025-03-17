<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';
require_once '../includes/storage.php';

// Проверка авторизации
if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['success' => false, 'error' => 'Доступ запрещен.']);
    exit();
}
updateAdminOnlineStatus($_SESSION['admin_username']);
// Проверка ID чата
$chatId = sanitizeInput($_GET['id']);
if (!$chatId || !file_exists(CLIENTS_DIR . "$chatId.json")) {
    echo json_encode(['success' => false, 'error' => 'Чат не найден.']);
    exit();
}

// Закрытие чата
if (closeChat($chatId, $_SESSION['admin_name'])) {
    // Добавляем системное сообщение
    saveMessage($chatId, "({$_SESSION['admin_name']}) вышел из чата.", true, null, $_SESSION['admin_name']);
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Ошибка при закрытии чата.']);
}
?>
