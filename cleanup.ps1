# Cleanup script for Windows
Write-Host "Starting cleanup process..." -ForegroundColor Green

# Function to safely remove directory
function Remove-DirectorySafely {
    param($Path, $Name)

    if (Test-Path $Path) {
        Write-Host "Removing $Name..." -ForegroundColor Yellow
        try {
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
            Write-Host "$Name removed successfully!" -ForegroundColor Green
        }
        catch {
            Write-Host "Failed to remove $Name : $($_.Exception.Message)" -ForegroundColor Red
            # Try alternative method
            Write-Host "Trying alternative removal method..." -ForegroundColor Yellow
            cmd /c "rmdir /s /q `"$Path`"" 2>$null
            if (-not (Test-Path $Path)) {
                Write-Host "$Name removed successfully with alternative method!" -ForegroundColor Green
            }
            else {
                Write-Host "Warning: Could not remove $Name. Files may be in use." -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "$Name does not exist, skipping..." -ForegroundColor Gray
    }
}

# Remove build artifacts
Remove-DirectorySafely ".next" ".next build folder"
Remove-DirectorySafely ".turbo" ".turbo cache"
Remove-DirectorySafely ".swc" ".swc cache"
Remove-DirectorySafely "node_modules\.cache" "node modules cache"

# Remove node_modules
Remove-DirectorySafely "node_modules" "node_modules"

# Remove pnpm lock if needed
if (Test-Path "pnpm-lock.yaml") {
    Write-Host "Keeping pnpm-lock.yaml (recommended)" -ForegroundColor Gray
    # Uncomment the line below if you want to remove it
    # Remove-Item "pnpm-lock.yaml" -Force
}

Write-Host "`nCleanup completed!" -ForegroundColor Green
Write-Host "Next step: Run 'pnpm install' to reinstall dependencies" -ForegroundColor Cyan
