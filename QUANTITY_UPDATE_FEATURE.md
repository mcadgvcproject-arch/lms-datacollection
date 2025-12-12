# Automatic Quantity Update Feature

## Overview
The system now automatically merges duplicate books based on their **Book ID** and updates quantities instead of rejecting them.

## How It Works

### When Uploading CSV Files:
- If a book with the same **Book ID** already exists in the database, the system will:
  - **Add** the quantities together
  - **Keep** the existing book record
  - **Update** only the quantity field

### Example:

#### Scenario 1: New CSV Upload
If your CSV contains:
```csv
Book ID,Book Name,Author Name,ISBN,Quantity
315030,Introduction to Algorithms,Thomas H. Cormen,9780262033848,2
315030,Introduction to Algorithms,Thomas H. Cormen,9780262033848,3
315030,Introduction to Algorithms,Thomas H. Cormen,9780262033848,1
```

**Result:** Only 1 book will be added with quantity = 6 (2+3+1)

#### Scenario 2: Updating Existing Books
If `315030` already exists with quantity 10, and you upload:
```csv
Book ID,Book Name,Author Name,ISBN,Quantity
315030,Introduction to Algorithms,Thomas H. Cormen,9780262033848,5
```

**Result:** Book `315030` will now have quantity = 15 (10+5)

## Features

### 1. Automatic Duplicate Handling
- Duplicates within the same CSV file are merged before importing
- Duplicates with existing database records update quantities
- No manual intervention needed

### 2. Detailed Import Reports
After uploading, you'll see:
- ✅ Number of new books added
- 🔄 Number of existing books updated
- ⚠️ Number of duplicates merged within file
- ❌ Number of invalid records skipped

### 3. Cleanup Utility
A cleanup script is provided to merge existing duplicates:

```bash
node cleanup-duplicates.js
```

This will:
- Scan your `data/books.csv` file
- Find all books with the same Book ID
- Merge their quantities
- Save the cleaned data back

## Usage

### Testing the Feature
1. Start the server:
```bash
npm start
```

2. Upload the test file `test-import.csv`:
   - Go to http://localhost:3000
   - Click "Import CSV" tab
   - Select `test-import.csv`
   - Upload and see the results

### Manual Book Addition
When adding books manually, you can still use the "Update Quantity" action if a duplicate is detected.

## Important Notes

- **Book ID** is the primary identifier for merging
- Quantities are always added together (never replaced)
- The first occurrence's metadata (name, author, ISBN) is preserved
- Empty or invalid rows are automatically skipped
- All changes are logged in the import summary

## Files Modified

1. `server.js` - Updated `/api/upload-csv` endpoint to merge duplicates
2. `public/index.html` - Updated UI to show "updated" books in import results
3. `cleanup-duplicates.js` - New utility script for cleaning existing data

## Benefits

✅ No more duplicate entries for the same book
✅ Accurate inventory tracking
✅ Simplified CSV imports
✅ Automatic quantity management
✅ Clear feedback on all operations
