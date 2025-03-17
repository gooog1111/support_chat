# Путь к корневой папке проекта (текущая директория)
$projectRoot = Get-Location

# Имя выходного файла
$outputFile = "$projectRoot\project_structure.txt"

# Исключаемые файлы (скрипт и конечный файл)
$excludedFiles = @("Export-ProjectStructure.ps1", "project_structure.txt")

# Расширения файлов, которые нужно пропускать (бинарные файлы)
$excludedExtensions = @(
    ".exe", ".dll", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico",  # Картинки
    ".mp3", ".wav", ".ogg", ".flac", ".aac",                          # Аудио
    ".mp4", ".avi", ".mkv", ".mov", ".wmv",                           # Видео
    ".zip", ".rar", ".7z", ".tar", ".gz",                             # Архивы
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",        # Документы
    ".ps1",                                                           # Скрипты PowerShell
    ".ttf", ".otf", ".woff", ".woff2", ".eot",                        # Шрифты
	".log"                                                            # log фвйлы
)

# Функция для рекурсивного обхода папок и записи структуры и содержимого
function Export-Structure {
    param (
        [string]$path,
        [string]$outputFile
    )

    # Получаем все файлы и папки в текущей директории
    $items = Get-ChildItem -Path $path -Recurse

    foreach ($item in $items) {
        # Пропускаем исключаемые файлы
        if ($excludedFiles -contains $item.Name) {
            continue
        }

        # Пропускаем файлы с исключаемыми расширениями
        if ($excludedExtensions -contains $item.Extension) {
            continue
        }

        # Заменяем локальный путь на пользовательский URL
        $customPath = $item.FullName -replace [regex]::Escape("C:\xampp\htdocs"), "mysite.my"

        # Записываем путь к файлу или папке
        Add-Content -Path $outputFile -Value "`n$customPath`n" -Encoding UTF8

        # Если это файл и он не в списке исключений, записываем его содержимое
        if ($item.PSIsContainer -eq $false) {
            Add-Content -Path $outputFile -Value "Содержимое файла $($item.Name):" -Encoding UTF8
            # Читаем содержимое файла с указанием кодировки UTF-8
            $fileContent = Get-Content -Path $item.FullName -Raw -Encoding UTF8
            Add-Content -Path $outputFile -Value $fileContent -Encoding UTF8
            Add-Content -Path $outputFile -Value "`n" -Encoding UTF8 # Добавляем пустую строку для разделения
        }
    }
}

# Очищаем выходной файл, если он существует
if (Test-Path $outputFile) {
    Clear-Content -Path $outputFile
}

# Записываем структуру и содержимое проекта
Export-Structure -path $projectRoot -outputFile $outputFile

# Выводим сообщение об успешном завершении
Write-Host "Структура и содержимое проекта успешно экспортированы в файл $outputFile"