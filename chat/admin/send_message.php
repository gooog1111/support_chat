<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';
require_once '../includes/storage.php';
require_once '../includes/upload_functions.php';

header('Content-Type: application/json');

// Проверка авторизации администратора
if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['success' => false, 'error' => 'Доступ запрещен.']);
    exit();
}

// Проверка ID чата
$chatId = sanitizeInput($_POST['chatId'] ?? '');
if (!$chatId || !file_exists(CHATS_DIR . "$chatId.json")) {
    echo json_encode(['success' => false, 'error' => 'Чат не найден.']);
    exit();
}

// Проверка наличия сообщения или изображения
$message = sanitizeInput($_POST['message'] ?? '');
$image = null;

if (empty($message) && empty($_FILES['image']['name'])) {
    echo json_encode(['success' => false, 'error' => 'Пожалуйста, введите сообщение или выберите изображение.']);
    exit();
}

// Обработка изображения, если оно есть
if (!empty($_FILES['image']['name']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $image = handleFileUpload($_FILES['image']);
    if (!$image) {
        echo json_encode(['success' => false, 'error' => 'Ошибка загрузки изображения.']);
        exit();
    }
}

// Сохранение сообщения
if (!saveMessage($chatId, $message, true, $image, $_SESSION['admin_name'])) {
    echo json_encode(['success' => false, 'error' => 'Ошибка при сохранении сообщения.']);
    exit();
}

// Возвращаем успех
echo json_encode(['success' => true, 'image' => $image]);
exit();
?>
