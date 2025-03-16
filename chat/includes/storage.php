<?php
function createClient($chatId, $clientName) {
    $clientInfo = [
        'name' => $clientName,
        'ip' => getClientIP(),
        'hostname' => @gethostbyaddr(getClientIP()) ?: 'Неизвестный хост',
        'created_at' => date('Y-m-d H:i:s'),
        'status' => 'Открыт',
        'last_activity' => date('Y-m-d H:i:s'),
        'last_admin_view' => '1970-01-01 00:00:00' // Инициализация поля
    ];
    
    file_put_contents(CLIENTS_DIR . "$chatId.json", 
        json_encode($clientInfo, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
function getMessages($chatId) {
    $filePath = CHATS_DIR . "$chatId.json";
    if (!file_exists($filePath)) {
        return [];
    }
    $content = file_get_contents($filePath);
    return json_decode($content, true) ?: [];
}
function saveMessage($chatId, $message, $isAdmin = false, $image = null, $adminName = null) {
    $filePath = CHATS_DIR . "$chatId.json";
    $messageData = [
        'time' => date('Y-m-d H:i:s'),
        'isAdmin' => $isAdmin,
        'message' => $message,
        'image' => $image,
        'adminName' => $adminName
    ];
    if ($image && !file_exists(ROOT_DIR . $image)) {
        error_log("storage.php: Указанный файл изображения не существует: " . ROOT_DIR . $image);
        $image = null;
    }
    $messages = getMessages($chatId);
    $messages[] = $messageData;
    if (!file_put_contents($filePath, json_encode($messages, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        error_log("storage.php: Ошибка сохранения сообщения в файл: $filePath.");
        return false;
    }
    return true;
}
function updateChatStatus($chatId, $status, $adminName = null) {
    $filePath = CLIENTS_DIR . "$chatId.json";
    if (!file_exists($filePath)) {
        error_log("Ошибка: Чат с ID $chatId не найден.");
        return false;
    }
    $clientInfo = json_decode(file_get_contents($filePath), true);
    
    if ($status === 'в работе' && $adminName) {
        $clientInfo['status'] = "в работе ($adminName)";
    } elseif ($status === 'closed' && $adminName) {
        $clientInfo['status'] = "Закрыт ($adminName)";
    } elseif ($status === 'open') {
        $clientInfo['status'] = "Открыт";
    }
    $clientInfo['last_activity'] = date('Y-m-d H:i:s');
    if ($adminName) {
        $clientInfo['admin'] = $adminName;
    }
    if (!file_put_contents($filePath, json_encode($clientInfo, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        error_log("Ошибка: Не удалось обновить статус чата $chatId.");
        return false;
    }
    return true;
}
function getChatStatus($chatId) {
    $filePath = CLIENTS_DIR . "$chatId.json";
    if (!file_exists($filePath)) {
        return 'closed'; // По умолчанию считаем чат закрытым, если файл не найден
    }
    $clientInfo = json_decode(file_get_contents($filePath), true);
    return $clientInfo['status'] ?? 'closed';
}
function closeChat($chatId, $adminName) {
    return updateChatStatus($chatId, 'closed', $adminName);
}
function clearChat($chatId) {
    $filePath = CHATS_DIR . "$chatId.json";
    if (!file_exists($filePath)) {
        return false;
    }
    return file_put_contents($filePath, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
function updateLastViewTime($chatId) {
    $clientFile = CLIENTS_DIR . "$chatId.json";
    if (!file_exists($clientFile)) return false;
    
    $clientInfo = json_decode(file_get_contents($clientFile), true);
    $clientInfo['last_admin_view'] = date('Y-m-d H:i:s');
    
    return file_put_contents($clientFile, 
        json_encode($clientInfo, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
?>