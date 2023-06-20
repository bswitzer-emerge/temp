/*
  [Link to this script in Github](https://github.com/EmergeInteractive/currents-marketplace-mvp/blob/development/google-sheets/google-sheets-inventory.js).
  If you make changes here in the App Script editor, please update it in source control as well.

  Future improvements:
  - Validate the order of the columns and that they are all present before allowing generation to happen.
*/

// settings
let settings = {}
settings.inventoryText   =  "Variant Inventory Qty"; // This is the name of the column for inventory.
settings.priceText   =  "Variant Price"; // This is the name of the column for inventory.
settings.productList = {}
settings.productList.url =  "https://docs.google.com/spreadsheets/d/1V_beiSINjzvvZjPchRStIPk-MYBqAwzUVl4wE2-TLfA/edit#gid=1292577288"
settings.productList.id  =  "1V_beiSINjzvvZjPchRStIPk-MYBqAwzUVl4wE2-TLfA"; // Nissan Product List
settings.productList.src =  "Products"; // Needs to be named "Products" to be recognized in import to Marketplace

const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const nissanSheetRef = activeSpreadsheet.getSheetByName('Inventory from Supplier');
const specSheetRef = activeSpreadsheet.getSheetByName('Static Battery Specifications');
const productsRef = activeSpreadsheet.getSheetByName("Products");

/**
 * Primary main method that runs to merge inventory with battery specifications,
 * in preparation for import to Currents Marketplace
 */
function main() {
    const inventoryData = nissanSheetRef.getDataRange().getValues().slice(1);
    const inventoryHeaders = nissanSheetRef.getDataRange().getValues()[0];

    const productsData = productsRef.getDataRange().getValues().slice(1);
    const productsHeaders = productsRef.getDataRange().getValues()[0];

    const specsInfo = specSheetRef.getDataRange().getValues();

    if(!nissanSheetRef) {
        SpreadsheetApp.getUi().alert('There was a problem importing your inventory data. Please contact Emerge for assistance.');
        Logger.log("We were unable to find the Nissan data to import. Do you have a worksheet named 'Inventory from Supplier'?");
    }

    if (!specSheetRef) {
        SpreadsheetApp.getUi().alert('There was a problem importing your inventory data. Please contact Emerge for assistance.');
        Logger.log("We were unable to find the battery specifications. Do you have a worksheet named 'Static Battery Specifications'?");
    }

    ensureProductsSheet(productsRef, activeSpreadsheet); // make sure sheet exists, if it doesn't make it

    SpreadsheetApp.flush();

    // Set the inventory of all items in Products to zero. We will reset inventory when we have more information about the new data
    setInventoryToZero(productsRef); // zero out inventory

    // Create a map for the data from specifications. The key is a combination of the Gen type and the Battery size
    var specLookup = buildSpecLookup(specsInfo);
    let newProducts = [];

    Logger.log("Processing items in inventory...");
    inventoryData.forEach((item) => {
        const itemId = item[getColIdx("Item ID", inventoryHeaders)];
        const itemGenType = item[getColIdx("Gen Type", inventoryHeaders)];
        const itemBatterySize = item[getColIdx("Battery Size", inventoryHeaders)];
        const calculatedPrice = item[getColIdx("Price", inventoryHeaders)] * 1.1;
        const itemSOH = item[getColIdx("SOH Measurement", inventoryHeaders)];
        const itemSOHTestDate = item[getColIdx("SOH Test Date", inventoryHeaders)];

        const specKey = itemGenType + '-' + itemBatterySize;

        if(itemGenType === "Gen 3") {
            const dialog = SpreadsheetApp.getUi();

            const response = dialog.alert(
                'There is a Gen 3 battery in your inventory. Are you sure you want to import this item?', dialog.ButtonSet.YES_NO);

            if (response == dialog.Button.NO) {
                throw new Error('Please remove the Gen 3 battery from the inventory data');
            }
        }

        // if it already exists on the products sheet, update the information
        if(isIDExists(itemId, productsRef)) {
            Logger.log("Updating product with Item ID " + itemId);
            // get index in existing products to update it. "magic numbers" account for header and and that sheet cells are 1 indexed
            const productRowIdx = findProductRowById(itemId, productsData, productsHeaders) + 2

            // Update values from inventory to the product sheet
            // Gen Type, Battery Size, Price, SOH
            productsRef.getRange(productRowIdx, getColIdx("Gen Type", productsHeaders) + 1).setValue(itemGenType);
            productsRef.getRange(productRowIdx, getColIdx("Battery Size", productsHeaders) + 1).setValue(itemBatterySize);
            productsRef.getRange(productRowIdx, getColIdx("Price", productsHeaders) + 1).setValue(item[getColIdx("Price", inventoryHeaders)]);
            productsRef.getRange(productRowIdx, getColIdx("Variant Price", productsHeaders) + 1).setValue(calculatedPrice);
            productsRef.getRange(productRowIdx, getColIdx("SOH Measurement", productsHeaders) + 1).setValue(itemSOH);
            productsRef.getRange(productRowIdx, getColIdx("SOH Test Date", productsHeaders) + 1).setValue(itemSOHTestDate);

            // Set Inventory to 1, since we have it
            productsRef.getRange(productRowIdx, getColIdx("Variant Inventory Qty", productsHeaders) + 1).setValue(1);

            // second scenario, the gen type or battery size is different and the whole thing needs to be redrawn
            specLookup[specKey].forEach((value, index) => {
                // TODO: add some actual column counts so we don't need magic numbers. in this case, spec data starts in the 9th column
                productsRef.getRange(productRowIdx, index + 9).setValue(value)
            })

            // otherwise create a new product to append
        } else {
            item.push(calculatedPrice); // add new price
            item.push(1); // add to inventory
            newProducts.push(item.concat(specLookup[specKey] || []))
        }
    })

    // Append the new products to the end of the products sheet
    if(newProducts.length > 0) {
        Logger.log("Adding new products...");
        const lastRow = productsRef.getLastRow();
        productsRef.getRange(lastRow + 1, 1, newProducts.length, newProducts[0].length).setValues(newProducts);
    }

    SpreadsheetApp.flush(); // need to flush the buffer to make sure we have current information

    // Duplicate values to additional columns as required for import data
    expandImportData();

    // TODO: Set inventory for those items that we want to pull out of the store
    // If there is a 0 in the inventory qty column, set it to empty and add a -1 in the inventory adjust

    Logger.log("Processing complete.");
}

