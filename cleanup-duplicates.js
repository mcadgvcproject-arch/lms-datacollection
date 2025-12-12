const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');

const BOOKS_CSV = path.join(__dirname, 'data', 'books.csv');

console.log('Starting duplicate cleanup...');

if (!fs.existsSync(BOOKS_CSV)) {
  console.log('No books.csv file found!');
  process.exit(1);
}

const books = [];

fs.createReadStream(BOOKS_CSV)
  .pipe(csv())
  .on('data', (row) => {
    // Skip empty rows
    if (row['Book ID'] && row['Book ID'].trim()) {
      books.push({
        bookId: row['Book ID'].trim(),
        bookName: row['Book Name'].trim(),
        authorName: row['Author Name'].trim(),
        isbn: row.ISBN.trim(),
        quantity: row.Quantity || '1',
        addedDate: row['Added Date'] || new Date().toISOString().split('T')[0]
      });
    }
  })
  .on('end', () => {
    console.log(`Found ${books.length} total books`);

    // Group books by Book ID and merge quantities
    const mergedBooks = {};
    
    books.forEach(book => {
      if (mergedBooks[book.bookId]) {
        // Book ID already exists - add quantities
        const existingQty = parseInt(mergedBooks[book.bookId].quantity) || 0;
        const newQty = parseInt(book.quantity) || 1;
        mergedBooks[book.bookId].quantity = String(existingQty + newQty);
        console.log(`Merged duplicate: ${book.bookId} - New quantity: ${mergedBooks[book.bookId].quantity}`);
      } else {
        // First occurrence of this Book ID
        mergedBooks[book.bookId] = book;
      }
    });

    const uniqueBooks = Object.values(mergedBooks);
    console.log(`After merging: ${uniqueBooks.length} unique books`);
    console.log(`Removed ${books.length - uniqueBooks.length} duplicates`);

    // Write back to CSV
    const csvWriter = createObjectCsvWriter({
      path: BOOKS_CSV,
      header: [
        { id: 'bookId', title: 'Book ID' },
        { id: 'bookName', title: 'Book Name' },
        { id: 'authorName', title: 'Author Name' },
        { id: 'isbn', title: 'ISBN' },
        { id: 'quantity', title: 'Quantity' },
        { id: 'addedDate', title: 'Added Date' }
      ]
    });

    csvWriter.writeRecords(uniqueBooks)
      .then(() => {
        console.log('✅ Cleanup complete! Duplicates merged successfully.');
        console.log(`Final count: ${uniqueBooks.length} unique books`);
      })
      .catch((err) => {
        console.error('❌ Error writing CSV:', err);
      });
  })
  .on('error', (err) => {
    console.error('❌ Error reading CSV:', err);
  });
