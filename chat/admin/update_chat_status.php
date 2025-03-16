<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';
require_once '../includes/storage.php';

header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['success' => false, 'error' => 'Доступ запрещен.']);
    exit();
}

$chatId = sanitizeInput($_GET['id'] ?? '');
$status = sanitizeInput($_GET['status'] ?? '');
$adminName = sanitizeInput($_GET['admin'] ?? '');

if (!$chatId || !$status) {
    echo json_encode(['success' => false, 'error' => 'Отсутствуют обязательные параметры.']);
    exit();
}

if (updateChatStatus($chatId, $status, $adminName)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Ошибка обновления статуса.']);
}
exit();
?>
