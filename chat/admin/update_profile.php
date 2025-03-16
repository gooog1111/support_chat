<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';

if (!isset($_SESSION['admin_logged_in'])) {
    header("Location: login.php");
    exit();
}

$error = '';
$success = '';

// Обработка смены имени
if (isset($_POST['update_name'])) {
    $newName = sanitizeInput($_POST['name']);
    if (!empty($newName)) {
        $_SESSION['admin_name'] = $newName;
        $ADMINS[$_SESSION['admin_username']]['name'] = $newName;

        // Сохранение изменений в файле admins.php
        $adminsFile = '../includes/admins.php';
        $adminsContent = '<?php $ADMINS = ' . var_export($ADMINS, true) . '; ?>';
        if (file_put_contents($adminsFile, $adminsContent) !== false) {
            $success = "Имя успешно обновлено.";
        } else {
            $error = "Ошибка при сохранении имени.";
        }
    } else {
        $error = "Имя не может быть пустым.";
    }
}

// Обработка смены пароля
if (isset($_POST['update_password'])) {
    $newPassword = sanitizeInput($_POST['password']);
    $confirmPassword = sanitizeInput($_POST['confirm_password']);

    if (!empty($newPassword) && $newPassword === $confirmPassword) {
        $ADMINS[$_SESSION['admin_username']]['password'] = password_hash($newPassword, PASSWORD_DEFAULT);

        // Сохранение изменений в файле admins.php
        $adminsFile = '../includes/admins.php';
        $adminsContent = '<?php $ADMINS = ' . var_export($ADMINS, true) . '; ?>';
        if (file_put_contents($adminsFile, $adminsContent) !== false) {
            // Завершаем сессию и перенаправляем на вход
            session_destroy();
            header("Location: login.php?message=Пароль успешно обновлён, войдите снова.");
            exit();
        } else {
            $error = "Ошибка при сохранении пароля.";
        }
    } else {
        $error = "Пароли не совпадают или пусты.";
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Обновить профиль</title>
    <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body>
    <div class="update-profile">
        <h2>Обновить профиль</h2>
        <?php if ($error): ?>
            <p class="error"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>
        <?php if ($success): ?>
            <p class="success"><?= htmlspecialchars($success) ?></p>
        <?php endif; ?>

        <!-- Форма для смены имени -->
        <form method="post">
            <h3>Сменить имя</h3>
            <label for="name">Имя:</label>
            <input type="text" id="name" name="name" value="<?= htmlspecialchars($_SESSION['admin_name']) ?>" required>
            <button type="submit" name="update_name" class="btn">Обновить имя</button>
        </form>

        <!-- Форма для смены пароля -->
        <form method="post" style="margin-top: 20px;">
            <h3>Сменить пароль</h3>
            <label for="password">Новый пароль:</label>
            <input type="password" id="password" name="password" required>
            <label for="confirm_password">Подтвердите пароль:</label>
            <input type="password" id="confirm_password" name="confirm_password" required>
            <button type="submit" name="update_password" class="btn">Обновить пароль</button>
        </form>

        <a href="dashboard.php" class="btn back-btn">Вернуться на дашборд</a>
    </div>
</body>
</html>
