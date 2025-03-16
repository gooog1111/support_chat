<?php
session_start();

// Уничтожаем только данные сессии администратора
session_unset(); // Очищаем данные текущей сессии
session_destroy(); // Уничтожаем сессию

// Перенаправляем на страницу входа
header("Location: login.php");
exit();
