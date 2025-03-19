# ���� � �������� ����� ������� (������� ����������)
$projectRoot = Get-Location

# ��� ��������� �����
$outputFile = "$projectRoot\project_structure.txt"

# ����������� ����� (������ � �������� ����)
$excludedFiles = @("Export-ProjectStructure.ps1", "project_structure.txt")

# ���������� ������, ������� ����� ���������� (�������� �����)
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

# ������������ ������ ����� � �� (30 �� = 30720 ����)
$maxFileSizeBytes = 30 * 1024

function Export-Structure {
    param (
        [string]$path,
        [string]$outputFile
    )

    $items = Get-ChildItem -Path $path -Recurse

    foreach ($item in $items) {
        # ������ ���� � �������
        $customPath = $item.FullName -replace [regex]::Escape("C:\xampp\htdocs"), "mysite.my"
        
        # ���������� ������ ������ � �������� ����
        if ($excludedFiles -contains $item.Name) { continue }

        # ���� ��� ����������
        $isFiltered = $false
        $filterReason = ""

        # �������� ������� ����������
        if ($excludedExtensions -contains $item.Extension) {
            $isFiltered = $true
            $filterReason = "[��������� �� ����������]"
        }
        elseif (-not $item.PSIsContainer -and $item.Length -gt $maxFileSizeBytes) {
            $isFiltered = $true
            $filterReason = "[��������� �� �������]"
        }

        # ������ � ����
        if ($isFiltered) {
            Add-Content -Path $outputFile -Value "`n$customPath $filterReason`n" -Encoding UTF8
        }
        else {
            Add-Content -Path $outputFile -Value "`n$customPath`n" -Encoding UTF8
            if (-not $item.PSIsContainer) {
                Add-Content -Path $outputFile -Value "���������� ����� $($item.Name):" -Encoding UTF8
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

Write-Host "��������� ������� ������� �������������� � ���� $outputFile"