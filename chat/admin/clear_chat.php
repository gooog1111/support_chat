<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';
require_once '../includes/storage.php';

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['success' => false, 'error' => 'Доступ запрещен.']);
    exit();
}
updateAdminOnlineStatus($_SESSION['admin_username']);
$chatId = sanitizeInput($_GET['id']);
if (clearChat($chatId)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Ошибка при очистке чата.']);
}
?>