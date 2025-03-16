<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';
require_once '../includes/storage.php';

// Если имя клиента не установлено, проверяем localStorage
if (!isset($_SESSION['client_name'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $clientName = sanitizeInput($_POST['client_name']);
        if (!empty($clientName)) {
            $_SESSION['client_name'] = $clientName;
            $_SESSION['client_token'] = bin2hex(random_bytes(16)); // Генерация уникального токена
            header("Location: index.php");
            exit();
        } else {
            $error = "Пожалуйста, введите ваше имя.";
        }
    } else {
        // Проверяем, есть ли имя в localStorage
        echo "<script>
            if (localStorage.getItem('clientName')) {
                window.location.href = 'restore_session.php?name=' + encodeURIComponent(localStorage.getItem('clientName'));
            }
        </script>";
    }
    ?>
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Введите ваше имя</title>
        <link rel="stylesheet" href="../assets/css/styles.css">
    </head>
    <body>
        <div class="login-form">
            <h2>Введите ваше имя</h2>
            <?php if (isset($error)): ?>
                <p class="error"><?= $error ?></p>
            <?php endif; ?>
            <form method="post">
                <label for="client_name">Ваше имя:</label>
                <input type="text" id="client_name" name="client_name" required>
                <button type="submit">Продолжить</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit();
}

$clientName = $_SESSION['client_name'];
$clientToken = $_SESSION['client_token']; // Используем токен вместо имени
$chatId = md5($clientToken . getClientIP()); // Генерация chatId на основе токена и IP
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Чат поддержки</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <script src="../assets/js/script.js" defer></script>
    <script>
        // Сохраняем имя клиента в localStorage
        localStorage.setItem('clientName', '<?= $clientName ?>');
    </script>
</head>
<body>
    <div class="chat-wrapper">
        <div class="chat-container">
            <h2>Поддержка</h2>
            <div id="messages" class="messages-container">
                <?php
                $messages = getMessages($chatId);
                foreach ($messages as $message) {
                    echo "<div class='" . ($message['isAdmin'] ? 'admin' : 'client') . "'>";
                    echo "<strong>" . ($message['isAdmin'] ? $message['adminName'] : 'Вы') . ":</strong> ";
                    echo htmlspecialchars($message['message']);
                    if ($message['image']) {
                        echo "<br><img src='" . $message['image'] . "' alt='Изображение' style='max-width: 200px;'>";
                    }
                    echo "<span class='time'>" . $message['time'] . "</span>";
                    echo "</div>";
                }
                ?>
            </div>
            <form id="messageForm" action="send_message.php" method="post" enctype="multipart/form-data">
                <input type="hidden" name="csrf_token" value="<?= generateCsrfToken() ?>">
                <textarea name="message" placeholder="Введите сообщение"></textarea>
                <input type="file" name="image">
                <button type="submit">Отправить</button>
            </form>
        </div>
    </div>
</body>
</html>