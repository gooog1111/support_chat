<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';
require_once '../includes/storage.php';
require_once '../includes/upload_functions.php';

if (!isset($_SESSION['admin_logged_in'])) {
    header("Location: login.php");
    exit();
}
updateAdminOnlineStatus($_SESSION['admin_username']);
// Загрузка всех чатов для списка
$chats = [];
foreach (glob(CLIENTS_DIR . "*.json") as $clientFile) {
    $chatId = basename($clientFile, '.json');
    $clientInfo = json_decode(file_get_contents($clientFile), true);

    $messagesFile = CHATS_DIR . $chatId . '.json';
    $messages = file_exists($messagesFile) ? getMessages($chatId) : [];

    // В обоих файлах заменить строку с подсчетом непрочитанных:
$unreadMessages = count(array_filter($messages, function($msg) use ($clientInfo) {
    return !$msg['isAdmin'] && 
           (!isset($clientInfo['last_admin_view']) || 
            strtotime($msg['time']) > strtotime($clientInfo['last_admin_view']));
}));

    $chats[] = [
        'id' => $chatId,
        'info' => $clientInfo,
        'status' => $clientInfo['status'] ?? 'open',
        'last_activity' => $clientInfo['last_activity'] ?? end($messages)['time'] ?? 'Нет данных',
        'unread' => $unreadMessages,
    ];
}

usort($chats, fn($a, $b) => strtotime($b['last_activity']) <=> strtotime($a['last_activity']));
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Панель администратора</title>
    <link rel="stylesheet" href="../assets/css/admin.css">
	<link rel="stylesheet" href="../assets/css/all.min.css">
    <script src="../assets/js/admin.js" defer></script>
	<audio id="notificationSound" src="../assets/sounds/notification.mp3" preload="auto"></audio>
</head>
<body>
<header class="admin-header">
    <div class="admin-info">
        <h1><?= htmlspecialchars($_SESSION['admin_name']) ?></h1>
        <p><?= htmlspecialchars($_SESSION['admin_username']) ?></p>
    </div>
<div class="admin-actions">
    <button onclick="updateHostnames()" class="btn btn-warning">
        <i class="fas fa-sync-alt"></i>
        <span>Обновить имена ПК</span>
    </button>
</div>
<button id="enableNotificationsBtn" class="btn btn-info">
    <i class="fas fa-bell"></i> Разрешить уведомления и звук
</button>
    <a href="update_profile.php" class="btn profile-link">Изменить профиль</a>
    <a href="logout.php" class="btn logout">Выход</a>
</header>
    <div class="dashboard-container">
        <div class="chat-list-container">
            <h2>Список чатов</h2>
            <div class="chat-list">
                <?php foreach ($chats as $chat): ?>
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
            </div>
        </div>

        <div id="chat-container" class="chat-container">
            <h2>Чат с клиентом</h2>
            <!-- Контейнер для сообщений -->
            <div id="chat-messages" class="chat-messages"></div>
            
            <!-- Контейнер для управления чатом -->
            <div class="chat-controls">
                <form id="chat-form" method="post" enctype="multipart/form-data">
                    <textarea name="message" placeholder="Введите сообщение"></textarea>
                    <input type="file" name="image">
                    <button type="submit" class="btn">Отправить</button>
                </form>
                <div class="chat-actions">
                    <button onclick="updateChatStatus('в работе', '<?= htmlspecialchars($_SESSION['admin_name']) ?>')" class="btn">В работе</button>
                    <button onclick="closeChat()" class="btn btn-danger">Закрыть чат</button>
                    <button onclick="clearChat()" class="btn btn-danger">Очистить чат</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Модальное окно для просмотра изображений -->
    <div id="imageModal" class="modal">
        <span class="close">&times;</span>
        <img class="modal-content" id="modalImage">
        <div id="caption"></div>
    </div>
</body>
</html>
