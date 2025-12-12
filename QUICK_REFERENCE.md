# Quick Reference Guide

## Starting the System

### Windows PowerShell
```powershell
cd C:\Users\ADHITHAN\Downloads\Library-Management-System
npm install
npm start
```

### Expected Output
```
Library Management System running on http://localhost:3000
```

### Open in Browser
```
http://localhost:3000
```

## Data Files Location

- **Books Database**: `data/books.csv` (auto-created on first run)
- **Sample Data**: `sample-books.csv` (6 books)
- **Test Data**: `comprehensive-books.csv` (30 books)
- **Uploaded Files**: `uploads/` (temporary storage, auto-cleaned)

## Common Tasks

### Add a Single Book
1. Go to "Add Book" tab
2. Fill form:
   - Book ID: `315030` (alphanumeric)
   - Book Name: `The Great Gatsby`
   - Author Name: `F. Scott Fitzgerald`
   - ISBN: `978-0-7432-7356-5` (10 or 13 digits)
   - Quantity: `1`
3. Click "Add Book"

### Import Books from CSV
1. Go to "Import CSV" tab
2. Drag CSV file or click to select
3. System automatically:
   - Validates records
   - Detects duplicates
   - Shows import summary
   - Adds valid books to database

### Find a Specific Book
1. Go to "View Books" tab
2. In Search section:
   - Enter search term
   - Select field type (ID, Name, Author, ISBN, or All)
   - Click "🔍 Search"
3. Results show instantly
4. Click "Clear" to reset

### Download All Books
1. Go to "View Books" tab
2. Click "📥 Download CSV"
3. Opens `books.csv` download

### Delete a Book
1. Go to "View Books" tab
2. Find book in table
3. Click "Delete" button
4. Confirm deletion
5. Book removed from database

## CSV Format

### Header Row (Required)
```
Book ID,Book Name,Author Name,ISBN,Quantity
```

### Sample Data
```csv
315030,The Great Gatsby,F. Scott Fitzgerald,978-0-7432-7356-5,3
315031,To Kill a Mockingbird,Harper Lee,978-0-06-112008-4,2
315032,1984,George Orwell,978-0-451-52493-2,2
```

### Requirements
- **Book ID**: Unique, alphanumeric only (no hyphens, spaces)
- **Book Name**: Any text
- **Author Name**: Any text
- **ISBN**: 10 or 13 digits (with or without hyphens)
- **Quantity**: Number (optional, defaults to 1)

## Validation Rules

### Book ID ✓
- Alphanumeric only (A-Z, a-z, 0-9)
- ✅ Valid: `315030`, `BOOK001`, `B123`
- ❌ Invalid: `BOOK-001`, `BOOK_001`, `BOOK 001`

### ISBN ✓
- 10 or 13 digits
- With or without hyphens
- ✅ Valid: `978-0-7432-7356-5`, `9780743273565`
- ❌ Invalid: `123`, `INVALID-ISBN`

### Required Fields ✓
- Book ID (required)
- Book Name (required)
- Author Name (required)
- ISBN (required)
- Quantity (optional, defaults to 1)

### Duplicate Detection ✓
- Book ID must be unique
- ISBN must be unique (detects same book, different ID)
- If duplicate found: Option to increase quantity

## Error Messages & Solutions

### "Invalid ISBN format"
**Problem**: ISBN doesn't match format
**Solution**: Use 10 or 13 digit ISBN (with or without hyphens)
```
✅ Correct: 978-0-7432-7356-5 or 9780743273565
❌ Wrong: 123 or INVALID-ISBN
```

### "Book ID must be alphanumeric"
**Problem**: Book ID contains invalid characters
**Solution**: Use only letters and numbers
```
✅ Correct: 315030, BOOK001
❌ Wrong: BOOK-001, BOOK_001
```

### "Book already exists"
**Problem**: Book ID or ISBN already in database
**Solution**: Either:
- Click "Increase Quantity" to add more copies
- Click "Use Different ID" and enter new Book ID

### "No file uploaded"
**Problem**: File selection dialog cancelled or no file selected
**Solution**: Click on upload area and select CSV file

### "No valid books to import"
**Problem**: All records in CSV were invalid or duplicates
**Solution**: Check CSV format and fix errors, then retry

## File Locations

