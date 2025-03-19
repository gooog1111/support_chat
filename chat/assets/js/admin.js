let currentChatId = null;
const chatContainer = document.getElementById('chat-container');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const textarea = chatForm.querySelector('textarea[name="message"]');

// 1. Функция для прокрутки вниз
function scrollToBottom() {
    setTimeout(() => {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }, 100); // Задержка 100 мс
}

// 2. Обработчик отправки формы
const handleSubmit = async function (event) {
    event.preventDefault(); // Предотвращаем стандартное поведение формы
    if (!currentChatId) {
        alert('Выберите чат для отправки сообщения.');
        return;
    }

    const formData = new FormData(chatForm);
    formData.append('chatId', currentChatId);

    try {
        const response = await fetch('send_message.php', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (data.success) {
            chatForm.reset();
            loadChatMessages(currentChatId);
            scrollToBottom();
        } else {
            alert('Ошибка: ' + data.error);
        }
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        alert('Ошибка при отправке сообщения. Проверьте консоль для подробностей.');
    }
};

// 3. Обработчик Enter (без Shift)
textarea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Предотвращаем перенос строки
        handleSubmit(e); // Имитируем отправку формы
    }
});

// 4. Обработчик отправки формы
chatForm.addEventListener('submit', handleSubmit);

// 5. Остальной код (без изменений)
function setupChatItemListeners() {
    document.querySelectorAll('.chat-item').forEach(chatItem => {
        chatItem.addEventListener('click', function () {
            currentChatId = this.getAttribute('data-chat-id');
            chatContainer.style.display = 'block';
            loadChatMessages(currentChatId);
        });
    });
}

function loadChatMessages(chatId) {
    fetch(`get_messages.php?id=${chatId}`)
        .then(response => response.json())
        .then(messages => {
            if (chatMessages) {
                const isNearBottom = chatMessages.scrollHeight - chatMessages.scrollTop <= chatMessages.clientHeight + 100;

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
                            senderName: msg.isAdmin ? msg.adminName : 'Пользователь:',
                            messages: [msg]
                        });
                    }

                    lastSender = msg.isAdmin ? 'admin' : 'client';
                    lastTime = currentTime;
                });

                chatMessages.innerHTML = '';

                groupedMessages.forEach(group => {
                    const groupContainer = document.createElement('div');
                    groupContainer.classList.add('message-group', group.sender);

                    const senderNameElement = document.createElement('div');
                    senderNameElement.classList.add('sender-name');
                    senderNameElement.textContent = group.senderName;
                    groupContainer.appendChild(senderNameElement);

                    group.messages.forEach((msg, index) => {
                        const messageElement = document.createElement('div');
                        messageElement.classList.add('message');
                        messageElement.innerHTML = `
                            <div class="message-content">${msg.message}</div>
                            ${msg.image ? `<br><img src="${msg.image}" alt="Изображение" style="max-width:200px; cursor: pointer;">` : ''}
                        `;

                        if (index === group.messages.length - 1) {
                            const timeElement = document.createElement('span');
                            timeElement.classList.add('time');
                            timeElement.textContent = msg.time;
                            messageElement.appendChild(timeElement);
                        }

                        groupContainer.appendChild(messageElement);
                    });

                    chatMessages.appendChild(groupContainer);
                });

                if (isNearBottom) {
                    setTimeout(() => {
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 100);
                }
            }
            updateChatList();
        })
        .catch(error => {
            console.error('Ошибка при загрузке сообщений:', error);
            alert('Ошибка при загрузке сообщений. Проверьте консоль для подробностей.');
        });
}

function updateChatList() {
    fetch('get_chat_list.php')
        .then(response => response.text())
        .then(html => {
            document.querySelector('.chat-list').innerHTML = html;
            setupChatItemListeners();
        })
        .catch(error => {
            console.error('Ошибка при обновлении списка чатов:', error);
        });
}

function closeChat() {
    if (!currentChatId) {
        alert('Выберите чат для закрытия.');
        return;
    }
    fetch(`close_chat.php?id=${currentChatId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateChatList();
            } else {
                alert('Ошибка: ' + data.error);
            }
        });
}

function clearChat() {
    if (!currentChatId) {
        alert('Выберите чат для очистки.');
        return;
    }
    fetch(`clear_chat.php?id=${currentChatId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateChatList();
            } else {
                alert('Ошибка: ' + data.error);
            }
        });
}

function updateChatStatus(status, adminName) {
    if (!currentChatId) {
        alert('Выберите чат для обновления статуса.');
        return;
    }
    fetch(`update_chat_status.php?id=${currentChatId}&status=${status}&admin=${adminName}`, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateChatList();
            } else {
                alert('Ошибка: ' + data.error);
            }
        });
}

function updateHostnames() {
    const btn = document.querySelector('.btn-warning');
    console.log('Кнопка нажата');

    if (!confirm('Обновить имена компьютеров для всех чатов?')) {
        console.log('Действие отменено пользователем');
        return;
    }

    btn.classList.add('updating');
    const statusElement = document.createElement('div');
    statusElement.className = 'update-status';

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: 250px; 
        height: 8px;
        background: #eee;
        border-radius: 4px;
        margin: 10px 0;
        overflow: hidden;
    `;

    const progressFill = document.createElement('div');
    progressFill.style.cssText = `
        width: 0%;
        height: 100%;
        background: #3498db;
        transition: width 0.3s ease;
    `;

    progressBar.appendChild(progressFill);
    statusElement.appendChild(progressBar);
    document.body.appendChild(statusElement);

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress = Math.min(progress + Math.random() * 10, 90);
        progressFill.style.width = `${progress}%`;
    }, 300);

    console.log('Отправка запроса...');

    fetch('update_hostnames.php?_=' + Date.now())
        .then(response => {
            console.log('Ответ получен, статус:', response.status);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            console.log('Данные ответа:', data);
            progressFill.style.width = '100%';
            progressFill.style.background = '#2ecc71';

            statusElement.innerHTML += `
                <div class="success-alert">
                    ✔️ ${data}
                    <button onclick="this.parentElement.remove()" class="close-btn">&times;</button>
                </div>`;

            updateChatList();
        })
        .catch(error => {
            console.error('Ошибка:', error);
            progressFill.style.background = '#e74c3c';
            statusElement.innerHTML += `
                <div class="error-alert">
                    ❌ Ошибка: ${error.message}
                    <button onclick="this.parentElement.remove()" class="close-btn">&times;</button>
                </div>`;
        })
        .finally(() => {
            clearInterval(progressInterval);
            btn.classList.remove('updating');
            setTimeout(() => {
                statusElement.remove();
            }, 5000);
        });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function () {
    setupChatItemListeners();

    // Модальное окно для изображений
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close');

    chatMessages.addEventListener('click', function (event) {
        if (event.target.tagName === 'IMG') {
            modal.style.display = 'block';
            modalImg.src = event.target.src;
        }
    });

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    };
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    setInterval(() => {
        if (currentChatId) {
            loadChatMessages(currentChatId);
        }
    }, 5000);

    setInterval(updateChatList, 10000);
});