<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/functions.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitizeInput($_POST['username']);
    $password = sanitizeInput($_POST['password']);

    // Проверка логина и пароля
    if (isset($ADMINS[$username]) && password_verify($password, $ADMINS[$username]['password'])) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['admin_name'] = $ADMINS[$username]['name'];
        $_SESSION['login_attempts'] = 0; // Сброс попыток

        header("Location: dashboard.php");
        exit();
    } else {
        // Обновление количества попыток
        $_SESSION['login_attempts'] = ($_SESSION['login_attempts'] ?? 0) + 1;

        if ($_SESSION['login_attempts'] >= 3) {
            $error = "Превышено количество попыток входа. Попробуйте позже.";
        } else {
            $remaining = 3 - $_SESSION['login_attempts'];
            $error = "Неверный логин или пароль. Осталось попыток: $remaining.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Вход для администратора</title>
    <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body>
    <div class="login-form">
        <h2>Вход для администратора</h2>
        <?php if (!empty($error)): ?>
            <p class="error"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>
        <form method="post">
            <label for="username">Логин:</label>
            <input type="text" id="username" name="username" required>

            <label for="password">Пароль:</label>
            <input type="password" id="password" name="password" required>

            <button type="submit">Войти</button>
        </form>
    </div>
</body>
</html>
