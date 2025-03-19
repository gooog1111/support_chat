# 💬 Чат технической поддержки (локальная сеть)

## ⚠️ Внимание  
Этот файл прошел автоматическую редактуру.

---

Простой и (не очень) безопасный чат для организации технической поддержки с разделением на клиентский и административный интерфейсы. Работает на Apache, Nginx или IIS без использования БД и Node.js.

![Пример интерфейса поьзователя](https://github.com/gooog1111/support_chat/blob/main/chat/assets/images/client.png)

---

![Пример интерфейса администратора](https://github.com/gooog1111/support_chat/blob/main/chat/assets/images/admin.png)

---

## 🚀 Особенности
- **Клиентская часть**  
  - 📤 Отправка текста и изображений (до 5 МБ)
  - 📅 История переписки
  - 🕒 Группировка сообщений по времени (интервал 2 минуты)
  - 🔄 Автоматическое восстановление сессии  
  - 👤 Уникальный идентификатор сессии для каждого клиента
- **Административная панель**
  - 🎯 Динамическое обновление чатов (каждые 10 сек)
  - 🚦 Система статусов:
    - `🟢 Открыт` 
    - `🟡 В работе (Имя админа)`
    - `🔴 Закрыт`
  - 🛠 Управление чатами (открытие/закрытие/очистка)  
  - 🔍 Просмотр метаданных клиентов (IP, имя ПК, Kerberos)  
  - 📊 Статусы чатов (Открыт, В работе, Закрыт)  
  - 🔄 Автоматическое обновление списка чатов
- **Безопасность**  
  - 🔒 Защита от XSS и CSRF  
  - 🔑 Система сессий и авторизации  
  - 📁 Хранение данных в JSON-файлах  
  - 🔄 Регулярная очистка неактивных сессий
- **Адаптивность**  
  - 📱 Оптимизирован для мобильных устройств

## ⚙️ Требования к серверу
### Обязательные компоненты
| Компонент       | Минимальная версия | 
|-----------------|--------------------|
| PHP             | 7.4+              |
| Веб-сервер      | Apache/Nginx/IIS  | 

### Необходимые модули PHP
```bash
sudo apt install php7.4-fileinfo php7.4-json php7.4-session  # Для Linux
```
- **Веб-сервер**: Apache, Nginx или IIS  
- **Права на запись** для папок: `uploads/`, `chats/`, `clients/`, `logs/`  

---

## ⚙️ Установка

### 🪟 Windows  
#### Для IIS:  
1. Установите [PHP для Windows](https://windows.php.net/download/) и добавьте путь к PHP в переменную `PATH`.  
2. В **Диспетчере IIS**:  
   - Создайте сайт с корневой папкой проекта.  
   - Настройте обработчик `*.php` на `php-cgi.exe`.  
3. Настройте права:  
   ```powershell  
   icacls "C:\путь_к_проекту" /grant IIS_IUSRS:(OI)(CI)F  
   ```
#### Для Apache (через XAMPP/WAMP):  
1. Скопируйте папку `chat` в `htdocs/`.  
2. Добавьте виртуальный хост:  
   ```apache  
   <VirtualHost *:80>  
       DocumentRoot "C:/xampp/htdocs/chat"  
       ServerName chat.local  
       <Directory "C:/xampp/htdocs/chat">  
           AllowOverride All  
           Require all granted  
       </Directory>  
   </VirtualHost>  
   ```
3. Перезапустите Apache.

---

### 🐧 Linux  
#### Apache:  
1. Установите пакеты:  
   ```bash  
   sudo apt install apache2 php libapache2-mod-php php-fileinfo  
   ```
2. Разместите проект в `/var/www/html/chat`.  
3. Настройте виртуальный хост:  
   ```apache  
   <VirtualHost *:80>  
       DocumentRoot /var/www/html/chat  
       ServerName chat.local  
       <Directory "/var/www/html/chat">  
           Options FollowSymLinks  
           AllowOverride All  
           Require all granted  
       </Directory>  
   </VirtualHost>
   
4. Настройте права:  
   ```bash  
   sudo chown -R www-data:www-data /var/www/html/chat/  
   ```
#### Nginx:  
1. Установите пакеты:  
   ```bash  
   sudo apt install nginx php-fpm php-fileinfo
   ```
2. Добавьте конфигурацию:  
   ```nginx  
   server {  
       listen 80;  
       root /var/www/html/chat;  
       index index.php;  
       
       location / {  
           try_files $uri $uri/ /index.php?$args;  
       }  
       
       location ~ \.php$ {  
           include snippets/fastcgi-php.conf;  
           fastcgi_pass unix:/run/php/php7.4-fpm.sock;  
       }  
   }  
   ```
---

## 🔍 Проверка работоспособности  
1. Создайте файл `info.php` в корне проекта:  
   
   ```php
   <?php phpinfo(); ?>
   ```
   
2. Откройте его в браузере. Убедитесь, что активны модули:  
   - fileinfo  
   - json  
   - session  

---

## 🔑 Настройка администраторов

Отредактируйте файл `includes/admins.php`:

```php
'логин' => [
    'password' => password_hash('пароль', PASSWORD_DEFAULT),
    'name' => 'Имя администратора'
]
```
---
## 🛡️ Рекомендации по безопасности
### Критически важные меры
1. **HTTPS** (настройка для Apache)
```apache
<VirtualHost *:443>
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/chat.crt
    SSLCertificateKeyFile /etc/ssl/private/chat.key
</VirtualHost>
```
3. **Очистка неактивных сессий** (Cron):
```bash
0 3 * * * find /path/to/clients/ -type f -mtime +1 -delete
```
5. **Резервное копирование**:
```bash
tar -czvf chat_backup_$(date +\%F).tar.gz chats/ clients/ uploads/
```
---
## 🖥 Использование
- **Клиентская часть**: http://ваш-сервер/chat/client/
- **Административная панель**: http://ваш-сервер/chat/admin/

## 📂 Структура проекта
```
chat/
├── admin/               # Панель администратора
│   ├── clear_chat.php   # Очистка чата
│   ├── close_chat.php   # Закрытие чата
│   ├── dashboard.php    # Основная панель управления
│   ├── get_chat_list.php# Получение списка чатов
│   ├── get_messages.php # Получение сообщений чата
│   ├── index.php        # Перенаправление на страницу входа
│   ├── login.php        # Страница входа для администратора
│   ├── logout.php       # Выход из системы
│   ├── send_message.php # Отправка сообщений от администратора
│   ├── update_chat_status.php # Обновление статуса чата
│   ├── update_hostnames.php   # Обновление имен ПК клиентов
│   └── update_profile.php     # Обновление профиля администратора
├── admin_online/        # Файлы для отслеживания онлайн-статуса администраторов
    ├── index.php        # Защита от прямого доступа
├── assets/              # Ресурсы проекта (стили, скрипты, изображения)
│   ├── css/             # Стили
│   │   ├── admin.css    # Стили для административной панели
│   │   ├── all.min.css  # Минифицированные стили (например, FontAwesome)
│   │   ├── index.php    # Защита от прямого доступа
│   │   └── styles.css   # Основные стили для клиентской части
│   ├── images/          # Изображения
│   │   └── index.php    # Защита от прямого доступа
│   ├── js/              # JavaScript-скрипты
│   │   ├── admin.js     # Скрипты для административной панели
│   │   ├── index.php    # Защита от прямого доступа
│   │   └── script.js    # Скрипты для клиентской части
│   ├── webfonts/        # Шрифты
│   │   └── index.php    # Защита от прямого доступа
│   └── index.php        # Защита от прямого доступа
├── chats/               # История сообщений (JSON-файлы)
│   └── index.php        # Защита от прямого доступа
├── client/              # Клиентская часть
│   ├── get_messages.php # Получение сообщений для клиента
│   ├── get_online_admins.php # Получение количества онлайн-администраторов
│   ├── index.php        # Основной интерфейс клиента
│   ├── restore_session.php # Восстановление сессии клиента
│   └── send_message.php # Отправка сообщений от клиента
├── clients/             # Данные о клиентах (JSON-файлы)
│   └── index.php        # Защита от прямого доступа
├── includes/            # Системные скрипты и конфигурации
│   ├── admins.php       # Данные администраторов (логины, пароли, имена)
│   ├── config.php       # Основные настройки проекта
│   ├── functions.php    # Вспомогательные функции (санитизация, CSRF-токены)
│   ├── index.php        # Защита от прямого доступа
│   ├── session.php      # Управление сессиями
│   ├── storage.php      # Функции для работы с данными (сохранение, обновление)
│   └── upload_functions.php # Функции для загрузки файлов
├── logs/                # Логи ошибок
│   ├── error.log        # Файл логов
│   └── index.php        # Защита от прямого доступа
├── uploads/             # Загруженные файлы (изображения)
│   └── index.php        # Защита от прямого доступа
└── index.php            # Главный файл для перенаправления на клиентскую часть
```
---

## 👥 Разработка

Автор: [gooog1111](https://github.com/gooog1111/)

Лицензия: MIT License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

> ⚠️ **Важно!** Перед использованием в продакшене проведите аудит безопасности и настройте HTTPS.

