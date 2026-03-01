# PhishPulse - Final Cleanup & Restart Script

Write-Host "🚀 PhishPulse - Production Ready Cleanup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Stop any running processes
Write-Host "1. Stopping any running dev servers..." -ForegroundColor Yellow
# User should manually stop with Ctrl+C

# Clean Vite cache
Write-Host "2. Cleaning Vite cache..." -ForegroundColor Yellow
Set-Location frontend
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
Write-Host "   ✅ Cache cleared" -ForegroundColor Green

# Clear browser storage instruction
Write-Host ""
Write-Host "3. Clear browser storage:" -ForegroundColor Yellow
Write-Host "   - Open browser (F12)" -ForegroundColor White
Write-Host "   - Run: localStorage.clear()" -ForegroundColor White
Write-Host "   - Run: sessionStorage.clear()" -ForegroundColor White
Write-Host "   - Hard refresh: Ctrl+Shift+R" -ForegroundColor White

# Restart dev server
Write-Host ""
Write-Host "4. Restarting dev server..." -ForegroundColor Yellow
npm run dev

Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Visit: http://localhost:5173" -ForegroundColor White
Write-Host "   2. Check Network tab (F12) - should see /api/auth/login (not /api/api/)" -ForegroundColor White
Write-Host "   3. Test login functionality" -ForegroundColor White
Write-Host ""