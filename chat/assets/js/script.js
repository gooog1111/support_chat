document.addEventListener('DOMContentLoaded', function () {
    const messageForm = document.getElementById('messageForm');
    const chatDiv = document.getElementById('messages');
    const submitButton = messageForm.querySelector('button[type="submit"]');
    let isSending = false; // Флаг для отслеживания состояния отправки

    // Функция для прокрутки вниз
    function scrollToBottom() {
        setTimeout(() => {
            chatDiv.scrollTop = chatDiv.scrollHeight;
        }, 0); // Задержка 0ms, чтобы выполнить после отрисовки
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

    // Функция для обновления чата
    function updateChat() {
        fetch('get_messages.php')
            .then(response => {
                if (!response.ok) {
                    // Если сессия не активна, пытаемся восстановить её
                    restoreSession();
                    throw new Error('Сессия не активна. Восстановление...');
                }
                return response.json();
            })
            .then(messages => {
                // Очищаем чат перед добавлением новых сообщений
                chatDiv.innerHTML = '';

                // Добавляем сообщения в чат
                messages.forEach(msg => {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add(msg.isAdmin ? 'admin' : 'client');
                    messageElement.innerHTML = `
                        <strong>${msg.isAdmin ? msg.adminName : 'Вы'}:</strong> 
                        ${msg.message}
                        ${msg.image ? `<br><img src="${msg.image}" alt="Изображение" style="max-width:200px;">` : ''}
                        <span class="time">${msg.time}</span>
                    `;
                    chatDiv.appendChild(messageElement);
                });

                // Автоматическая прокрутка вниз после добавления всех сообщений
                scrollToBottom();
            })
            .catch(error => {
                console.error('Ошибка при обновлении чата:', error);
                // Не показываем уведомление пользователю, просто логируем ошибку
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