/**
 * Builds a lookup table for battery specifications, so we can append additional information
 * to inventory.
 * @param specsInfo - sheet data for battery specifications
 * @returns lookup map with key as Gen Type + Battery Size concatenation
 */
function buildSpecLookup(specsInfo) {
    var specLookup = {};
    specsInfo.forEach(function(row) {
        var key = row[0] + '-' + row[1];  // The key is a combination of the first two columns
        specLookup[key] = row.slice(2);  // The value is the rest of the row
    });
    return specLookup
}

/**
 * Finds the row index of the existing product in the Products sheet
 * @param id - number value that represents productId that we are looking up
 * @param products - array of rows in the product table
 *
 * @returns the row index of the product we want to work on
 */
function findProductRowById(id, products, headers) {
    return products.findIndex(row => row[getColIdx("Item ID", headers)] === id);
}

/**
 * Determines if we already have an existing product on the products sheet
 * Matched on Item ID
 *
 * @param id - Item ID
 * @param sheet - reference to products sheet
 */
function isIDExists(id, sheet) {
    // Get the number of rows in the sheet
    var numRows = sheet.getLastRow();
    // If the number of rows is less than 1, there are no existing IDs, so return false
    if (numRows < 1) {
        return false;
    }
    // Get the values in column A (index 1) starting from the second row
    var itemIDCol = sheet.getRange(1, 1, numRows).getValues();
    return itemIDCol.flat().some(function(value) {
        return value === id;
    });
}

/**
 * Finds the column index of a header by it's english language name
 * Throws an error if we can't find that header -- the headers need to be consistent for this script to work
 *
 * @param name - col to look for
 * @param headers - array of sheet headers
 */
function getColIdx(name, headers) {
    const idx = headers.findIndex(header => header === name)
    if (idx === -1) {
        Logger.log("We can't find that column in the product inventory.")
        throw new Error("There is a problem with importing your data. Contact Emerge for assistance.")
    }
    return idx
}

/**
 * Finds the column index of a header with a fuzzy substring match
 * Throws an error if we can't find any header that matches
 *
 * @param name - col to look for
 * @param headers - array of sheet headers
 */
function fuzzyColIdx(name, headers) {
    const idx = headers.findIndex(header => header.includes(name))
    if (idx === -1) {
        Logger.log("We can't find that column in the product inventory.")
        throw new Error("There is a problem with importing your data. Contact Emerge for assistance.")
    }
    return idx
}

/**
 * Ensures the existence of a Products sheet for import
 *
 * @param id - Item ID
 * @param sheet - reference to products sheet
 */
function ensureProductsSheet(productSheet, activeSpreadsheet) {
    // make sure it exists
    if (!productSheet) {
        productSheet = activeSpreadsheet.insertSheet(settings.productList.src);
        Logger.log("Products sheet not found! New sheet created.");
    }

    //make sure it has the proper headers
    if(productSheet.getDataRange().isBlank()) {
        const inventoryHeaders = nissanSheetRef.getDataRange().getValues()[0];
        const specsHeaders = specSheetRef.getDataRange().getValues()[1].slice(2);
        const combined = inventoryHeaders
            .concat([settings.priceText])
            .concat([settings.inventoryText])
            .concat(specsHeaders);
        console.log(combined)
        productSheet.appendRow(combined);
    }
}


