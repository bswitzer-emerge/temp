/* 
    This script is for the state of health filter 
    on the collections

    onPageLoadSoh(); - A URL grabby script to fill out the form if the page reloads

    updateInputs() - no argumeents, attached to event listener

    ensureRange() - no arguements, makes sure that the low and high
                    do not conflict with each other (ex low price can't be higher than high price)

    checkTheBoxes() - no argumeents, looks for the #soh-health-form-items, and then
                    checks the ones that match the input range. This  is a work around for the lack of filtering avaliable nu default in facets.liquid
                    It has to simulate a mouse click for the original mystery meat Shopify JS to work.
                    
    timerCountDown / timerCountReset - using the classic StackOverflow solution
                    https://stackoverflow.com/questions/4220126/run-javascript-function-when-user-finishes-typing-instead-of-on-key-u
*/

const sohLowInput = document.getElementById('soh-low');
const sohHighInput = document.getElementById('soh-high');
const checkboxes = document.querySelectorAll('#soh-health-form-items input[type="checkbox"]');
const filteredValues = [];

onPageLoadSoh(); // fire this on first run to make sure the values are reflected.

//timer for keyup
let typingTimer;                //timer identifier
const doneTypingInterval = 700;  //time in ms

// Add event listeners to both inputs
sohLowInput.addEventListener('change', updateInputs);
sohHighInput.addEventListener('change', updateInputs);

sohHighInput.addEventListener('keydown', timerCountReset);
sohLowInput.addEventListener('keydown',timerCountReset );

sohHighInput.addEventListener('keyup', timerCountdown);
sohLowInput.addEventListener('keyup',timerCountdown );

// Event Listener function
function updateInputs() {
    ensureRange();
    checkTheBoxes();
    //console.log(filteredValues);
}


// keep from low exceeding high and high going below low
function ensureRange() {

    let lowValue;
    let highValue;
    console.log(`first check: lowValue: ${lowValue}, highValue: ${highValue}`);
    if (sohLowInput.value) {
        lowValue = 0;
    } else {
        parseInt(sohLowInput.value);
    }

    if (sohHighInput.value) {
        highValue = 100;
    } else {
        highValue = parseInt(sohHighInput.value);
    }
   
   
    console.log(`ensureRange() lowValue ${lowValue}, highValue ${highValue}`);


    if (lowValue > 100 ) {
        lowValue = 100;
        sohLowInput.value = 100;
        sohLowInput.setAttribute('value', 100);
    }

    if (highValue > 100 ) {
        highValue = 100;
        console.log("Too high");
        console.log("Too high");
        console.log("Too high");
        console.log("Too high");
        console.log("Too high");
        sohHighInput.value = 100;
        sohHighInput.setAttribute('value', 100);

    }

    if (lowValue < 0 ) {
        lowValue = 0;
        sohLowInput.value = 0;
    }

    if (highValue < 0 ) {
        highValue = 0;
        sohHighInput.value = 0;
    }

    

    // Ensure #soh-low is never higher than #soh-high
    if (lowValue >= highValue) {
      sohLowInput.value = highValue - 1;
    }
  
    // Ensure #soh-high is never lower than #soh-low
    if (highValue <= lowValue) {
      sohHighInput.value = lowValue + 1;
      sohHighInput.setAttribute('value',  lowValue + 1);
    }
    sohHighInput.setAttribute('value', highValue);
    console.log(`fixes: ensureRange() lowValue ${lowValue}, highValue ${highValue}`);
}

// apply the filter to actual code
function checkTheBoxes() {
    let lowValue = parseInt(sohLowInput.value);
    let highValue = parseInt(sohHighInput.value);

    console.log(`checkTheBoxes() lowValue ${lowValue}, highValue ${highValue}`)

    if (!parseInt(sohLowInput.value)) {
        lowValue = 0;
        sohLowInput.value = 0;
    } 
    if (!parseInt(sohHighInput.value)) {
        highValue = 100;
        sohHighInput.value = 100;
    } 
   

    
    filteredValues.length = 0; // Clear the array
    
    // Go through entire list of checkboxes
    for (const [index, checkbox] of checkboxes.entries()) {
        const checkboxValue = parseInt(checkbox.value);

        if (checkboxValue >= lowValue && checkboxValue <= highValue) {
            // Perform the desired action, e.g., check the checkbox
            checkbox.checked = true;
            filteredValues.push(checkboxValue);
        } else {
            checkbox.checked = false;
            filteredValues.push(checkboxValue);
        }
        // simulate mouse click at the end of the array to trigger Shopify
        const isLastItem = index === checkboxes.length - 1;
        if (isLastItem) {
            checkbox.click();
        }
    }
}

// timer
function timerCountdown() {
    timerCountReset();
    typingTimer = setTimeout(updateInputs, doneTypingInterval);
}

function timerCountReset() {
    clearTimeout(typingTimer);
};

// Page loading!
function onPageLoadSoh() {
    const url = window.location.href;
    const urlParams = new URLSearchParams(url);
    const sohValues = urlParams.getAll("filter.p.m.custom.soh");

    if (sohValues.length >= 1) {
          // Converting the values to numbers for comparison
        const numericValues = sohValues.map(Number);

        // Finding the lowest and highest values
        const lowestValue = Math.min(...numericValues);
        const highestValue = Math.max(...numericValues);

        sohLowInput.value = lowestValue;
        sohHighInput.value = highestValue;
    }
}

