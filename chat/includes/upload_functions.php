<?php
function handleFileUpload($file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return "Ошибка загрузки файла: " . $file['error'];
    }

    // Проверка размера файла
    if ($file['size'] > MAX_FILE_SIZE) {
        return "Размер файла превышает допустимые 5 МБ.";
    }

    // Проверка типа файла
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    $allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!in_array($mime, $allowedMimes)) {
        return "Недопустимый тип файла. Разрешены только JPG, PNG и GIF.";
    }

    // Генерация уникального имени файла
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid() . ".$ext";
    $dest = UPLOAD_DIR . $fileName;

    if (move_uploaded_file($file['tmp_name'], $dest)) {
        return '/chat/uploads/' . $fileName; // Возвращаем путь к файлу
    } else {
        return "Ошибка при загрузке файла.";
    }
}
?>