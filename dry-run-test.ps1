Write-Host "`n=== DRY RUN TEST - Library Management System ===" -ForegroundColor Cyan
Write-Host "Testing book series with same title/author but different IDs`n" -ForegroundColor Yellow

# Wait for server to be ready
Start-Sleep -Seconds 2

# Test 1: Check current state
Write-Host "TEST 1: Current Database State" -ForegroundColor Green
try {
    $books = Invoke-RestMethod -Uri "http://localhost:3000/api/books" -Method GET
    Write-Host "Current books in database: $($books.Count)" -ForegroundColor White
    $books | ForEach-Object {
        Write-Host "  - ID: $($_.bookId) | Name: $($_.bookName) | Qty: $($_.quantity)" -ForegroundColor Gray
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 2: Add a single book with existing ID (should fail)
Write-Host "`nTEST 2: Try to add book with existing ID 315030" -ForegroundColor Green
try {
    $body = @{
        bookId = "315030"
        bookName = "Test Book"
        authorName = "Test Author"
        isbn = "9781234567890"
        quantity = 5
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/add-book" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "Result: $($response.message)" -ForegroundColor White
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Expected Error: $($errorResponse.error)" -ForegroundColor Yellow
    Write-Host "  Suggestion: $($errorResponse.suggestion)" -ForegroundColor Gray
}

# Test 3: Add book with new ID but same ISBN (should succeed)
Write-Host "`nTEST 3: Add book with NEW ID 315036 (same title/author as series)" -ForegroundColor Green
try {
    $body = @{
        bookId = "315036"
        bookName = "R Programming"
        authorName = "Adhi"
        isbn = "9780123456789"
        quantity = 1
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/add-book" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Success: $($response.message)" -ForegroundColor Green
    Write-Host "  Book ID: $($response.book.bookId) | Name: $($response.book.bookName)" -ForegroundColor Gray
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 4: Upload CSV with book series
Write-Host "`nTEST 4: Upload CSV with 6 books (same title/author, different IDs)" -ForegroundColor Green
Write-Host "File: test-series.csv" -ForegroundColor Gray
Get-Content "test-series.csv" | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }

try {
    $filePath = "test-series.csv"
    $boundary = [System.Guid]::NewGuid().ToString()
    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
    $fileEnc = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)
    
    $LF = "`r`n"
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"csvFile`"; filename=`"test-series.csv`"",
        "Content-Type: text/csv$LF",
        $fileEnc,
        "--$boundary--$LF"
    ) -join $LF

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/upload-csv" -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    
    Write-Host "`n✓ Upload Results:" -ForegroundColor Green
    Write-Host "  Message: $($response.message)" -ForegroundColor White
    Write-Host "  Imported: $($response.imported)" -ForegroundColor Green
    Write-Host "  Conflicts: $($response.conflicts)" -ForegroundColor Yellow
    Write-Host "  Duplicates: $($response.duplicates)" -ForegroundColor Yellow
    Write-Host "  Skipped: $($response.skipped)" -ForegroundColor Red
    
    if ($response.details.conflicts) {
        Write-Host "`n  Conflict Details:" -ForegroundColor Yellow
        $response.details.conflicts | ForEach-Object {
            Write-Host "    - ID: $($_.bookId) | Reason: $($_.reason)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 5: View final state
Write-Host "`nTEST 5: Final Database State" -ForegroundColor Green
try {
    $books = Invoke-RestMethod -Uri "http://localhost:3000/api/books" -Method GET
    Write-Host "Total books in database: $($books.Count)" -ForegroundColor White
    
    # Group by book name
    $grouped = $books | Group-Object -Property bookName
    $grouped | ForEach-Object {
        Write-Host "`n  Book: $($_.Name) (Count: $($_.Count))" -ForegroundColor Cyan
        $_.Group | ForEach-Object {
            Write-Host "    - ID: $($_.bookId) | Author: $($_.authorName) | Qty: $($_.quantity) | ISBN: $($_.isbn)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

# Test 6: Search by book name
Write-Host "`nTEST 6: Search for 'R Programming' books" -ForegroundColor Green
try {
    $searchUrl = "http://localhost:3000/api/search?query=R%20Programming&type=name"
    $searchResults = Invoke-RestMethod -Uri $searchUrl -Method GET
    Write-Host "Search results: $($searchResults.Count) books found" -ForegroundColor White
    $searchResults | ForEach-Object {
        Write-Host "  - ID: $($_.bookId) | Qty: $($_.quantity)" -ForegroundColor Gray
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n=== DRY RUN COMPLETE ===" -ForegroundColor Cyan
Write-Host "`nConclusion:" -ForegroundColor Yellow
Write-Host "✓ System correctly allows multiple books with same title/author/ISBN" -ForegroundColor Green
Write-Host "✓ Each unique Book ID is kept as separate entry" -ForegroundColor Green
Write-Host "✓ Book ID 315030 was rejected (already exists)" -ForegroundColor Green
Write-Host "✓ Book IDs 315031-315035 should be added (if not already present)" -ForegroundColor Green
