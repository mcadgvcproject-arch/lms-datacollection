# Library Management System

A simple web application for managing a library's book collection.

## Features

✅ **Add Single Books** - Manually add books with ID, Name, Author, ISBN, and Quantity
✅ **Duplicate Detection** - Real-time detection of duplicate books by ID or ISBN
✅ **Smart Quantity Update** - Automatically increase quantity if book already exists
✅ **Data Validation** - ISBN format validation (10 or 13 digits) and alphanumeric Book ID checking
✅ **Import from CSV** - Bulk import books with advanced duplicate handling
✅ **Smart CSV Import** - Detects duplicates within file and in existing database
✅ **Search & Filter** - Search by Book ID, Name, Author, or ISBN
✅ **View All Books** - See all books in a formatted table with search results
✅ **Delete Books** - Remove books from the collection
✅ **Download CSV** - Export the entire library as CSV for backup
✅ **Statistics** - View total books, total quantity, and last update date
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Import Summary** - Detailed report of conflicts, duplicates, and invalid records

## Quick Start

### Installation

1. Navigate to the project directory:
```bash
cd Library-Management-System
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and go to:
```
http://localhost:3000
```

## CSV Import Format

For bulk importing, your CSV file should have the following format:

```
Book ID,Book Name,Author Name,ISBN,Quantity
315030,Book Title,Author Name,978-0-1234-5678-9,1
```

Required fields:
- **Book ID**: Unique identifier (e.g., 315030)
- **Book Name**: Title of the book
- **Author Name**: Author's full name
- **ISBN**: International Standard Book Number
- **Quantity** (Optional): Number of copies (default: 1)

## Data Storage

- Books are stored in `data/books.csv`
- Uploaded files are temporarily stored in `uploads/`
- All data is persisted in CSV format for easy backup and sharing

## API Endpoints

- `GET /api/books` - Get all books
- `POST /api/add-book` - Add a single book (with duplicate handling)
- `POST /api/check-duplicate` - Check if book exists by ID or ISBN
- `GET /api/search` - Search books by various criteria
- `POST /api/upload-csv` - Import books from CSV (with advanced duplicate detection)
- `DELETE /api/books/:bookId` - Delete a book
- `GET /api/download-csv` - Download all books as CSV

## Advanced Features

### Duplicate Detection
- **Real-time validation** when entering Book ID or ISBN
- **Automatic conflict resolution** during manual entry
- **Smart ISBN matching** to detect same book with different ID
- **Detailed import reports** showing conflicts and skipped records

### Data Validation
- **ISBN Validation**: Accepts 10 or 13 digit ISBN (with or without hyphens)
  - Valid: `978-0-1234-5678-9` or `9780123456789`
- **Book ID Validation**: Alphanumeric characters only
  - Valid: `315030`, `BOOK001`, `B123`
  - Invalid: `BOOK-001`, `BOOK 001`

### Search & Filter
- Search by **Book ID**, **Book Name**, **Author**, **ISBN**
- Search across **all fields** simultaneously
- Real-time results display

### CSV Import with Conflict Handling
When importing CSV files, the system:
1. Validates each record (ISBN format, required fields)
2. Detects duplicates within the file
3. Detects duplicates in the existing database
4. Provides detailed import summary with:
   - Number of books imported
   - Conflicts encountered
   - Skipped records with reasons

## File Structure

```
Library-Management-System/
├── server.js              # Express server & API
├── package.json           # Dependencies
├── public/
│   └── index.html         # Web UI
├── data/
│   └── books.csv          # Database (auto-created)
├── uploads/               # Temporary file storage
└── sample-books.csv       # Sample import file
```

## System Requirements

- Node.js 14+
- npm or yarn

## Installed Packages

- **express** - Web framework
- **multer** - File upload handling
- **csv-parser** - CSV reading
- **csv-writer** - CSV writing
- **body-parser** - Request parsing

## Usage Tips

1. **Adding Books**: Use the "Add Book" tab to manually add individual books
   - System automatically checks for duplicates
   - If found, choose to increase quantity or use a different ID
   - Real-time validation for ISBN and Book ID formats
   
2. **Bulk Import**: Use the "Import CSV" tab to import multiple books at once
   - Accepts CSV with columns: Book ID, Book Name, Author Name, ISBN, Quantity
   - Automatically detects and reports conflicts
   - Shows summary of imported, skipped, and conflicting records
   
3. **View Collection**: Click the "View Books" tab to see all books in your library
   - Displays total books and total quantity of copies
   - Shows last updated date
   - Use search to filter books
   
4. **Search Books**: Use the search feature to find specific books
   - Search by ID, Name, Author, ISBN, or across all fields
   - Results update instantly
   
5. **Backup**: Regularly download your CSV to backup your data

## Data Format Requirements

### Manual Entry
- **Book ID**: Required, must be unique, alphanumeric only
- **Book Name**: Required, any text
- **Author Name**: Required, any text
- **ISBN**: Required, 10 or 13 digits (with or without hyphens)
- **Quantity**: Optional, defaults to 1

### CSV Import Format
```csv
Book ID,Book Name,Author Name,ISBN,Quantity
315030,The Great Gatsby,F. Scott Fitzgerald,978-0-7432-7356-5,3
315031,To Kill a Mockingbird,Harper Lee,978-0-06-112008-4,2
```

**Rules:**
- Duplicate Book IDs are rejected
- Duplicate ISBNs are detected (same book different ID)
- Invalid ISBN formats are skipped with reason
- Missing required fields are skipped with reason
- Multiple copies of same book automatically update quantity

## Notes

- **Book IDs** must be unique and alphanumeric only
- **Duplicate Detection**: System prevents adding books with duplicate IDs or ISBNs
- **Smart Quantity**: When duplicate detected, you can increase existing quantity
- **ISBN Validation**: System validates ISBN format (10 or 13 digits)
- **Data Persistence**: All data is stored in CSV format for easy backup and sharing
- **All dates** are automatically set to the current date when added
- **Search is case-insensitive** for better user experience

## Future Enhancements

- ✏️ Edit existing books
- 📊 Advanced analytics and reports
- 👥 User authentication and multi-user support
- 📅 Book borrowing/returning system
- 🗄️ Database integration (MongoDB/MySQL)
- 📱 Barcode/QR code generation and scanning
- 👤 Member management system
- 📧 Email notifications for due dates
- 📈 Inventory tracking and alerts

---

Created as a simple library management system for tracking book collections using CSV storage.
