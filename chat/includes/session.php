<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start([
        'cookie_lifetime' => 86400, // Время жизни сессии (24 часа)
        'cookie_secure' => false,   // Для локальной сети можно отключить
        'cookie_httponly' => true   // Защита от XSS
    ]);
}
?>