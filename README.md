# 💬 Чат технической поддержки (локальная сеть)

Простой и (не) безопасный чат для организации технической поддержки с разделением на клиентский и административный интерфейсы. Работает на **Apache** без использования БД и Node.js.
организуйте защиту данных сомастоятельно!
![Пример интерфейса](https://github.com/gooog1111/support_chat/blob/main/chat/assets/images/2025-03-17_06-42-01.png)

## 🚀 Особенности
- **Клиентская часть**  
  📤 Отправка сообщений и изображений  
  📅 История переписки  
  🔄 Автоматическое восстановление сессии
- **Административная панель**  
  🛠 Управление чатами (открытие/закрытие/очистка)  
  🔍 Просмотр метаданных клиентов (IP, имя ПК)  
  📊 Статусы чатов (Открыт, В работе, Закрыт)
- **Безопасность**  
  🔒 Защита от XSS и CSRF  
  🔑 Система сессий и авторизации  
  📁 Хранение данных в JSON-файлах
- **Адаптивность**  
  📱 Оптимизирован для мобильных устройств

## 📋 Требования
- **Сервер**: 
  - PHP 7.4+
  - Apache с модулями: 
    - `mod_rewrite` 
    - `mod_headers`
- **Права доступа**:
  ```bash
  chmod -R 755 chat/
  chown -R www-data:www-data chat/
  ```
⚙️ Установка
Скопируйте папку chat в корень веб-сервера:

```bash

cp -r chat/ /var/www/html/
Настройте виртуальный хост Apache:
```
```apache

<VirtualHost *:80>
    DocumentRoot /var/www/html/chat
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined

    <Directory "/var/www/html/chat">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```
Перезагрузите Apache:

```bash
systemctl reload apache2
```
🔑 Настройка администраторов
Отредактируйте файл includes/admins.php:

```php

'логин' => [
    'password' => password_hash('пароль', PASSWORD_DEFAULT),
    'name' => 'Имя администратора'
]
```
🖥 Использование
Клиентская часть: http://ваш-сервер/client/

Административная панель: http://ваш-сервер/admin/

Данные для входа по умолчанию:
Логин: admin1
Пароль: password

🔒 Рекомендации по безопасности
Регулярно обновляйте пароли администраторов.

Настройте .htaccess для ограничения доступа к /admin и /includes.

Используйте HTTPS в производственной среде.

Мониторьте логи: logs/error.log.

📂 Структура проекта

Директория	Описание

/admin	Панель управления

/client	Интерфейс клиента

/assets	Стили, скрипты и изображения

/chats	История сообщений

/clients	Данные клиентов

/uploads	Загруженные файлы

/includes	Системные скрипты и конфигурации

👥 Разработка

Автор: [gooog1111](https://github.com/gooog1111/)

Лицензия: MIT License


[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
```
---

> ⚠️ **Важно!** Перед использованием в продакшене проведите аудит безопасности и настройте HTTPS.
```