/**
 * Sets all items in existing product sheet to 0. This way when IDs are detected, they can be set to inventory of 1.
 * @param sheet
 */
function setInventoryToZero(sheet) {
    // Check to see if the sheet exists
    if (sheet) {
        var dataRange = sheet.getDataRange();
        var values = dataRange.getValues();
        var headers = values[0];
        var inventoryColumnIndex = headers.indexOf(settings.inventoryText);

        if (inventoryColumnIndex !== -1) {
            var numRows = values.length;
            // we only want to set inventory if there are products
            if(numRows > 1) {
                var inventoryColumn = dataRange.offset(1, inventoryColumnIndex, numRows - 1, 1); // Exclude the header row
                inventoryColumn.setValue(0);
            }
        }
    } else {
        Logger.log("setInventoryToZero() failed. Merged Sheet not found. Something is wrong.")
        throw new Error("There is a problem with importing your data. Contact Emerge for assistance.")
    }
}

/**
 * Duplicates values to additional required columns for import
 */
function expandImportData() {
    const productsRef = activeSpreadsheet.getSheetByName("Products");
    const productsData = productsRef.getDataRange().getValues().slice(1);
    const productsHeaders = productsRef.getDataRange().getValues()[0];

    Logger.log("Begin duplicating values to additional fields...");
    // Indexes of additional columns we need to set duplicate values
    const idColIdx = getColIdx("ID", productsHeaders);
    const titleColIdx = getColIdx("Title", productsHeaders);
    const handleColIdx = getColIdx("Handle", productsHeaders);

    const batteryColIdx = fuzzyColIdx("custom.battery_size", productsHeaders);
    const sohColIdx = fuzzyColIdx("custom.soh", productsHeaders);
    const itemIdIdx = fuzzyColIdx("custom.item_id", productsHeaders);
    const sohTestColIdx = fuzzyColIdx("custom.soh_test_date", productsHeaders);

    productsData.forEach((item, row) => {
        const currentRow = row + 2;
        const itemID = item[getColIdx("Item ID", productsHeaders)];
        const genType = item[getColIdx("Gen Type", productsHeaders)];
        const batterySize = item[getColIdx("Battery Size", productsHeaders)];
        const stateOfHealth = item[getColIdx("SOH Measurement", productsHeaders)];
        const sohTestDate = item[getColIdx("SOH Test Date", productsHeaders)];
        const itemPrice = item[getColIdx("Variant Price", productsHeaders)];

        // these three have to be fuzzy, since we aren't matching on the exact col header
        const model = item[fuzzyColIdx("custom.model", productsHeaders)];
        const make = item[fuzzyColIdx("custom.make", productsHeaders)];
        const modules = item[fuzzyColIdx("custom.modules", productsHeaders)];

        // these two are constructed of other values
        const title = buildTitle(make, model, genType, batterySize, stateOfHealth, itemPrice);
        const handle = buildHandle(itemID, make, model)

        // Set cell values, account for header && 1 index rows/cols
        productsRef.getRange(currentRow, idColIdx + 1).setValue(itemID);
        productsRef.getRange(currentRow, itemIdIdx + 1).setValue(itemID);
        productsRef.getRange(currentRow, titleColIdx + 1).setValue(title);
        productsRef.getRange(currentRow, handleColIdx + 1).setValue(handle);
        productsRef.getRange(currentRow, batteryColIdx + 1).setValue(batterySize);
        productsRef.getRange(currentRow, sohColIdx + 1).setValue(stateOfHealth);
        productsRef.getRange(currentRow, sohTestColIdx + 1).setValue(sohTestDate);
    })
}

/**
 * Builds title string
 *
 * Result: Nissan Leaf / Gen 1 / 40kWh / 60% SOH / $3000
 */
function buildTitle(make, model, genType, batterySize, stateOfHealth, itemPrice) {
    const delimiter = "/";
    const roundedPrice = Math.floor(itemPrice)
    return `${make} ${model} ${delimiter} ${genType} ${delimiter} ${batterySize} ${delimiter} ${stateOfHealth}% SOH ${delimiter} \$${roundedPrice}`;
}

/**
 * Builds handle string (unique for URL navigation)
 */
function buildHandle(itemID, make, model) {
    let handle = `${make}-${model}-${itemID}`;
    handle = handle.replace(/\s/g, ''); //removespaces
    handle = handle.toLowerCase();
    return handle;
}