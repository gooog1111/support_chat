# Путь к корневой папке проекта (текущая директория)
$projectRoot = Get-Location

# Имя выходного файла
$outputFile = "$projectRoot\project_structure.txt"

# Исключаемые файлы (скрипт и конечный файл)
$excludedFiles = @("Export-ProjectStructure.ps1", "project_structure.txt")

# Расширения файлов, которые нужно пропускать (бинарные файлы)
$excludedExtensions = @(
    ".exe", ".dll", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico",
    ".mp3", ".wav", ".ogg", ".flac", ".aac",
    ".mp4", ".avi", ".mkv", ".mov", ".wmv",
    ".zip", ".rar", ".7z", ".tar", ".gz",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".md",
    ".ps1",
    ".ttf", ".otf", ".woff", ".woff2", ".eot",
    ".log"
)

# Максимальный размер файла в КБ (30 КБ = 30720 байт)
$maxFileSizeBytes = 30 * 1024

function Export-Structure {
    param (
        [string]$path,
        [string]$outputFile
    )

    $items = Get-ChildItem -Path $path -Recurse

    foreach ($item in $items) {
        # Полный путь с заменой
        $customPath = $item.FullName -replace [regex]::Escape("C:\xampp\htdocs"), "mysite.my"
        
        # Пропускаем только скрипт и выходной файл
        if ($excludedFiles -contains $item.Name) { continue }

        # Флаг для фильтрации
        $isFiltered = $false
        $filterReason = ""

        # Проверка условий фильтрации
        if ($excludedExtensions -contains $item.Extension) {
            $isFiltered = $true
            $filterReason = "[Пропущено по расширению]"
        }
        elseif (-not $item.PSIsContainer -and $item.Length -gt $maxFileSizeBytes) {
            $isFiltered = $true
            $filterReason = "[Пропущено по размеру]"
        }

        # Запись в файл
        if ($isFiltered) {
            Add-Content -Path $outputFile -Value "`n$customPath $filterReason`n" -Encoding UTF8
        }
        else {
            Add-Content -Path $outputFile -Value "`n$customPath`n" -Encoding UTF8
            if (-not $item.PSIsContainer) {
                Add-Content -Path $outputFile -Value "Содержимое файла $($item.Name):" -Encoding UTF8
                $fileContent = Get-Content -Path $item.FullName -Raw -Encoding UTF8
                Add-Content -Path $outputFile -Value $fileContent -Encoding UTF8
                Add-Content -Path $outputFile -Value "`n"
            }
        }
    }
}

if (Test-Path $outputFile) {
    Clear-Content -Path $outputFile
}

Export-Structure -path $projectRoot -outputFile $outputFile

Write-Host "Структура проекта успешно экспортирована в файл $outputFile"