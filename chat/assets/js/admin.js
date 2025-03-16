let currentChatId = null;
const chatContainer = document.getElementById('chat-container');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');

// Функция для прокрутки вниз
function scrollToBottom() {
    setTimeout(() => {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }, 100); // Задержка 100 мс
}

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
                chatMessages.innerHTML = messages.map(msg => `
                    <div class="${msg.isAdmin ? 'admin' : 'client'}">
                        <strong>${msg.isAdmin ? 'Администратор' : 'Клиент'}:</strong>
                        ${msg.message}
                        ${msg.image ? `<br><img src="${msg.image}" alt="Изображение" style="max-width:200px; cursor: pointer;">` : ''}
                        <span class="time">${msg.time}</span>
                    </div>
                `).join('');

                // Прокрутка вниз после обновления сообщений
                setTimeout(scrollToBottom, 100); // Задержка для корректной прокрутки
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
    console.log('Кнопка нажата'); // Шаг 1
    
    if (!confirm('Обновить имена компьютеров для всех чатов?')) {
        console.log('Действие отменено пользователем');
        return;
    }

    btn.classList.add('updating');
    const statusElement = document.createElement('div');
    statusElement.className = 'update-status';
    
    // Создаем прогресс-бар
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

    console.log('Отправка запроса...'); // Шаг 2
    
    fetch('update_hostnames.php?_=' + Date.now())
        .then(response => {
            console.log('Ответ получен, статус:', response.status); // Шаг 3
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            console.log('Данные ответа:', data); // Шаг 4
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
            console.error('Ошибка:', error); // Шаг 5
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
document.addEventListener('DOMContentLoaded', function () {
    setupChatItemListeners();

    chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        formData.append('chatId', currentChatId);

        fetch('send_message.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadChatMessages(currentChatId);
                    chatForm.reset();
                    setTimeout(scrollToBottom, 100); // Прокрутка вниз после отправки сообщения
                } else {
                    alert('Ошибка: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Ошибка при отправке сообщения:', error);
                alert('Ошибка при отправке сообщения. Проверьте консоль для подробностей.');
            });
    });

    // Получаем модальное окно и изображение внутри него
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('caption');
    const closeBtn = document.querySelector('.close');

    // Функция для открытия модального окна с изображением
    function openImageModal(imageSrc, altText) {
        modal.style.display = 'block';
        modalImg.src = imageSrc;
        captionText.innerHTML = altText || ''; // Подпись, если есть
    }

    // Закрытие модального окна при клике на крестик
    closeBtn.onclick = function () {
        modal.style.display = 'none';
    };

    // Закрытие модального окна при клике вне изображения
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Закрытие модального окна по клавише Escape
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    // Добавляем обработчик клика на все изображения в чате
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.addEventListener('click', function (event) {
            if (event.target.tagName === 'IMG') {
                openImageModal(event.target.src, event.target.alt);
            }
        });
    }
    setInterval(() => {
        if (currentChatId) {
            loadChatMessages(currentChatId);
        }
    }, 5000);

    setInterval(updateChatList, 10000);
});