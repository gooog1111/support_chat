<?php
// Получаем текущий протокол (http или https)
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';

// Получаем текущий домен
$host = $_SERVER['HTTP_HOST'];

// Формируем полный URL для перенаправления
$redirectUrl = $protocol . $host . '/chat/client';

// Перенаправляем на нужный URL
header('Location: ' . $redirectUrl);
exit;
?>
