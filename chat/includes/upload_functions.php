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
        // Установка прав в зависимости от ОС
        $os = PHP_OS_FAMILY;
        
        if ($os === 'Windows') {
            // Для Windows: полный доступ через icacls
            $command = 'icacls "' . $dest . '" /grant IIS_IUSRS:(F)';
            exec($command, $output, $returnCode);
            
            if ($returnCode !== 0) {
                error_log("Windows: Ошибка установки прав: " . implode("\n", $output));
            }
        } elseif ($os === 'Linux') {
            // Для Linux: устанавливаем права 0644 (rw-r--r--)
            if (!chmod($dest, 0644)) {
                error_log("Linux: Ошибка установки прав для файла: " . $dest);
            }
            
            // Дополнительно: меняем владельца (требует прав sudo)
            // $webUser = 'www-data'; // Пользователь веб-сервера
            // if (!chown($dest, $webUser)) {
            //     error_log("Linux: Ошибка смены владельца для файла: " . $dest);
            // }
        }

        return '/chat/uploads/' . $fileName;
    } else {
        return "Ошибка при загрузке файла.";
    }
}
?>