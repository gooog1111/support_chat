document.addEventListener('DOMContentLoaded', function () {
    const messageForm = document.getElementById('messageForm');
    const chatDiv = document.getElementById('messages');
    const submitButton = messageForm.querySelector('button[type="submit"]');
    let isSending = false; // Флаг для отслеживания состояния отправки

    // Функция для прокрутки вниз
function scrollToBottom() {
    const chatDiv = document.getElementById('messages');
    if (chatDiv) {
        chatDiv.scrollTo({
            top: chatDiv.scrollHeight,
            behavior: 'smooth' // Плавная прокрутка
        });
    }
}

    // Функция для восстановления сессии
    function restoreSession() {
        const clientName = localStorage.getItem('clientName');
        if (clientName) {
            fetch(`restore_session.php?name=${encodeURIComponent(clientName)}`)
                .then(response => {
                    if (response.ok) {
                        // Сессия восстановлена, обновляем чат
                        updateChat();
                    } else {
                        console.error('Ошибка при восстановлении сессии');
                    }
                })
                .catch(error => {
                    console.error('Ошибка при восстановлении сессии:', error);
                });
        }
    }

    // Обработка отправки формы
    messageForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Отменяем стандартное поведение формы

        if (isSending) return; // Если отправка уже идет, прерываем выполнение
        isSending = true; // Устанавливаем флаг отправки
        submitButton.disabled = true; // Отключаем кнопку отправки

        const messageInput = messageForm.querySelector('textarea');
        const fileInput = messageForm.querySelector('input[type="file"]');

        // Проверка на пустое сообщение и отсутствие изображения
        if (!messageInput.value.trim() && !fileInput.files.length) {
            alert('Пожалуйста, введите сообщение или выберите изображение.');
            isSending = false; // Сбрасываем флаг отправки
            submitButton.disabled = false; // Включаем кнопку отправки
            return; // Прерываем отправку, если нет текста и изображения
        }

        const formData = new FormData(messageForm); // Собираем данные формы

        try {
            const response = await fetch('send_message.php', {
                method: 'POST',
                body: formData
            });

            // Проверка, что ответ является JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Ожидался JSON, но получен: ${text}`);
            }

            const data = await response.json();

            if (data.success) {
                // Очищаем поле ввода и файловое поле
                messageInput.value = '';
                fileInput.value = '';

                // Обновляем чат после успешной отправки
                updateChat();
            } else {
                console.error(data.error);
                alert('Ошибка при отправке сообщения: ' + data.error);
            }
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            alert('Произошла ошибка при отправке сообщения: ' + error.message);
        } finally {
            isSending = false; // Сбрасываем флаг отправки
            submitButton.disabled = false; // Включаем кнопку отправки
        }
    });
const messageInput = messageForm.querySelector('textarea[name="message"]');
    if (messageInput) {
        messageInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Предотвращаем перенос строки
                messageForm.dispatchEvent(new Event('submit')); // Имитируем отправку формы
            }
        });
    }
    // Функция для обновления чата
function updateChat() {
    fetch('get_messages.php')
        .then(response => {
            if (!response.ok) {
                restoreSession();
                throw new Error('Сессия не активна. Восстановление...');
            }
            return response.json();
        })
        .then(messages => {
            // Сохраняем текущую позицию прокрутки
            const isNearBottom = chatDiv.scrollHeight - chatDiv.scrollTop <= chatDiv.clientHeight + 100;

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

            // Очищаем чат перед добавлением новых сообщений
            chatDiv.innerHTML = '';

            // Добавляем сгруппированные сообщения в чат
            groupedMessages.forEach(group => {
                const groupContainer = document.createElement('div');
                groupContainer.classList.add('message-group', group.sender);

                // Добавляем имя отправителя в начале блока
                const senderNameElement = document.createElement('div');
                senderNameElement.classList.add('sender-name');
                senderNameElement.textContent = group.senderName;
                groupContainer.appendChild(senderNameElement);

                // Добавляем сообщения
                group.messages.forEach((msg, index) => {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('message');
                    messageElement.innerHTML = `
                        <div class="message-content">${msg.message}</div>
                        ${msg.image ? `<br><img src="${msg.image}" alt="Изображение" style="max-width:200px;">` : ''}
                    `;

                    // Добавляем время только под последним сообщением в блоке
                    if (index === group.messages.length - 1) {
                        const timeElement = document.createElement('span');
                        timeElement.classList.add('time');
                        timeElement.textContent = msg.time;
                        messageElement.appendChild(timeElement);
                    }

                    groupContainer.appendChild(messageElement);
                });

                chatDiv.appendChild(groupContainer);
            });

            // Прокрутка вниз только если пользователь уже находится внизу
            if (isNearBottom) {
                setTimeout(scrollToBottom, 100); // Плавная прокрутка
            }
        })
        .catch(error => {
            console.error('Ошибка при обновлении чата:', error);
        });
}

    // Обновляем чат каждые 10 секунд (увеличенный интервал для снижения нагрузки)
    setInterval(updateChat, 10000);

    // Первоначальная загрузка чата и прокрутка вниз
    updateChat();
    scrollToBottom();
});
function updateOnlineAdmins() {
            fetch('get_online_admins.php')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('onlineAdmins').textContent = data.online;
                })
                .catch(error => console.error('Ошибка:', error));
        }
        setInterval(updateOnlineAdmins, 10000);
        updateOnlineAdmins();
// Добавить в конец файла
document.addEventListener('DOMContentLoaded', function() {
    // Функционал модального окна
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById("modalImage");
    const span = document.getElementsByClassName("close")[0];

    // Открытие изображения
    document.getElementById('messages').addEventListener('click', function(e) {
        if (e.target.tagName === 'IMG') {
            modal.style.display = "block";
            modalImg.src = e.target.src;
        }
    });

    // Закрытие модального окна
    span.onclick = function() { 
        modal.style.display = "none";
    }
    
    // Закрытие при клике вне изображения
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
        }
    });
});