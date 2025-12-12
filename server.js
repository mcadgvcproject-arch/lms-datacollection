const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { createObjectCsvWriter } = require('csv-writer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Create data directory if it doesn't exist
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// Database file path
const BOOKS_CSV = path.join(__dirname, 'data', 'books.csv');

// Initialize CSV file with headers if it doesn't exist
if (!fs.existsSync(BOOKS_CSV)) {
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
  csvWriter.writeRecords([]);
}

// Route: Get all books
app.get('/api/books', (req, res) => {
  const books = [];
  
  if (!fs.existsSync(BOOKS_CSV)) {
    return res.json([]);
  }

  fs.createReadStream(BOOKS_CSV)
    .pipe(csv())
    .on('data', (row) => {
      const normalizedRow = normalizeRow(row);
      if (normalizedRow.bookId) {
        books.push(normalizedRow);
      }
    })
    .on('end', () => {
      res.json(books);
    })
    .on('error', (err) => {
      res.status(500).json({ error: 'Error reading books' });
    });
});

// Utility function to normalize CSV row keys
function normalizeRow(row) {
  return {
    bookId: row['Book ID'] || row.bookId || '',
    bookName: row['Book Name'] || row.bookName || '',
    authorName: row['Author Name'] || row.authorName || '',
    isbn: row.ISBN || row.isbn || '',
    quantity: row.Quantity || row.quantity || '1',
    addedDate: row['Added Date'] || row.addedDate || ''
  };
}

// Utility function to check if book exists (only by Book ID)
function checkBookExists(books, bookId) {
  return books.find(book => book.bookId === bookId);
}

// Route: Check if book already exists
app.post('/api/check-duplicate', (req, res) => {
  const { bookId } = req.body;

  if (!bookId) {
    return res.status(400).json({ error: 'Book ID is required' });
  }

  const books = [];

  if (!fs.existsSync(BOOKS_CSV)) {
    return res.json({ exists: false });
  }

  fs.createReadStream(BOOKS_CSV)
    .pipe(csv())
    .on('data', (row) => {
      const normalizedRow = normalizeRow(row);
      if (normalizedRow.bookId) {
        books.push(normalizedRow);
      }
    })
    .on('end', () => {
      const existingBook = checkBookExists(books, bookId);
      if (existingBook) {
        res.json({ 
          exists: true, 
          book: existingBook,
          message: `Book ID already exists: ${existingBook.bookName} by ${existingBook.authorName}`
        });
      } else {
        res.json({ exists: false });
      }
    })
    .on('error', () => {
      res.status(500).json({ error: 'Error checking duplicates' });
    });
});

// Route: Search books
app.get('/api/search', (req, res) => {
  const { query, type } = req.query; // type: 'id', 'name', 'author', 'isbn'

  if (!query) {
    return res.status(400).json({ error: 'Search query required' });
  }

  const books = [];
  const searchTerm = query.toLowerCase();

  if (!fs.existsSync(BOOKS_CSV)) {
    return res.json([]);
  }

  fs.createReadStream(BOOKS_CSV)
    .pipe(csv())
    .on('data', (row) => {
      const normalizedRow = normalizeRow(row);
      if (!normalizedRow.bookId) return;
      
      let matches = false;

      if (type === 'id' && normalizedRow.bookId.toLowerCase().includes(searchTerm)) {
        matches = true;
      } else if (type === 'name' && normalizedRow.bookName.toLowerCase().includes(searchTerm)) {
        matches = true;
      } else if (type === 'author' && normalizedRow.authorName.toLowerCase().includes(searchTerm)) {
        matches = true;
      } else if (type === 'isbn' && normalizedRow.isbn.includes(searchTerm)) {
        matches = true;
      } else if (!type) {
        // Search all fields
        matches = Object.values(normalizedRow).some(val => 
          String(val).toLowerCase().includes(searchTerm)
        );
      }

      if (matches) {
        books.push(normalizedRow);
      }
    })
    .on('end', () => {
      res.json(books);
    })
    .on('error', () => {
      res.status(500).json({ error: 'Error searching books' });
    });
});

// Route: Add a single book with duplicate checking
app.post('/api/add-book', (req, res) => {
  const { bookId, bookName, authorName, isbn, quantity, action } = req.body;

  // Validation
  if (!bookId || !bookName || !authorName || !isbn) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate ISBN format (basic check)
  if (!/^\d{10}(\d{3})?$|^97[89]\d{10}(\d{3})?$/.test(isbn.replace(/-/g, ''))) {
    return res.status(400).json({ 
      error: 'Invalid ISBN format. Use 10 or 13 digit ISBN (with or without hyphens)'
    });
  }

  // Validate Book ID is numeric or alphanumeric
  if (!/^[a-zA-Z0-9]+$/.test(bookId)) {
    return res.status(400).json({ 
      error: 'Book ID can only contain letters and numbers'
    });
  }

  const books = [];

  // Read existing books
  const readStream = fs.existsSync(BOOKS_CSV) 
    ? fs.createReadStream(BOOKS_CSV).pipe(csv())
    : { on: (event, callback) => { if (event === 'end') callback(); } };

  readStream.on('data', (row) => {
    const normalizedRow = normalizeRow(row);
    if (normalizedRow.bookId) {
      books.push(normalizedRow);
    }
  });

  readStream.on('end', () => {
    const existingBook = checkBookExists(books, bookId);

    if (existingBook) {
      // Book ID already exists
      if (action === 'update') {
        // Generate new IDs for additional copies
        const qty = parseInt(quantity || 1);
        const baseId = parseInt(bookId);
        const newBooks = [];
        
        // Find the next available IDs starting from baseId
        let nextId = baseId + 1;
        for (let i = 0; i < qty; i++) {
          // Find next available ID
          while (books.some(b => b.bookId === String(nextId))) {
            nextId++;
          }
          newBooks.push({
            bookId: String(nextId),
            bookName: existingBook.bookName,
            authorName: existingBook.authorName,
            isbn: existingBook.isbn,
            quantity: '1',
            addedDate: new Date().toISOString().split('T')[0]
          });
          nextId++;
        }

        const csvWriter = createObjectCsvWriter({
          path: BOOKS_CSV,
          header: [
            { id: 'bookId', title: 'Book ID' },
            { id: 'bookName', title: 'Book Name' },
            { id: 'authorName', title: 'Author Name' },
            { id: 'isbn', title: 'ISBN' },
            { id: 'quantity', title: 'Quantity' },
            { id: 'addedDate', title: 'Added Date' }
          ],
          append: true
        });

        csvWriter.writeRecords(newBooks)
          .then(() => {
            res.json({ 
              message: `Added ${qty} new copies with IDs: ${newBooks.map(b => b.bookId).join(', ')}`,
              books: newBooks,
              isDuplicate: true,
              action: 'created_copies'
            });
          })
          .catch(() => {
            res.status(500).json({ error: 'Error adding book copies' });
          });
      } else {
        // Just inform about duplicate Book ID
        return res.status(409).json({ 
          error: 'Book ID already exists',
          isDuplicate: true,
          existingBook: existingBook,
          suggestion: 'Use action: "update" to add more copies with auto-generated IDs'
        });
      }
    } else {
      // Add new book(s) - if quantity > 1, create multiple entries with sequential IDs
      const qty = parseInt(quantity || 1);
      const baseId = parseInt(bookId);
      const newBooks = [];
      
      let nextId = baseId;
      for (let i = 0; i < qty; i++) {
        // Find next available ID
        while (books.some(b => b.bookId === String(nextId)) || newBooks.some(b => b.bookId === String(nextId))) {
          nextId++;
        }
        newBooks.push({
          bookId: String(nextId),
          bookName,
          authorName,
          isbn,
          quantity: '1',
          addedDate: new Date().toISOString().split('T')[0]
        });
        nextId++;
      }

      const csvWriter = createObjectCsvWriter({
        path: BOOKS_CSV,
        header: [
          { id: 'bookId', title: 'Book ID' },
          { id: 'bookName', title: 'Book Name' },
          { id: 'authorName', title: 'Author Name' },
          { id: 'isbn', title: 'ISBN' },
          { id: 'quantity', title: 'Quantity' },
          { id: 'addedDate', title: 'Added Date' }
        ],
        append: true
      });

      csvWriter.writeRecords(newBooks)
        .then(() => {
          res.json({ 
            message: qty > 1 
              ? `Added ${qty} books with IDs: ${newBooks.map(b => b.bookId).join(', ')}`
              : 'Book added successfully', 
            books: newBooks,
            isDuplicate: false
          });
        })
        .catch(() => {
          res.status(500).json({ error: 'Error adding book' });
        });
    }
  });

  readStream.on('error', () => {
    res.status(500).json({ error: 'Error processing request' });
  });
});

// Route: Upload CSV file with duplicate handling
app.post('/api/upload-csv', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const books = [];
  const duplicates = [];
  const skipped = [];
  const filePath = req.file.path;

  // Read the uploaded CSV
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      if (row.bookId && row.bookName && row.authorName && row.isbn) {
        // Validate ISBN
        const isbnClean = row.isbn.replace(/-/g, '');
        if (!/^\d{10}(\d{3})?$|^97[89]\d{10}(\d{3})?$/.test(isbnClean)) {
          skipped.push({
            bookId: row.bookId,
            reason: 'Invalid ISBN format'
          });
          return;
        }

        // Validate Book ID
        if (!/^[a-zA-Z0-9]+$/.test(row.bookId)) {
          skipped.push({
            bookId: row.bookId,
            reason: 'Invalid Book ID format (alphanumeric only)'
          });
          return;
        }

        books.push({
          bookId: row.bookId,
          bookName: row.bookName,
          authorName: row.authorName,
          isbn: row.isbn,
          quantity: row.quantity || 1,
          addedDate: new Date().toISOString().split('T')[0]
        });
      } else {
        skipped.push({
          bookId: row.bookId || 'Unknown',
          reason: 'Missing required fields'
        });
      }
    })
    .on('end', () => {
      // Check for duplicates within the upload (only Book ID)
      const seenIds = new Set();
      const validBooks = [];

      books.forEach(book => {
        if (seenIds.has(book.bookId)) {
          duplicates.push({
            bookId: book.bookId,
            bookName: book.bookName,
            reason: 'Duplicate Book ID within file'
          });
        } else {
          seenIds.add(book.bookId);
          validBooks.push(book);
        }
      });

      // Read existing books and check for duplicates
      if (!fs.existsSync(BOOKS_CSV)) {
        // No existing file, write all valid books
        if (validBooks.length > 0) {
          const csvWriter = createObjectCsvWriter({
            path: BOOKS_CSV,
            header: [
              { id: 'bookId', title: 'Book ID' },
              { id: 'bookName', title: 'Book Name' },
              { id: 'authorName', title: 'Author Name' },
              { id: 'isbn', title: 'ISBN' },
              { id: 'quantity', title: 'Quantity' },
              { id: 'addedDate', title: 'Added Date' }
            ],
            append: true
          });

          csvWriter.writeRecords(validBooks)
            .then(() => {
              fs.unlinkSync(filePath);
              res.json({
                message: 'Books imported successfully',
                imported: validBooks.length,
                duplicates: duplicates.length,
                skipped: skipped.length,
                details: {
                  duplicates: duplicates.length > 0 ? duplicates : null,
                  skipped: skipped.length > 0 ? skipped : null
                }
              });
            })
            .catch(() => {
              res.status(500).json({ error: 'Error importing books' });
            });
        } else {
          fs.unlinkSync(filePath);
          res.status(400).json({
            error: 'No valid books to import',
            skipped: skipped
          });
        }
      } else {
        // Check against existing books
        const existingBooks = [];
        fs.createReadStream(BOOKS_CSV)
          .pipe(csv())
          .on('data', (row) => {
            const normalizedRow = normalizeRow(row);
            if (normalizedRow.bookId) {
              existingBooks.push(normalizedRow);
            }
          })
          .on('end', () => {
            const booksToAdd = [];
            const conflicts = [];
            let allBooks = [...existingBooks];

            validBooks.forEach(newBook => {
              const existingIndex = allBooks.findIndex(book => book.bookId === newBook.bookId);
              
              if (existingIndex !== -1) {
                // Book ID already exists - skip it
                conflicts.push({
                  bookId: newBook.bookId,
                  bookName: newBook.bookName,
                  reason: 'Book ID already exists in database'
                });
              } else {
                // New book - add to the list
                allBooks.push(newBook);
                booksToAdd.push(newBook);
              }
            });

            // Write all books (existing + new) to CSV
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

            csvWriter.writeRecords(allBooks)
              .then(() => {
                fs.unlinkSync(filePath);
                res.json({
                  message: `Successfully imported ${booksToAdd.length} new books`,
                  imported: booksToAdd.length,
                  conflicts: conflicts.length,
                  duplicates: duplicates.length,
                  skipped: skipped.length,
                  details: {
                    conflicts: conflicts.length > 0 ? conflicts : null,
                    duplicates: duplicates.length > 0 ? duplicates : null,
                    skipped: skipped.length > 0 ? skipped : null
                  }
                });
              })
              .catch(() => {
                res.status(500).json({ error: 'Error importing books' });
              });
          });
      }
    })
    .on('error', () => {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: 'Error reading CSV file' });
    });
});

// Route: Delete a book
app.delete('/api/books/:bookId', (req, res) => {
  const bookIdToDelete = req.params.bookId;
  const books = [];

  if (!fs.existsSync(BOOKS_CSV)) {
    return res.status(404).json({ error: 'No books found' });
  }

  fs.createReadStream(BOOKS_CSV)
    .pipe(csv())
    .on('data', (row) => {
      const normalizedRow = normalizeRow(row);
      if (normalizedRow.bookId && normalizedRow.bookId !== bookIdToDelete) {
        books.push(normalizedRow);
      }
    })
    .on('end', () => {
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

      csvWriter.writeRecords(books)
        .then(() => {
          res.json({ message: 'Book deleted successfully' });
        })
        .catch((err) => {
          res.status(500).json({ error: 'Error deleting book' });
        });
    });
});

// Route: Download CSV
app.get('/api/download-csv', (req, res) => {
  if (!fs.existsSync(BOOKS_CSV)) {
    return res.status(404).json({ error: 'No books found' });
  }

  res.download(BOOKS_CSV, 'books.csv');
});

// Start server
app.listen(PORT, () => {
  console.log(`Library Management System running on http://localhost:${PORT}`);
});
