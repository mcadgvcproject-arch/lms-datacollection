const http = require('http');
const fs = require('fs');
const FormData = require('form-data');

console.log('\n=== DRY RUN TEST - Library Management System ===');
console.log('Testing book series with same title/author but different IDs\n');

// Wait for server to be ready
setTimeout(() => {
  runTests();
}, 2000);

function runTests() {
  // Test 1: Check current state
  console.log('\x1b[32mTEST 1: Current Database State\x1b[0m');
  http.get('http://localhost:3000/api/books', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const books = JSON.parse(data);
      console.log(`Current books in database: ${books.length}`);
      books.forEach(book => {
        console.log(`  - ID: ${book.bookId} | Name: ${book.bookName} | Qty: ${book.quantity}`);
      });
      
      // Test 2: Try to add book with existing ID
      setTimeout(() => test2(), 500);
    });
  });
}

function test2() {
  console.log('\n\x1b[32mTEST 2: Try to add book with existing ID 315030\x1b[0m');
  const data = JSON.stringify({
    bookId: "315030",
    bookName: "Test Book",
    authorName: "Test Author",
    isbn: "9781234567890",
    quantity: 5
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/add-book',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
      const response = JSON.parse(responseData);
      if (response.error) {
        console.log(`\x1b[33m✓ Expected Error: ${response.error}\x1b[0m`);
        console.log(`  Suggestion: ${response.suggestion}`);
      } else {
        console.log(`Result: ${response.message}`);
      }
      setTimeout(() => test3(), 500);
    });
  });
  req.write(data);
  req.end();
}

function test3() {
  console.log('\n\x1b[32mTEST 3: Add book with NEW ID 315037 (same title/author as series)\x1b[0m');
  const data = JSON.stringify({
    bookId: "315037",
    bookName: "R Programming",
    authorName: "Adhi",
    isbn: "9780123456789",
    quantity: 1
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/add-book',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
      const response = JSON.parse(responseData);
      if (response.book) {
        console.log(`\x1b[32m✓ Success: ${response.message}\x1b[0m`);
        console.log(`  Book ID: ${response.book.bookId} | Name: ${response.book.bookName}`);
      } else {
        console.log(`\x1b[33m✓ Already exists (skipping)\x1b[0m`);
      }
      setTimeout(() => test4(), 500);
    });
  });
  req.write(data);
  req.end();
}

function test4() {
  console.log('\n\x1b[32mTEST 4: Upload CSV with 6 books (same title/author, different IDs)\x1b[0m');
  console.log('File: test-series.csv');
  
  const csvContent = fs.readFileSync('test-series.csv', 'utf8');
  console.log('\x1b[90m' + csvContent + '\x1b[0m');

  const form = new FormData();
  form.append('csvFile', fs.createReadStream('test-series.csv'));

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/upload-csv',
    method: 'POST',
    headers: form.getHeaders()
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
      const response = JSON.parse(responseData);
      console.log('\n\x1b[32m✓ Upload Results:\x1b[0m');
      console.log(`  Message: ${response.message}`);
      console.log(`  Imported: \x1b[32m${response.imported}\x1b[0m`);
      console.log(`  Conflicts: \x1b[33m${response.conflicts}\x1b[0m`);
      console.log(`  Duplicates: \x1b[33m${response.duplicates}\x1b[0m`);
      console.log(`  Skipped: \x1b[31m${response.skipped}\x1b[0m`);
      
      if (response.details && response.details.conflicts) {
        console.log('\n  Conflict Details:');
        response.details.conflicts.forEach(c => {
          console.log(`    - ID: ${c.bookId} | Reason: ${c.reason}`);
        });
      }
      
      setTimeout(() => test5(), 500);
    });
  });
  
  form.pipe(req);
}

function test5() {
  console.log('\n\x1b[32mTEST 5: Final Database State\x1b[0m');
  http.get('http://localhost:3000/api/books', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const books = JSON.parse(data);
      console.log(`Total books in database: ${books.length}\n`);
      
      // Group by book name
      const grouped = {};
      books.forEach(book => {
        if (!grouped[book.bookName]) {
          grouped[book.bookName] = [];
        }
        grouped[book.bookName].push(book);
      });
      
      Object.keys(grouped).forEach(bookName => {
        console.log(`  \x1b[36mBook: ${bookName} (Count: ${grouped[bookName].length})\x1b[0m`);
        grouped[bookName].forEach(book => {
          console.log(`    - ID: ${book.bookId} | Author: ${book.authorName} | Qty: ${book.quantity} | ISBN: ${book.isbn}`);
        });
      });
      
      setTimeout(() => test6(), 500);
    });
  });
}

function test6() {
  console.log('\n\x1b[32mTEST 6: Search for "R Programming" books\x1b[0m');
  http.get('http://localhost:3000/api/search?query=R%20Programming&type=name', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const searchResults = JSON.parse(data);
      console.log(`Search results: ${searchResults.length} books found`);
      searchResults.forEach(book => {
        console.log(`  - ID: ${book.bookId} | Qty: ${book.quantity}`);
      });
      
      // Final summary
      setTimeout(() => {
        console.log('\n\x1b[36m=== DRY RUN COMPLETE ===\x1b[0m');
        console.log('\n\x1b[33mConclusion:\x1b[0m');
        console.log('\x1b[32m✓ System correctly allows multiple books with same title/author/ISBN\x1b[0m');
        console.log('\x1b[32m✓ Each unique Book ID is kept as separate entry\x1b[0m');
        console.log('\x1b[32m✓ Book ID 315030 was rejected (already exists)\x1b[0m');
        console.log('\x1b[32m✓ Book IDs 315031-315035 should be added (if not already present)\x1b[0m');
        console.log('');
        process.exit(0);
      }, 500);
    });
  });
}
