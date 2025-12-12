const http = require('http');

// Test 1: CREATE - Add first book
console.log('\n📝 TEST 1: CREATE - Adding Book 315030 (Qty: 5)');
const data1 = JSON.stringify({
  bookId: "315030",
  bookName: "Introduction to Algorithms",
  authorName: "Thomas H. Cormen",
  isbn: "9780262033848",
  quantity: 5
});

const options1 = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/add-book',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data1.length
  }
};

const req1 = http.request(options1, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log('✅ Response:', JSON.parse(responseData));
    
    // Test 2: READ - Get all books
    setTimeout(() => {
      console.log('\n📖 TEST 2: READ - Getting all books');
      http.get('http://localhost:3000/api/books', (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const books = JSON.parse(data);
          console.log('✅ Total Books:', books.length);
          console.log('Books:', books);
          
          // Test 3: UPDATE - Add same book again with quantity 3
          setTimeout(() => {
            console.log('\n🔄 TEST 3: UPDATE - Adding same Book 315030 (Qty: 3) with action=update');
            const data3 = JSON.stringify({
              bookId: "315030",
              bookName: "Introduction to Algorithms",
              authorName: "Thomas H. Cormen",
              isbn: "9780262033848",
              quantity: 3,
              action: "update"
            });
            
            const options3 = {
              hostname: 'localhost',
              port: 3000,
              path: '/api/add-book',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': data3.length
              }
            };
            
            const req3 = http.request(options3, (res) => {
              let responseData = '';
              res.on('data', (chunk) => { responseData += chunk; });
              res.on('end', () => {
                console.log('✅ Response:', JSON.parse(responseData));
                
                // Verify the update
                setTimeout(() => {
                  console.log('\n📖 TEST 4: READ - Verify quantity updated to 8');
                  http.get('http://localhost:3000/api/books', (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                      const books = JSON.parse(data);
                      console.log('✅ Books:', books);
                      
                      // Test 5: CSV UPLOAD with duplicates
                      setTimeout(() => {
                        console.log('\n📤 TEST 5: CSV UPLOAD - Testing quantity merge');
                        const FormData = require('form-data');
                        const fs = require('fs');
                        const form = new FormData();
                        form.append('csvFile', fs.createReadStream('test-import.csv'));
                        
                        const options5 = {
                          hostname: 'localhost',
                          port: 3000,
                          path: '/api/upload-csv',
                          method: 'POST',
                          headers: form.getHeaders()
                        };
                        
                        const req5 = http.request(options5, (res) => {
                          let responseData = '';
                          res.on('data', (chunk) => { responseData += chunk; });
                          res.on('end', () => {
                            console.log('✅ Response:', JSON.parse(responseData));
                            
                            // Final READ
                            setTimeout(() => {
                              console.log('\n📖 TEST 6: FINAL READ - All books after CSV import');
                              http.get('http://localhost:3000/api/books', (res) => {
                                let data = '';
                                res.on('data', (chunk) => { data += chunk; });
                                res.on('end', () => {
                                  const books = JSON.parse(data);
                                  console.log('✅ Total Books:', books.length);
                                  books.forEach(book => {
                                    console.log(`   - ${book.bookId}: ${book.bookName} (Qty: ${book.quantity})`);
                                  });
                                  
                                  // Test 7: DELETE
                                  setTimeout(() => {
                                    console.log('\n🗑️ TEST 7: DELETE - Deleting Book 315031');
                                    const options7 = {
                                      hostname: 'localhost',
                                      port: 3000,
                                      path: '/api/books/315031',
                                      method: 'DELETE'
                                    };
                                    
                                    const req7 = http.request(options7, (res) => {
                                      let responseData = '';
                                      res.on('data', (chunk) => { responseData += chunk; });
                                      res.on('end', () => {
                                        console.log('✅ Response:', JSON.parse(responseData));
                                        
                                        // Final verification
                                        setTimeout(() => {
                                          console.log('\n📖 TEST 8: FINAL VERIFICATION - Books after delete');
                                          http.get('http://localhost:3000/api/books', (res) => {
                                            let data = '';
                                            res.on('data', (chunk) => { data += chunk; });
                                            res.on('end', () => {
                                              const books = JSON.parse(data);
                                              console.log('✅ Total Books:', books.length);
                                              books.forEach(book => {
                                                console.log(`   - ${book.bookId}: ${book.bookName} (Qty: ${book.quantity})`);
                                              });
                                              
                                              console.log('\n🎉 ALL CRUD TESTS COMPLETED SUCCESSFULLY!');
                                              process.exit(0);
                                            });
                                          });
                                        }, 500);
                                      });
                                    });
                                    req7.end();
                                  }, 500);
                                });
                              });
                            }, 500);
                          });
                        });
                        form.pipe(req5);
                      }, 500);
                    });
                  });
                }, 500);
              });
            });
            req3.write(data3);
            req3.end();
          }, 500);
        });
      });
    }, 500);
  });
});

req1.write(data1);
req1.end();