### Windows
```
C:\Users\ADHITHAN\Downloads\Library-Management-System\
├── server.js
├── package.json
├── public\index.html
├── data\books.csv
├── uploads\
├── sample-books.csv
├── comprehensive-books.csv
└── README.md
```

### Access Files
- **Open folder**: Right-click workspace, "Open in Terminal"
- **View data**: `data/books.csv` (open with Excel or text editor)
- **Download**: Use "📥 Download CSV" button in app

## Troubleshooting

### Port Already in Use
**Error**: `Error: listen EADDRINUSE: address already in use :::3000`
**Solution**: 
```powershell
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm start
```

### Module Not Found
**Error**: `Cannot find module 'express'`
**Solution**: 
```powershell
npm install
```

### CSV File Not Importing
**Solution**: Check:
1. Header row format: `Book ID,Book Name,Author Name,ISBN,Quantity`
2. No extra spaces in headers
3. ISBN format is correct (10 or 13 digits)
4. Book ID is alphanumeric only
5. All required fields are filled

### Search Not Finding Books
**Solution**:
1. Try simpler search terms
2. Check spelling
3. Try searching in "All Fields" instead of specific field
4. Search is case-insensitive, so case shouldn't matter

### Data Not Appearing
**Solution**:
1. Refresh browser (F5 or Ctrl+R)
2. Check browser console (F12) for errors
3. Verify `data/books.csv` exists and has data
4. Restart server (Ctrl+C then `npm start`)

## API Endpoints (For Advanced Users)

### Get All Books
```
GET http://localhost:3000/api/books
```

### Add Single Book
```
POST http://localhost:3000/api/add-book
Content-Type: application/json

{
  "bookId": "315030",
  "bookName": "The Great Gatsby",
  "authorName": "F. Scott Fitzgerald",
  "isbn": "978-0-7432-7356-5",
  "quantity": 1
}
```

### Check for Duplicate
```
POST http://localhost:3000/api/check-duplicate
Content-Type: application/json

{
  "bookId": "315030",
  "isbn": "978-0-7432-7356-5"
}
```

### Search Books
```
GET http://localhost:3000/api/search?query=gatsby&type=name
```

### Delete Book
```
DELETE http://localhost:3000/api/books/315030
```

### Download CSV
```
GET http://localhost:3000/api/download-csv
```

## Performance Tips

1. **Large CSV Imports**: Import in batches of 100-500 records
2. **Large Database**: Database with 1000+ books performs well
3. **Search Optimization**: Use specific search type instead of "All Fields"
4. **Regular Backups**: Download CSV weekly

## Keyboard Shortcuts

- **F5**: Refresh page (reload data)
- **F12**: Open developer console (for troubleshooting)
- **Ctrl+S**: Save (browser shortcut, use Download CSV instead)
- **Ctrl+F**: Browser find (search page content)

## Tips for Data Entry

### Best Practices
1. **Consistent Book ID format**: All numeric or all alphanumeric
2. **Always use ISBN**: Helps prevent duplicates
3. **Check before bulk import**: Test with small batch first
4. **Verify import summary**: Review conflicts/errors
5. **Regular backups**: Download CSV weekly

### Example Good Data
```csv
Book ID,Book Name,Author Name,ISBN,Quantity
315030,The Great Gatsby,F. Scott Fitzgerald,978-0-7432-7356-5,3
315031,To Kill a Mockingbird,Harper Lee,978-0-06-112008-4,2
315032,1984,George Orwell,978-0-451-52493-2,2
```

### Example Bad Data
```csv
Book ID,Book Name,Author Name,ISBN,Quantity
BOOK-001,Book,Author,INVALID,1  ← Bad: ID has hyphen, ISBN invalid
315030,Book,,978-0-1234-5678-9,1  ← Bad: Missing Author Name
,Book,Author,978-0-1234-5678-9,1  ← Bad: Missing Book ID
```

## Getting Help

### Check Documentation
1. `README.md` - Complete documentation
2. `TESTING_GUIDE.md` - Testing procedures
3. `DATA_VALIDATION_GUIDE.md` - Validation rules
4. `ENHANCEMENTS.md` - Feature details

### Common Issues
- See "Error Messages & Solutions" above
- See "Troubleshooting" section above

### Browser Console
- Press F12 to open developer tools
- Check Console tab for JavaScript errors
- Check Network tab to see API calls

---

**Happy managing your library!** 📚
