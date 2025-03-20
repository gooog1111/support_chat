document.addEventListener('DOMContentLoaded', function () {
    const messageForm = document.getElementById('messageForm');
    const chatDiv = document.getElementById('messages');
    const submitButton = messageForm.querySelector('button[type="submit"]');
    const textarea = messageForm.querySelector('textarea[name="message"]');
    let isSending = false;
    let scrollTimeout;

    // Массив для хранения идентификаторов обработанных сообщений
    let processedMessages = [];

    // Переменная для хранения разрешения на уведомления и звук
    let notificationsEnabled = false;

    // Проверка поддержки уведомлений
    if (!("Notification" in window)) {
        console.log("Браузер не поддерживает уведомления.");
    }

    // Функция для воспроизведения звука
    function playNotificationSound() {
        if (notificationsEnabled) {
            const audio = new Audio('../assets/sounds/notification.mp3');
            audio.play().catch(error => {
                console.error("Ошибка воспроизведения звука:", error);
            });
        }
    }

    // Функция для показа уведомления на рабочем столе
    function showDesktopNotification(message) {
        if (notificationsEnabled && Notification.permission === "granted") {
            new Notification("Новое сообщение от администратора", {
                body: message,
                icon: '../assets/images/notification-icon.png' // Иконка уведомления
            });
        }
    }

    // Отслеживание активности вкладки
    let isTabActive = true;

    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    // Функция для обработки новых сообщений
    function handleNewMessage(msg) {
        // Генерация уникального идентификатора сообщения (например, время + текст)
        const messageId = `${msg.time}-${msg.message}`;

        // Проверка, было ли сообщение уже обработано
        if (!processedMessages.includes(messageId)) {
            processedMessages.push(messageId); // Добавляем сообщение в список обработанных
            if (msg.isAdmin && !isTabActive) {
                playNotificationSound();
                showDesktopNotification(msg.message);
            }
        }
    }

    // Показ модального окна с предложением разрешить уведомления и звук
    function showNotificationPermissionModal() {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = '#2c3e50'; // Темный фон, как в чате
        modal.style.padding = '20px';
        modal.style.borderRadius = '12px';
        modal.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'; // Тень, как в чате
        modal.style.zIndex = '1000';
        modal.style.textAlign = 'center';
        modal.style.width = '320px'; // Фиксированная ширина
        modal.style.fontFamily = 'Arial, sans-serif';
        modal.style.color = '#ecf0f1'; // Светлый текст
        modal.style.border = '1px solid rgba(255, 255, 255, 0.1)'; // Граница

        modal.innerHTML = `
            <h3 style="margin: 0 0 15px; font-size: 18px; color: #ecf0f1;">Разрешить уведомления?</h3>
            <p style="margin: 0 0 20px; font-size: 14px; color: #bdc3c7;">Вы будете получать уведомления на рабочий стол о новых сообщениях от администратора.</p>
            <div style="display: flex; justify-content: space-between; gap: 10px;">
                <button id="allowNotifications" style="flex: 1; padding: 10px 20px; background-color: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; transition: background-color 0.3s;">Да</button>
                <button id="denyNotifications" style="flex: 1; padding: 10px 20px; background-color: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; transition: background-color 0.3s;">Нет</button>
            </div>
        `;

        // Добавляем hover-эффекты для кнопок
        const allowButton = modal.querySelector('#allowNotifications');
        const denyButton = modal.querySelector('#denyNotifications');

        allowButton.addEventListener('mouseenter', () => {
            allowButton.style.backgroundColor = '#2ecc71';
        });
        allowButton.addEventListener('mouseleave', () => {
            allowButton.style.backgroundColor = '#27ae60';
        });

        denyButton.addEventListener('mouseenter', () => {
            denyButton.style.backgroundColor = '#c0392b';
        });
        denyButton.addEventListener('mouseleave', () => {
            denyButton.style.backgroundColor = '#e74c3c';
        });

        // Обработка нажатия на кнопку "Да"
        allowButton.addEventListener('click', () => {
            notificationsEnabled = true;
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Уведомления разрешены.");
                }
            });
            document.body.removeChild(modal);
        });

        // Обработка нажатия на кнопку "Нет"
        denyButton.addEventListener('click', () => {
            notificationsEnabled = false;
            document.body.removeChild(modal);
        });

        document.body.appendChild(modal);
    }

    // Показываем модальное окно при загрузке страницы
    showNotificationPermissionModal();

    // 1. Полностью отключаем стандартное поведение формы
    messageForm.onsubmit = function (e) {
        e.preventDefault();
        return false;
    };

    // 2. Обработчик для кнопки и Enter
    const handleSubmit = async function (event) {
        event.preventDefault();
        if (isSending) return;

        isSending = true;
        submitButton.disabled = true;

        try {
            const formData = new FormData(messageForm);
            const response = await fetch('send_message.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (data.success) {
                messageForm.reset();
                await updateChat(true); // Принудительная прокрутка только после отправки
            } else {
                alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка сети');
        } finally {
            isSending = false;
            submitButton.disabled = false;
        }
    };

    // 3. Единый обработчик для всех способов отправки
    messageForm.addEventListener('submit', handleSubmit);
    textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
    });

    // 4. Улучшенная функция обновления чата с группировкой сообщений
    async function updateChat(forceScroll = false) {
        try {
            const response = await fetch('get_messages.php', {
                credentials: 'same-origin'
            });

            if (!response.ok) {
                restoreSession();
                return;
            }

            const messages = await response.json();
            const wasNearBottom = chatDiv.scrollHeight - chatDiv.scrollTop <= chatDiv.clientHeight + 100;

            // Группировка сообщений
            let groupedMessages = [];
            let lastSender = null;
            let lastTime = null;

            messages.forEach(msg => {
                const currentTime = new Date(msg.time).getTime();
                const isSameSender = lastSender === (msg.isAdmin ? 'admin' : 'client');
                const isWithinTimeFrame = lastTime && (currentTime - lastTime) < 120000; // 2 минуты

                if (isSameSender && isWithinTimeFrame) {
                    groupedMessages[groupedMessages.length - 1].messages.push(msg);
                } else {
                    groupedMessages.push({
                        sender: msg.isAdmin ? 'admin' : 'client',
                        senderName: msg.isAdmin ? msg.adminName : 'Вы',
                        messages: [msg]
                    });
                }

                // Обработка новых сообщений от администратора
                if (msg.isAdmin) {
                    handleNewMessage(msg);
                }

                lastSender = msg.isAdmin ? 'admin' : 'client';
                lastTime = currentTime;
            });

            // Отрисовка сообщений
            chatDiv.innerHTML = groupedMessages.map(group => `
                <div class="message-group ${group.sender}">
                    <div class="sender-name">${group.senderName}</div>
                    ${group.messages.map((msg, index) => `
                        <div class="message">
                            <div class="message-content">${msg.message}</div>
                            ${msg.image ? `<img src="${msg.image}" style="max-width:200px;">` : ''}
                            ${index === group.messages.length - 1 ? `<span class="time">${msg.time}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('');

            // Умная прокрутка
            if (forceScroll || wasNearBottom) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    chatDiv.scrollTo({
                        top: chatDiv.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        } catch (error) {
            console.error('Ошибка обновления:', error);
        }
    }

    // 5. Функция восстановления сессии
    function restoreSession() {
        const clientName = localStorage.getItem('clientName');
        if (clientName) {
            fetch(`restore_session.php?name=${encodeURIComponent(clientName)}`, {
                credentials: 'same-origin'
            })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/chat/client'; // Редирект
                    }
                })
                .catch(error => {
                    console.error('Ошибка восстановления:', error);
                });
        }
    }

    // 6. Функция обновления онлайн-админов
    function updateOnlineAdmins() {
        fetch('get_online_admins.php', {
            credentials: 'same-origin'
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('onlineAdmins').textContent = data.online;
            })
            .catch(error => console.error('Ошибка:', error));
    }

    // 7. Модальное окно для изображений
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById("modalImage");
    const span = document.getElementsByClassName("close")[0];

    chatDiv.addEventListener('click', function (e) {
        if (e.target.tagName === 'IMG') {
            modal.style.display = "block";
            modalImg.src = e.target.src;
        }
    });

    span.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = "none";
    };
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
        }
    });

    // Инициализация
    updateChat();
    updateOnlineAdmins();
    setInterval(() => updateChat(false), 10000); // Обновление чата без прокрутки
    setInterval(updateOnlineAdmins, 10000); // Обновление онлайн-админов
});