<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/storage.php';

if (!isset($_SESSION['admin_logged_in'])) {
    http_response_code(403);
    exit(json_encode(['success' => false, 'error' => 'Доступ запрещен.']));
}

$chats = [];
foreach (glob(CLIENTS_DIR . "*.json") as $clientFile) {
    $chatId = basename($clientFile, '.json');
    $clientInfo = json_decode(file_get_contents($clientFile), true);

    $messagesFile = CHATS_DIR . "$chatId.json";
    $messages = file_exists($messagesFile) ? getMessages($chatId) : [];

    $status = $clientInfo['status'] ?? 'open';
    // В обоих файлах заменить строку с подсчетом непрочитанных:
$unreadMessages = count(array_filter($messages, function($msg) use ($clientInfo) {
    return !$msg['isAdmin'] && 
           (!isset($clientInfo['last_admin_view']) || 
            strtotime($msg['time']) > strtotime($clientInfo['last_admin_view']));
}));

    $chats[] = [
        'id' => $chatId,
        'info' => $clientInfo,
        'status' => $status,
        'last_activity' => $clientInfo['last_activity'] ?? end($messages)['time'] ?? 'Нет данных',
        'unread' => $unreadMessages,
    ];
}

usort($chats, fn($a, $b) => strtotime($b['last_activity']) <=> strtotime($a['last_activity']));

header('Content-Type: text/html');
foreach ($chats as $chat): ?>
    <div class="chat-item <?= htmlspecialchars($chat['status']) ?>" data-chat-id="<?= htmlspecialchars($chat['id']) ?>">
        <?php
        $fields = [
            'Клиент' => $chat['info']['name'] ?? 'Неизвестный',
            'Kerberos' => $chat['info']['kerberos'] ?? 'Неизвестно',
            'IP' => $chat['info']['ip'] ?? 'Неизвестный',
            'Имя ПК' => $chat['info']['hostname'] ?? 'Не определено',
            'Статус' => $chat['status'],
            'Последняя активность' => $chat['last_activity'],
            'Непрочитанные сообщения' => $chat['unread']
        ];

        foreach ($fields as $label => $value): ?>
            <p><strong><?= htmlspecialchars($label) ?>:</strong> <?= htmlspecialchars($value) ?></p>
        <?php endforeach; ?>
    </div>
<?php endforeach; ?>