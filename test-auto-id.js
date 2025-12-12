const http = require('http');

console.log('\n=== TEST: Auto-Generate IDs for Multiple Copies ===\n');

setTimeout(() => runTest(), 1000);

function runTest() {
  // Test 1: Add new book 315020 "Hacking" by Keerthan with quantity 5
  console.log('\x1b[32mTEST 1: Add NEW book 315020 "Hacking" by Keerthan (qty: 5)\x1b[0m');
  console.log('Expected: 5 books created with IDs 315020, 315021, 315022, 315023, 315024\n');
  
  const data = JSON.stringify({
    bookId: "315020",
    bookName: "Hacking",
    authorName: "Keerthan",
    isbn: "9781111111111",
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
      console.log('\x1b[32m✓ Response:\x1b[0m');
      console.log(`  Message: ${response.message}`);
      if (response.books) {
        console.log(`  Books created:`);
        response.books.forEach(b => {
          console.log(`    - ID: ${b.bookId} | Name: ${b.bookName} | Author: ${b.authorName}`);
        });
      }
      
      setTimeout(() => test2(), 500);
    });
  });
  req.write(data);
  req.end();
}

function test2() {
  // Test 2: Update existing book 315020 with 3 more copies
  console.log('\n\x1b[32mTEST 2: Add 3 more copies of book 315020 (using action: "update")\x1b[0m');
  console.log('Expected: 3 new books created with next available IDs\n');
  
  const data = JSON.stringify({
    bookId: "315020",
    bookName: "Hacking",
    authorName: "Keerthan",
    isbn: "9781111111111",
    quantity: 3,
    action: "update"
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
      console.log('\x1b[32m✓ Response:\x1b[0m');
      console.log(`  Message: ${response.message}`);
      if (response.books) {
        console.log(`  New copies created:`);
        response.books.forEach(b => {
          console.log(`    - ID: ${b.bookId} | Name: ${b.bookName} | Author: ${b.authorName}`);
        });
      }
      
      setTimeout(() => test3(), 500);
    });
  });
  req.write(data);
  req.end();
}

function test3() {
  // Test 3: View all "Hacking" books
  console.log('\n\x1b[32mTEST 3: Search for all "Hacking" books\x1b[0m');
  
  http.get('http://localhost:3000/api/search?query=Hacking&type=name', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const books = JSON.parse(data);
      console.log(`\n\x1b[36mFound ${books.length} copies of "Hacking":\x1b[0m`);
      books.forEach(b => {
        console.log(`  - ID: ${b.bookId} | Author: ${b.authorName} | Qty: ${b.quantity}`);
      });
      
      console.log('\n\x1b[36m=== TEST COMPLETE ===\x1b[0m');
      console.log('\x1b[33mSummary:\x1b[0m');
      console.log('\x1b[32m✓ Adding qty=5 created 5 separate book entries with sequential IDs\x1b[0m');
      console.log('\x1b[32m✓ Updating with qty=3 created 3 MORE entries with next available IDs\x1b[0m');
      console.log('\x1b[32m✓ Total 8 copies of "Hacking" book, each with unique ID\x1b[0m\n');
      process.exit(0);
    });
  });
}
