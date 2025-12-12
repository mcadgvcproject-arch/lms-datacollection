# Testing Guide - Library Management System

## Quick Start Testing

### 1. Start the Application
```powershell
cd C:\Users\ADHITHAN\Downloads\Library-Management-System
npm install
npm start
```

Open browser: `http://localhost:3000`

## Testing Scenarios

### Test 1: Add Single Book with Validation
**Objective**: Test data entry with validation

1. Go to "Add Book" tab
2. Try adding book with invalid ISBN (e.g., "123"):
   - ❌ Should show "Invalid ISBN format" error
3. Try adding book with invalid Book ID (e.g., "BOOK-001"):
   - ❌ Should show "Book ID must be alphanumeric" error
4. Add valid book:
   - Book ID: `315030`
   - Book Name: `The Great Gatsby`
   - Author: `F. Scott Fitzgerald`
   - ISBN: `978-0-7432-7356-5`
   - Quantity: `2`
   - ✅ Should add successfully

### Test 2: Duplicate Detection
**Objective**: Test duplicate checking functionality

1. Try to add same book again with same Book ID:
   - ✅ Should show warning: "Book Already Exists"
   - ✅ Should show current quantity
   - Should offer to "Increase Quantity" or "Use Different ID"

2. Click "Increase Quantity" with quantity 1:
   - ✅ Quantity should become 3 (2+1)
   - ✅ Message: "Quantity increased by 1 copies!"

3. Try adding with different ID but same ISBN:
   - Book ID: `315030A`
   - Book Name: `The Great Gatsby`
   - Author: `F. Scott Fitzgerald`
   - ISBN: `978-0-7432-7356-5`
   - ✅ Should detect duplicate by ISBN

### Test 3: View and Statistics
**Objective**: Test view tab with statistics

1. Go to "View Books" tab
2. Verify:
   - ✅ Shows "Total Books": Should be 1 (unique books)
   - ✅ Shows "Total Copies": Should be 3 (total quantity)
   - ✅ Shows last updated date
   - ✅ Table displays all book details

### Test 4: Search Functionality
**Objective**: Test search and filter

1. Add another book:
   - Book ID: `315031`
   - Book Name: `To Kill a Mockingbird`
   - Author: `Harper Lee`
   - ISBN: `978-0-06-112008-4`

2. Test searches:
   - Search by ID: "315030" → Should find The Great Gatsby
   - Search by Name: "mockingbird" → Should find To Kill a Mockingbird
   - Search by Author: "lee" → Should find To Kill a Mockingbird
   - Search by ISBN: "978-0" → Should find both books
   - Search all fields: "gatsby" → Should find The Great Gatsby

3. Click "Clear" button:
   - ✅ Should reset and show all books

### Test 5: CSV Import with No Duplicates
**Objective**: Test clean CSV import

1. Create `test-books.csv`:
```csv
Book ID,Book Name,Author Name,ISBN,Quantity
315032,1984,George Orwell,978-0-451-52493-2,2
315033,Pride and Prejudice,Jane Austen,978-0-14-143951-8,1
```

2. Go to "Import CSV" tab
3. Upload file:
   - ✅ Should show: "3 books added successfully"
   - ✅ Should show import summary

### Test 6: CSV Import with Duplicates
**Objective**: Test duplicate handling in CSV import

1. Create `test-duplicates.csv`:
```csv
Book ID,Book Name,Author Name,ISBN,Quantity
315030,The Great Gatsby,F. Scott Fitzgerald,978-0-7432-7356-5,5
315034,New Book,New Author,978-0-1234-5678-9,1
```

2. Upload file:
   - ✅ Should show: "1 books added successfully"
   - ✅ Should show: "1 duplicates skipped"
   - ✅ Should display conflict details

### Test 7: CSV Import with Invalid Records
**Objective**: Test validation during import

1. Create `test-invalid.csv`:
```csv
Book ID,Book Name,Author Name,ISBN,Quantity
INVALID-ID,Book 1,Author 1,978-0-1234-5678-9,1
315035,Book 2,Author 2,123-INVALID,1
315036,Book 3,Author 3,,1
```

2. Upload file:
   - ✅ Should show: "0 books added"
   - ✅ Should show: "3 skipped records"
   - ✅ Should display reasons:
     - Invalid Book ID format
     - Invalid ISBN format
     - Missing required fields

### Test 8: CSV Import with File Duplicates
**Objective**: Test duplicate detection within same file

