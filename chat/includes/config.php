<?php
// Абсолютный путь к корню проекта
define('DISABLE_DNS_LOOKUP', true); // Отключаем DNS-запросы для существующих клиентов
define('ROOT_DIR', realpath(__DIR__ . '/..') . '/');
ini_set('log_errors', 1);
ini_set('error_log', ROOT_DIR . 'logs/error.log');

// Подключение файла администраторов
require_once 'admins.php';

// Настройки путей
define('UPLOAD_DIR', ROOT_DIR . 'uploads/');
define('CHATS_DIR', ROOT_DIR . 'chats/');
define('CLIENTS_DIR', ROOT_DIR . 'clients/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB

// Создание директорий при их отсутствии
$dirs = [UPLOAD_DIR, CHATS_DIR, CLIENTS_DIR];
foreach ($dirs as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Настройки сессии
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start([
        'cookie_lifetime' => 86400, // Время жизни сессии (24 часа)
        'cookie_secure' => false,   // Для локальной сети можно отключить
        'cookie_httponly' => true   // Защита от XSS
    ]);
}

// Генерация CSRF токена
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
?>
