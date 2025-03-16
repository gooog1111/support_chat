# ���� � �������� ����� ������� (������� ����������)
$projectRoot = Get-Location

# ��� ��������� �����
$outputFile = "$projectRoot\project_structure.txt"

# ����������� ����� (������ � �������� ����)
$excludedFiles = @("Export-ProjectStructure.ps1", "project_structure.txt")

# ���������� ������, ������� ����� ���������� (�������� �����)
$excludedExtensions = @(
    ".exe", ".dll", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico",  # ��������
    ".mp3", ".wav", ".ogg", ".flac", ".aac",                          # �����
    ".mp4", ".avi", ".mkv", ".mov", ".wmv",                           # �����
    ".zip", ".rar", ".7z", ".tar", ".gz",                             # ������
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",        # ���������
    ".ps1",                                                           # ������� PowerShell
    ".ttf", ".otf", ".woff", ".woff2", ".eot",                        # ������
	".log"                                                            # log �����
)

# ������� ��� ������������ ������ ����� � ������ ��������� � �����������
function Export-Structure {
    param (
        [string]$path,
        [string]$outputFile
    )

    # �������� ��� ����� � ����� � ������� ����������
    $items = Get-ChildItem -Path $path -Recurse

    foreach ($item in $items) {
        # ���������� ����������� �����
        if ($excludedFiles -contains $item.Name) {
            continue
        }

        # ���������� ����� � ������������ ������������
        if ($excludedExtensions -contains $item.Extension) {
            continue
        }

        # �������� ��������� ���� �� ���������������� URL
        $customPath = $item.FullName -replace [regex]::Escape("C:\xampp\htdocs"), "mysite.my"

        # ���������� ���� � ����� ��� �����
        Add-Content -Path $outputFile -Value "`n$customPath`n" -Encoding UTF8

        # ���� ��� ���� � �� �� � ������ ����������, ���������� ��� ����������
        if ($item.PSIsContainer -eq $false) {
            Add-Content -Path $outputFile -Value "���������� ����� $($item.Name):" -Encoding UTF8
            # ������ ���������� ����� � ��������� ��������� UTF-8
            $fileContent = Get-Content -Path $item.FullName -Raw -Encoding UTF8
            Add-Content -Path $outputFile -Value $fileContent -Encoding UTF8
            Add-Content -Path $outputFile -Value "`n" -Encoding UTF8 # ��������� ������ ������ ��� ����������
        }
    }
}

# ������� �������� ����, ���� �� ����������
if (Test-Path $outputFile) {
    Clear-Content -Path $outputFile
}

# ���������� ��������� � ���������� �������
Export-Structure -path $projectRoot -outputFile $outputFile

# ������� ��������� �� �������� ����������
Write-Host "��������� � ���������� ������� ������� �������������� � ���� $outputFile"