1. Create `test-internal-dupes.csv`:
```csv
Book ID,Book Name,Author Name,ISBN,Quantity
315040,Book A,Author A,978-0-1111-1111-1,1
315041,Book B,Author B,978-0-2222-2222-2,1
315040,Book A Duplicate,Author A,978-0-1111-1111-1,1
```

2. Upload file:
   - ✅ Should show: "2 books added"
   - ✅ Should show: "1 duplicate within file skipped"
   - ✅ Should display: "315040 - Duplicate within file"

### Test 9: Delete Functionality
**Objective**: Test book deletion

1. In "View Books" tab, click Delete on any book
2. Confirm deletion:
   - ✅ Should show: "Book deleted successfully!"
   - ✅ Book should disappear from table
   - ✅ Total count should decrease

### Test 10: Download CSV
**Objective**: Test CSV export

1. In "View Books" tab, click "📥 Download CSV"
2. Verify downloaded file:
   - ✅ Should contain all books
   - ✅ Should have proper headers
   - ✅ Should be valid CSV format

### Test 11: Real-time Validation
**Objective**: Test live field validation

1. In "Add Book" tab:
   - Type Book ID: `TEST-ID`
   - ✅ Should show red validation error (non-alphanumeric)
   - Change to: `TEST123`
   - ✅ Should show green validation success

2. Type ISBN: `978-0-7432-7356-5`
   - ✅ Should show green validation success
   - Change to: `invalid`
   - ✅ Should show red validation error

### Test 12: Multiple Quantity CSV Import
**Objective**: Test quantity updates in CSV

1. Create `test-quantity.csv`:
```csv
Book ID,Book Name,Author Name,ISBN,Quantity
315050,Book X,Author X,978-0-5555-5555-5,10
```

2. Upload file:
   - ✅ Should add with quantity 10
3. Upload same file again:
   - ✅ Should detect duplicate
   - Or modify and upload with different ID

## Edge Cases to Test

### Edge Case 1: Empty File
- Upload empty CSV file
- ✅ Should show error: "No valid books to import"

### Edge Case 2: Only Headers
- Upload CSV with only headers, no data
- ✅ Should show error: "No valid books to import"

### Edge Case 3: Special Characters in Names
- Book Name: `The #1 Book & More!`
- Author: `O'Brien, Jane & Co.`
- ✅ Should accept and display correctly

### Edge Case 4: Very Long Text
- Book Name: Very long title (100+ characters)
- ✅ Should accept and display properly in table

### Edge Case 5: Case Sensitivity
- Add book with "Python Programming"
- Search for "python"
- ✅ Should find it (case-insensitive)

### Edge Case 6: Multiple Spaces
- Book Name: `The  Great  Gatsby` (extra spaces)
- ✅ Should accept as is (or trim as needed)

## Performance Testing

### Test Large CSV Import
1. Create CSV with 100+ books
2. Import file:
   - Should complete within reasonable time
   - Should show progress
   - Should handle memory efficiently

### Test Large Dataset Search
1. Add 50+ books
2. Perform searches:
   - Should return results quickly
   - Should not lag UI

## Verification Checklist

- [ ] All books display correctly in table
- [ ] Statistics (total books, total copies) are accurate
- [ ] Search filters work for all field types
- [ ] Duplicate detection prevents duplicates
- [ ] CSV import handles conflicts gracefully
- [ ] Data validation prevents invalid entries
- [ ] Download CSV contains all data
- [ ] Responsive design works on mobile
- [ ] Error messages are clear and helpful
- [ ] Success messages appear after operations
- [ ] Real-time validation provides instant feedback
- [ ] Import summary shows accurate counts
- [ ] Quantity updates work correctly
- [ ] Book deletion removes data permanently

## Troubleshooting

### CSV Not Importing
- Verify header row: `Book ID,Book Name,Author Name,ISBN,Quantity`
- Check for extra spaces in headers
- Ensure ISBN format is correct
- Look at import summary for specific errors

### Duplicate Detection Not Working
- Ensure Book IDs are identical
- Verify ISBN comparison (with/without hyphens)
- Check for leading/trailing spaces

### Search Not Finding Books
- Search is case-insensitive, but be sure text matches
- Try simpler search terms
- Try searching all fields instead of specific field

## Notes
- All data is stored in `data/books.csv`
- Clear browser cache if UI doesn't update
- Close and reopen browser tab if experiencing issues
- Check browser console (F12) for JavaScript errors
