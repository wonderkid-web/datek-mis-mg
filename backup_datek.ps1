[CmdletBinding()]
param(
    # Ubah nilai ini jika file .env berada di lokasi lain, atau gunakan -EnvPath saat menjalankan.
    [string]$EnvPath = (Join-Path $PSScriptRoot '.env'),

    [int]$RetentionDays = 14,

    # Backup dianggap mencurigakan jika jumlah tabel berbeda lebih dari nilai ini.
    [int]$ExpectedTableCount = 65,
    [int]$TableCountTolerance = 5
)

$ErrorActionPreference = 'Stop'

$DbHost = '43.229.254.252'
$DbPort = 3306
$DbName = 'mahkotag_datek'
$DbUser = 'mahkotag_datek'

$BackupDirectory = Join-Path $PSScriptRoot 'backups'
$LogPath = Join-Path $BackupDirectory 'backup_log.txt'
$BackupFile = $null
$BackupSizeBytes = 0
$TableCount = 0
$Status = 'FAILED'
$FailureReason = $null
$PreviousMysqlPwd = [Environment]::GetEnvironmentVariable('MYSQL_PWD', 'Process')

function Find-Mysqldump {
    $candidates = New-Object System.Collections.Generic.List[string]

    $commonPatterns = @(
        'C:\Program Files\MySQL\MySQL Server *\bin\mysqldump.exe',
        'C:\Program Files (x86)\MySQL\MySQL Server *\bin\mysqldump.exe',
        'C:\xampp\mysql\bin\mysqldump.exe',
        'C:\laragon\bin\mysql\*\bin\mysqldump.exe'
    )

    foreach ($pattern in $commonPatterns) {
        Get-ChildItem -Path $pattern -File -ErrorAction SilentlyContinue |
            ForEach-Object { [void]$candidates.Add($_.FullName) }
    }

    foreach ($commandName in @('mysqldump', 'mysqldump.exe')) {
        $command = Get-Command $commandName -ErrorAction SilentlyContinue
        if ($null -ne $command -and $command.Source) {
            [void]$candidates.Add($command.Source)
        }
    }

    $found = $candidates | Sort-Object -Unique | Select-Object -First 1
    if ($null -eq $found) {
        throw @"
mysqldump.exe tidak ditemukan.
Install MySQL Client/MySQL Server, XAMPP, atau Laragon terlebih dahulu.
Pastikan mysqldump.exe berada di salah satu lokasi umum Windows atau sudah masuk PATH.
"@
    }

    return $found
}

function Read-DatabasePassword {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "File .env tidak ditemukan: $Path"
    }

    $line = Get-Content -LiteralPath $Path -ErrorAction Stop |
        Where-Object { $_ -match '^\s*DATEK_DB_PASSWORD\s*=' } |
        Select-Object -First 1

    if ($null -eq $line) {
        throw "Variabel DATEK_DB_PASSWORD tidak ditemukan di file .env: $Path"
    }

    $password = ($line -replace '^\s*DATEK_DB_PASSWORD\s*=\s*', '').Trim()

    if ($password.Length -ge 2) {
        $first = $password.Substring(0, 1)
        $last = $password.Substring($password.Length - 1, 1)
        if (($first -eq '"' -and $last -eq '"') -or ($first -eq "'" -and $last -eq "'")) {
            $password = $password.Substring(1, $password.Length - 2)
        }
    }

    if ([string]::IsNullOrWhiteSpace($password)) {
        throw 'DATEK_DB_PASSWORD kosong.'
    }

    return $password
}

function Quote-ProcessArgument {
    param([string]$Value)

    return '"' + $Value.Replace('"', '\"') + '"'
}

