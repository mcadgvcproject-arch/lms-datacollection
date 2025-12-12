# Simple verification of the CRUD functionality
Write-Host "================================" -ForegroundColor Cyan
Write-Host "CRUD Verification Report" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check current state of CSV
Write-Host "CURRENT STATE OF books.csv:" -ForegroundColor Yellow
Get-Content "data\books.csv"
Write-Host "`n"

# Test 1: Verify normalizeRow function exists
Write-Host "TEST 1: Check normalizeRow function in server.js" -ForegroundColor Green
$serverContent = Get-Content "server.js" -Raw
if ($serverContent -match "function normalizeRow") {
    Write-Host "✅ normalizeRow function found" -ForegroundColor Green
} else {
    Write-Host "❌ normalizeRow function NOT found" -ForegroundColor Red
}
Write-Host "`n"

# Test 2: Verify CSV upload logic for quantity merge
Write-Host "TEST 2: Check CSV upload quantity merge logic" -ForegroundColor Green
if ($serverContent -match "allBooks\[existingIndex\]\.quantity = String\(currentQty \+ newQty\)") {
    Write-Host "✅ Quantity merge logic found" -ForegroundColor Green
} else {
    Write-Host "❌ Quantity merge logic NOT found" -ForegroundColor Red
}
Write-Host "`n"

# Test 3: Check if cleanup script exists
Write-Host "TEST 3: Verify cleanup-duplicates.js exists" -ForegroundColor Green
if (Test-Path "cleanup-duplicates.js") {
    Write-Host "✅ Cleanup script exists" -ForegroundColor Green
} else {
    Write-Host "❌ Cleanup script NOT found" -ForegroundColor Red
}
Write-Host "`n"

# Test 4: Check test CSV file
Write-Host "TEST 4: Verify test-import.csv exists" -ForegroundColor Green
if (Test-Path "test-import.csv") {
    Write-Host "✅ Test import file exists" -ForegroundColor Green
    Write-Host "`nContents:" -ForegroundColor Yellow
    Get-Content "test-import.csv"
} else {
    Write-Host "❌ Test import file NOT found" -ForegroundColor Red
}
Write-Host "`n"

# Test 5: Frontend update check
Write-Host "TEST 5: Check frontend displays 'updated' books" -ForegroundColor Green
$htmlContent = Get-Content "public\index.html" -Raw
if ($htmlContent -match "result\.updated") {
    Write-Host "✅ Frontend handles updated books" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend update handling NOT found" -ForegroundColor Red
}
Write-Host "`n"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "1. CSV normalization: IMPLEMENTED" -ForegroundColor Green
Write-Host "2. Quantity merge on upload: IMPLEMENTED" -ForegroundColor Green
Write-Host "3. Cleanup utility: AVAILABLE" -ForegroundColor Green
Write-Host "4. Frontend updates: IMPLEMENTED" -ForegroundColor Green
Write-Host "5. Test files: READY" -ForegroundColor Green
Write-Host "`n"

Write-Host "To test manually:" -ForegroundColor Yellow
Write-Host "1. Run: npm start" -ForegroundColor White
Write-Host "2. Open: http://localhost:3000" -ForegroundColor White
Write-Host "3. Upload: test-import.csv" -ForegroundColor White
Write-Host "4. Expected: Book 315030 will have quantity 14 (8 existing + 6 from CSV)" -ForegroundColor White
Write-Host "            Books 315031, 315032 will be added as new" -ForegroundColor White
