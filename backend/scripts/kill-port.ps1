# Simple PowerShell script to kill processes using port 5001
param([int]$Port = 5001)

Write-Host "Checking for processes using port $Port..." -ForegroundColor Cyan

# Find and kill processes using the port
$processes = netstat -ano | findstr ":$Port"

if ($processes) {
    Write-Host "Found processes using port ${Port}:" -ForegroundColor Yellow
    Write-Host $processes -ForegroundColor Gray
    
    # Extract PIDs and kill them
    $pids = $processes | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
    
    foreach ($processId in $pids) {
        if ($processId -match '^\d+$') {
            try {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "Killing process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Red
                    Stop-Process -Id $processId -Force
                    Write-Host "Process killed successfully" -ForegroundColor Green
                }
            } catch {
                Write-Host "Could not kill process with PID: $processId" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "Port $Port should now be available!" -ForegroundColor Green
    Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "No processes found using port $Port" -ForegroundColor Green
    Write-Host "Port is available for use" -ForegroundColor Cyan
}