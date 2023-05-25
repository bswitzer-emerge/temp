
/* 
  functions overview since this is a bit messy!

  MergeData - Main function that fires when script is run
  setInventoryToZero - If there's a merged sheet, it will set all inventory to zero. This way when IDs are detected, they can be set to inventory of 1.
  checkAndCreateSheet - Makes sure a merged sheet tab exists, if it does not, it will create one.
  isIDExists - used to find existing IDs
  updateInventory - compares important data against merged data. If an ID is found, sets inventory to 1.
  fillOutMissingCols - Shopify with Matrixify requires some duplicate data, this fills out said data programically.
  copyTabToAnotherSheet - Matrixify doesn't understand Google sheets with multiple tabs. This copies merged to a seperate sheet.


  //error checks
  errorCatchColumnNotFound_fillOutMissingCols - If a column is missing, this will give the array position to let you know which can't be found in merged data when fillOutMissingCols

  This sheet can be found in the github project for currents. If you make changes, please update it in the "Google Sheets" dir

*/


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



  checkAndCreateSheet(mergedSheet, ss); // make sure sheet exists, if it doesn't make it

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
  /* closing functions: These run a series of commands to */
  updateInventory(sheet1, mergedSheet ); // now that rows have been created, set the proper inventory;
  fillOutMissingCols(mergedSheet); // A few columns need to have values assigned that are either duplicates or combinations of data (Title and ID)
  copyTabToAnotherSheet();  // Moves Merged to a separate sheet that only has one tab so Matrixify can import the data.
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



function checkAndCreateSheet(mergedSheet, ss) {
if (!mergedSheet) {
  // If 'Merged' sheet doesn't exist, create a new sheet
      mergedSheet = ss.insertSheet('Merged');
    // place the header if it doesn't exist
    var lastRow1 = mergedSheet.getLastRow();
    //mergedSheet.getRange(lastRow1 + 1, 1, 1, mergedData[0].length).setValues([mergedData[0]]);
    Logger.log("Merged sheet not found! New sheet created.");
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
function fillOutMissingCols(sheet) {
var data = sheet.getDataRange().getValues();


// Step 1: Item IDs & SKU
// Find the column index of "ID" and "Item ID"
var idColumnIndex = -1;
var itemIdColumnIndex = -1;
var itemVarientSKUColumnIndex = -1;

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


//Step 2 
// Find the column indexes of "Gen Type", "Battery Size", "Model", and "Make"
var genTypeColumnIndex = -1;
var batterySizeColumnIndex = -1;
var modelColumnIndex = -1;
var makeColumnIndex = -1;
var sohMeasurementIndex = -1;
var modulesIndex = -1;
var itemIDIndex = -1;

var headers = data[0];
for (var i = 0; i < headers.length; i++) {
  if (headers[i] === "Gen Type") {
    genTypeColumnIndex = i;
  } else if (headers[i] === "Battery Size") {
    batterySizeColumnIndex = i;
  } else if (headers[i].includes("model")) {
    modelColumnIndex = i;
  } else if (headers[i].includes("make")) {
    makeColumnIndex = i;
  } else if (headers[i].includes("SOH")) {
    sohMeasurementIndex = i;
  } else if (headers[i].includes("modules")) {
    modulesIndex = i;
  } else if (headers[i] === "ID") {
    itemIDIndex = i;
  }
}
errorCatchColumnNotFound_fillOutMissingCols([genTypeColumnIndex, batterySizeColumnIndex,modelColumnIndex, makeColumnIndex, sohMeasurementIndex, modulesIndex, itemIDIndex]);



// Combine the values and place them in the "Title" column
var titleColumnIndex = headers.indexOf("Title");
var handleColumnIndex = headers.indexOf("Handle");


if (genTypeColumnIndex !== -1 && batterySizeColumnIndex !== -1 && modelColumnIndex !== -1 && makeColumnIndex !== -1 && titleColumnIndex !== -1 && modulesIndex !== -1 && itemIDIndex !== -1 ) {
  for (var row = 1; row < data.length; row++) {
    var genType = data[row][genTypeColumnIndex];
    var batterySize = data[row][batterySizeColumnIndex];
    var model = data[row][modelColumnIndex];
    var make = data[row][makeColumnIndex];
    var stateOfHealth = data[row][sohMeasurementIndex];
    var modules = data[row][modulesIndex];
    var itemID = data[row][itemIDIndex];
    var combinedValue = `${make} ${model} ${genType} - ${batterySize} ${stateOfHealth}% ${modules}`;  // create title
    // we need to make unique but predictable handles for the URLs
    var handle = `${make}-${model}-${genType}-${batterySize}-${stateOfHealth}-${modules}-modules`;
    handle = `${handle}-${itemID}`;
    handle = handle.replace(/\s/g, ''); //removespaces
    handle = handle.toLowerCase();
   // Logger.log(handle)
   // Logger.log(combinedValue)
    sheet.getRange(row + 1, titleColumnIndex + 1).setValue(combinedValue); //place title
    sheet.getRange(row + 1, handleColumnIndex + 1).setValue(handle); //place handle
  }
  Logger.log("Values combined successfully.");
} else {
  Logger.log("One or more required columns not found. Did one of the columns change?");
}
}


function copyTabToAnotherSheet() {
var sourceSpreadsheetId = "1V_beiSINjzvvZjPchRStIPk-MYBqAwzUVl4wE2-TLfA"; // Nissan Product List https://docs.google.com/spreadsheets/d/1V_beiSINjzvvZjPchRStIPk-MYBqAwzUVl4wE2-TLfA/edit#gid=1292577288
var sourceSheetName = "Merged"; // Export Data for Currents https://docs.google.com/spreadsheets/d/1_fp1gXv7KNThgnULjN7LJg1dlCaN0QZS4s4D9QQswiI/edit#gid=0

var targetSpreadsheetId = "1_fp1gXv7KNThgnULjN7LJg1dlCaN0QZS4s4D9QQswiI"; // Replace with the ID of the target spreadsheet
var targetSheetName = "Copied Merged"; // Replace with the name you want for the copied sheet
  
var sourceSpreadsheet = SpreadsheetApp.openById(sourceSpreadsheetId);
var sourceSheet = sourceSpreadsheet.getSheetByName(sourceSheetName);

var targetSpreadsheet = SpreadsheetApp.openById(targetSpreadsheetId);
var targetSheet = targetSpreadsheet.getSheetByName(targetSheetName);

var sourceRange = sourceSheet.getDataRange();
var targetRange = targetSheet.getRange(1, 1, sourceRange.getNumRows(), sourceRange.getNumColumns());

targetRange.setValues(sourceRange.getValues());
}


function errorCatchColumnNotFound_fillOutMissingCols( check ) {
for (var i = 0; i < check.length; i++) {
  if (check[i] === -1) {
    Logger.log("Found missing column at position " + i);
  }
} 
}
