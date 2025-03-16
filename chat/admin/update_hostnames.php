<?php
header("Access-Control-Allow-Origin: *");
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';

// Локальная настройка для этого скрипта
$FORCE_DNS_LOOKUP = true; // Игнорируем DISABLE_DNS_LOOKUP из config.php

error_log("[Hostname Updater] Starting process...");

foreach (glob(CLIENTS_DIR . "*.json") as $file) {
    try {
        $data = json_decode(file_get_contents($file), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }

        // Пропускаем файлы без IP
        if (empty($data['ip'])) {
            error_log("[Hostname Updater] Skipping $file - no IP address");
            continue;
        }

        // Всегда обновляем hostname, если включено принудительное обновление
        $newHostname = $FORCE_DNS_LOOKUP 
            ? (@gethostbyaddr($data['ip']) ?: 'Неизвестный хост')
            : ($data['hostname'] ?? 'Неизвестный хост');

        // Защита от рекурсивных записей
        if ($newHostname === $data['ip']) {
            $newHostname = 'Неизвестный хост';
        }

        // Обновляем только при изменении
        if ($newHostname !== ($data['hostname'] ?? null)) {
            $data['hostname'] = $newHostname;
            file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            error_log("[Hostname Updater] Обновлено $file: " . $newHostname);
        }
    } catch (Exception $e) {
        error_log("[Hostname Updater] Ошибка в $file: " . $e->getMessage());
    }
}

echo "Имена ПК обновлены!";
?>