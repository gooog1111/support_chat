document.addEventListener('DOMContentLoaded', function () {
    const messageForm = document.getElementById('messageForm');
    const chatDiv = document.getElementById('messages');
    const submitButton = messageForm.querySelector('button[type="submit"]');
    const textarea = messageForm.querySelector('textarea[name="message"]');
    let isSending = false;
    let scrollTimeout;

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