

function mergeData() {

    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
  
    // Get the two sheets
    var sheet1 = ss.getSheetByName('Dynamic Data From Nissan');
    var sheet2 = ss.getSheetByName('Static Battery Specifications');
    var mergedSheet = ss.getSheetByName('Merged');

    setInventoryToZero(mergedSheet); // zero out inventory

  
    // Get data from the two sheets
    var data1 = sheet1.getDataRange().getValues();
    var data2 = sheet2.getDataRange().getValues();
    var mergedData = [];
  
    let isFirstItem = true;
  
    // Create a map for the data from sheet2
    var map2 = {};
    data2.forEach(function(row) {
      var key = row[0] + '-' + row[1];  // The key is a combination of the first two columns
      map2[key] = row.slice(2);  // The value is the rest of the row
    });
    
    // Add "Inventory" column to data1 and set each entry to 1
    data1.forEach(function (row, index) {
      if (index === 0) {
        row.push("Inventory"); // Append "Inventory" as the value for the first entry in the "Inventory" column
      } else {
        row.push(1); // Append "1" as the value for the remaining entries in the "Inventory" column
      }
    });



    checkAndCreateSheet(mergedSheet); // make sure sheet exists, if it doesn't make it

    // Merge the data and multiply price by 10%
    data1.forEach(function(row) {
      var key = row[0] + '-' + row[1];
      var rowData = row.concat(map2[key] || []);
  
      if (!isFirstItem) {
        // Multiply the value in column E (index 4) by 1.1
        rowData[4] = rowData[4] * 1.1;
      } else {
        isFirstItem = false;
      }
  
      // Check if the ID already exists in the 'Merged' sheet
      if (mergedSheet && !isIDExists(row[2], mergedSheet)) {
        mergedData.push(rowData);
      }
    });
  
    if (mergedData.length > 0) {
      // Append the unique rows to the 'Merged' sheet
      var lastRow = mergedSheet.getLastRow();
      mergedSheet.getRange(lastRow + 1, 1, mergedData.length, mergedData[0].length).setValues(mergedData);
    }
    updateInventory(sheet1, mergedSheet ); // now that rows have been created, set the proper inventory;
    copyItemID();
  }
  
  
  
// Check for for duplicates, if there are duplicates, ignore them
function isIDExists(id, sheet) {
    // Get the number of rows in the sheet
  var numRows = sheet.getLastRow();
    // If the number of rows is less than 1, there are no existing IDs, so return false
  if (numRows < 1) {
    return false;
  }
    // Get the values in column C (index 2) starting from the second row
  var columnCValues = sheet.getRange(1, 3, numRows).getValues();
  return columnCValues.flat().some(function(value) {
    return value === id;
  });
}



function checkAndCreateSheet(mergedSheet) {
  if (!mergedSheet) {
    // If 'Merged' sheet doesn't exist, create a new sheet
   		 mergedSheet = ss.insertSheet('Merged');
      // place the header if it doesn't exist
      var lastRow1 = mergedSheet.getLastRow();
      //mergedSheet.getRange(lastRow1 + 1, 1, 1, mergedData[0].length).setValues([mergedData[0]]);
    }
}



// first set inventory to zero
function setInventoryToZero(sheet) {  
  // Check to see if the sheet exists
  if (sheet) { 
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var headers = values[0];
    var inventoryColumnIndex = headers.indexOf("Inventory");

    if (inventoryColumnIndex !== -1) {
      var numRows = values.length;
      var inventoryColumn = dataRange.offset(1, inventoryColumnIndex, numRows - 1, 1); // Exclude the header row
      inventoryColumn.setValue(0);
    }
  }
}



function updateInventory(firstSheet, secondSheet ) {
  var firstHeaders = firstSheet.getRange(1, 1, 1, firstSheet.getLastColumn()).getValues()[0];
  var secondHeaders = secondSheet.getRange(1, 1, 1, secondSheet.getLastColumn()).getValues()[0];
  
  var itemIdColumnIndex = firstHeaders.indexOf("Item ID") + 1;
  var inventoryColumnIndex = secondHeaders.indexOf("Inventory") + 1;
  
  var firstData = firstSheet.getRange(2, itemIdColumnIndex, firstSheet.getLastRow() - 1, 1).getValues();
  var secondData = secondSheet.getRange(2, itemIdColumnIndex, secondSheet.getLastRow() - 1, 1).getValues();
  
  for (var i = 0; i < firstData.length; i++) {
    var itemId = firstData[i][0];
    var rowIndex = secondData.findIndex(function(row) { return row[0] === itemId; });
    
    if (rowIndex !== -1) {
      secondSheet.getRange(rowIndex + 2, inventoryColumnIndex).setValue(1); // Adding 2 to rowIndex to account for header row
    }
  }
}

// This script duplicates existing columns into other columns.
function copyItemID(sheet) {
  var data = sheet.getDataRange().getValues();
  
  // Find the column index of "ID" and "Item ID"
  var idColumnIndex = -1;
  var itemIdColumnIndex = -1;
  
  var headers = data[0];
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] === "ID") {
      idColumnIndex = i;
    } else if (headers[i] === "Item ID") {
      itemIdColumnIndex = i;
    }
  }
  
  // Copy the values from "Item ID" to "ID"
  if (idColumnIndex !== -1 && itemIdColumnIndex !== -1) {
    for (var row = 1; row < data.length; row++) {
      var idValue = data[row][itemIdColumnIndex];
      sheet.getRange(row + 1, idColumnIndex + 1).setValue(idValue);
    }
    Logger.log("Values copied successfully.");
  } else {
    Logger.log("Column 'ID' or 'Item ID' not found.");
  }
}