try {
    if ($RetentionDays -lt 0) {
        throw 'RetentionDays tidak boleh bernilai negatif.'
    }

    New-Item -ItemType Directory -Path $BackupDirectory -Force | Out-Null

    $mysqldumpPath = Find-Mysqldump
    $dbPassword = Read-DatabasePassword -Path $EnvPath

    $fileTimestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $BackupFile = Join-Path $BackupDirectory "datek_$fileTimestamp.sql"

    # Password dikirim melalui environment process, bukan sebagai argument command line.
    [Environment]::SetEnvironmentVariable('MYSQL_PWD', $dbPassword, 'Process')

    $arguments = @(
        "--host=$DbHost",
        "--port=$DbPort",
        "--user=$DbUser",
        '--single-transaction',
        '--routines',
        '--triggers',
        '--events',
        "--result-file=$(Quote-ProcessArgument $BackupFile)",
        $DbName
    )

    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = $mysqldumpPath
    $startInfo.Arguments = $arguments -join ' '
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardError = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo

    if (-not $process.Start()) {
        throw 'Gagal menjalankan mysqldump.exe.'
    }

    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    $exitCode = $process.ExitCode
    $process.Dispose()

    if ($exitCode -ne 0) {
        $details = $stderr.Trim()
        if ([string]::IsNullOrWhiteSpace($details)) {
            $details = 'Tidak ada pesan error dari mysqldump.'
        }
        throw "mysqldump gagal dengan exit code $exitCode. $details"
    }

    if (-not (Test-Path -LiteralPath $BackupFile -PathType Leaf)) {
        throw 'mysqldump selesai tanpa menghasilkan file backup.'
    }

    $backupItem = Get-Item -LiteralPath $BackupFile
    $BackupSizeBytes = $backupItem.Length
    if ($BackupSizeBytes -le 0) {
        throw 'File backup kosong.'
    }

    $lastFiveLines = @(Get-Content -LiteralPath $BackupFile -Tail 5 -ErrorAction Stop)
    $dumpCompleted = (($lastFiveLines -join "`n") -match '-- Dump completed')
    if (-not $dumpCompleted) {
        throw 'Teks "-- Dump completed" tidak ditemukan pada 5 baris terakhir file backup.'
    }

    $TableCount = @(Select-String -LiteralPath $BackupFile -Pattern '^\s*CREATE TABLE\b' -CaseSensitive:$false).Count
    $minimumTableCount = $ExpectedTableCount - $TableCountTolerance
    $maximumTableCount = $ExpectedTableCount + $TableCountTolerance
    if ($TableCount -lt $minimumTableCount -or $TableCount -gt $maximumTableCount) {
        throw "Jumlah CREATE TABLE ($TableCount) di luar kisaran yang diharapkan ($minimumTableCount-$maximumTableCount)."
    }

    $Status = 'SUCCESS'
}
catch {
    $FailureReason = $_.Exception.Message
    Write-Host "`nERROR: $FailureReason" -ForegroundColor Red
}
finally {
    if ($null -eq $PreviousMysqlPwd) {
        [Environment]::SetEnvironmentVariable('MYSQL_PWD', $null, 'Process')
    }
    else {
        [Environment]::SetEnvironmentVariable('MYSQL_PWD', $PreviousMysqlPwd, 'Process')
    }

    try {
        if (Test-Path -LiteralPath $BackupDirectory -PathType Container) {
            $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
            Get-ChildItem -LiteralPath $BackupDirectory -Filter 'datek_*.sql' -File -ErrorAction Stop |
                Where-Object { $_.LastWriteTime -lt $cutoffDate } |
                Remove-Item -Force -ErrorAction Stop
        }
    }
    catch {
        $retentionMessage = "Retensi gagal: $($_.Exception.Message)"
        if ([string]::IsNullOrWhiteSpace($FailureReason)) {
            $Status = 'FAILED'
            $FailureReason = $retentionMessage
        }
        else {
            $FailureReason = "$FailureReason $retentionMessage"
        }
        Write-Host "WARNING: $retentionMessage" -ForegroundColor Yellow
    }

    try {
        New-Item -ItemType Directory -Path $BackupDirectory -Force | Out-Null
        $logTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $sizeText = '{0:N0} bytes' -f $BackupSizeBytes
        $fileText = if ($null -eq $BackupFile) { '-' } else { $BackupFile }
        $reasonText = if ([string]::IsNullOrWhiteSpace($FailureReason)) { '' } else { " | detail=$FailureReason" }
        $logLine = "$logTimestamp | status=$Status | file=$fileText | size=$sizeText | tables=$TableCount$reasonText"
        Add-Content -LiteralPath $LogPath -Value $logLine -Encoding UTF8
    }
    catch {
        Write-Host "WARNING: Gagal menulis log: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    $sizeMb = $BackupSizeBytes / 1MB
    $displaySize = '{0:N2} MB ({1:N0} bytes)' -f $sizeMb, $BackupSizeBytes

    Write-Host "`n===== BACKUP DATEK =====" -ForegroundColor Cyan
    Write-Host "Path file : $(if ($null -eq $BackupFile) { '-' } else { $BackupFile })"
    Write-Host "Ukuran    : $displaySize"
    Write-Host "Tabel     : $TableCount CREATE TABLE"
    Write-Host "Status    : $Status" -ForegroundColor $(if ($Status -eq 'SUCCESS') { 'Green' } else { 'Red' })
    Write-Host "Log       : $LogPath"
}

if ($Status -eq 'SUCCESS') {
    exit 0
}
else {
    exit 1
}
