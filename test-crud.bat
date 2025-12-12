@echo off
echo ========================================
echo Library Management System - CRUD Tests
echo ========================================
echo.

echo Starting server...
start /B node server.js
timeout /t 3 /nobreak > nul

echo.
echo TEST 1: READ - Get all books
curl -s http://localhost:3000/api/books
echo.
echo.

echo TEST 2: CREATE - Add new book 315031
curl -s -X POST http://localhost:3000/api/add-book -H "Content-Type: application/json" -d "{\"bookId\":\"315031\",\"bookName\":\"Clean Code\",\"authorName\":\"Robert C. Martin\",\"isbn\":\"9780132350884\",\"quantity\":2}"
echo.
echo.

timeout /t 1 /nobreak > nul

echo TEST 3: READ - Get all books after adding
curl -s http://localhost:3000/api/books
echo.
echo.

echo TEST 4: UPDATE - Add more quantity to 315030
curl -s -X POST http://localhost:3000/api/add-book -H "Content-Type: application/json" -d "{\"bookId\":\"315030\",\"bookName\":\"Introduction to Algorithms\",\"authorName\":\"Thomas H. Cormen\",\"isbn\":\"9780262033848\",\"quantity\":2,\"action\":\"update\"}"
echo.
echo.

timeout /t 1 /nobreak > nul

echo TEST 5: READ - Verify quantity updated
curl -s http://localhost:3000/api/books
echo.
echo.

echo TEST 6: SEARCH - Search by book ID
curl -s "http://localhost:3000/api/search?query=315030&type=id"
echo.
echo.

echo TEST 7: DELETE - Delete book 315031
curl -s -X DELETE http://localhost:3000/api/books/315031
echo.
echo.

timeout /t 1 /nobreak > nul

echo TEST 8: FINAL READ - Verify deletion
curl -s http://localhost:3000/api/books
echo.
echo.

echo ========================================
echo All tests completed!
echo ========================================

taskkill /F /IM node.exe > nul 2>&1
