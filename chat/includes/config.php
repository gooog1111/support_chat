<?php
if (strpos($_SERVER['HTTP_USER_AGENT'], 'curl') !== false || 
    strpos($_SERVER['HTTP_USER_AGENT'], 'wget') !== false) {
    // Перенаправляем curl и wget на альтернативный URL
	header('HTTP/1.1 204 No Content');
    exit;
}
// Абсолютный путь к корню проекта
define('DISABLE_DNS_LOOKUP', true); // Отключаем DNS-запросы для существующих клиентов
define('ROOT_DIR', realpath(__DIR__ . '/..') . '/');
define('ADMINS_ONLINE_DIR', ROOT_DIR . 'admin_online/');
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
if (!file_exists(ADMINS_ONLINE_DIR)) {
    mkdir(ADMINS_ONLINE_DIR, 0755, true);
}
?>
