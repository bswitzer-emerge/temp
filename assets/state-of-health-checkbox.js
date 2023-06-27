/* 
    This script is for the state of health filter 
    on the collections

    onPageLoadSoh(); - A URL grabby script to fill out the form if the page reloads


    updateInputs() - no argumeents, attached to event listener

    ensureRange() - no arguements, makes sure that the low and high
                    do not conflict with each other (ex low price can't be higher than high price)

    checkTheBoxes() - looks for the #soh-health-form-items, and then
                    checks the ones that match the input range. This  is a work around for the lack of filtering avaliable nu default in facets.liquid
                    It has to simulate a mouse click for the original mystery meat Shopify JS to work.
    timerCountDown / timerCountReset - using the classic StackOverflow solution
                    https://stackoverflow.com/questions/4220126/run-javascript-function-when-user-finishes-typing-instead-of-on-key-u
*/

const sohLowInput = document.getElementById('soh-low');
const sohHighInput = document.getElementById('soh-high');
const newInputs =  document.querySelectorAll('#state-of-health-checkboxes input[type="checkbox"]');

const checkboxes = document.querySelectorAll('#soh-health-form-items input[type="checkbox"]');
const filteredValues = [];

onPageLoadSoh(); // fire this on first run to make sure the values are reflected.

//timer for keyup
let typingTimer;                //timer identifier
const doneTypingInterval = 700;  //time in ms

let lowValue;
let highValue;

// Iterate over each checkbox and assign an event listener
newInputs.forEach(function(newInput) {
    newInput.addEventListener('change', function() {
    // Check if the checkbox is checked
    highLowCheck(this.id);

    if (this.checked) {
      // Checkbox is checked
      checkTheBoxes(true);
    } else {
      // Checkbox is unchecked
      checkTheBoxes(false);
      //console.log('Checkbox ' + this.id + ' is unchecked.');
    }
  });
});

function highLowCheck(id) {
    console.log(`id: ${id}`);
    if (id == "faux-59") {
        lowValue = 0;
        highValue = 59;
    } 
    if (id == "faux-60") {
        lowValue = 60;
        highValue = 69;
    } 
    if (id == "faux-70") {
        lowValue = 70;
        highValue = 79;
       
    } 
    if (id == "faux-80") {
        lowValue = 80;
        highValue = 89;
    }
    if (id == "faux-90") {
        lowValue = 90;
        highValue = 100;
    }
}


// apply the filter to actual code
function checkTheBoxes(switcher) {

    console.log(`checkTheBoxes() lowValue ${lowValue}, highValue ${highValue}`)
    filteredValues.length = 0; // Clear the array
    
    // Go through entire list of checkboxes
    for (const [index, checkbox] of checkboxes.entries()) {
        const checkboxValue = parseInt(checkbox.value);

        if (checkboxValue >= lowValue && checkboxValue <= highValue) {
            // Perform the desired action, e.g., check the checkbox
            if (switcher) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
            filteredValues.push(checkboxValue);
        } else {
            //checkbox.checked = false;
            filteredValues.push(checkboxValue);
        }
        // simulate mouse click at the end of the array to trigger Shopify
        const isLastItem = index === checkboxes.length - 1;
        if (isLastItem) {
            //checkbox.click();
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
    
    let input59, input60, input70, input80, input90;
    const faux59 = document.getElementById('faux-59'), 
    faux60 = document.getElementById('faux-60'),
    faux70 = document.getElementById('faux-70'),
    faux80 = document.getElementById('faux-80'),
    faux00 = document.getElementById('faux-90');
   

    //process the input variables
    sohValues.forEach(function(value) {
        if ( value > 0 && value <= 59) {
            input59 = true;
        }
        if ( value >= 60 && value <= 69) {
            input60 = true;
        }
        if ( value >= 70 && value <= 79) {
            input70 = true;
        }
        if ( value >= 80 && value <= 89) {
            input80 = true;
        }
        if ( value >= 90 && value <= 100) {
            input90 = true;
        }
    }); 
    if (input59) {
        faux59.checked= true;
    }
    if (input60) {
        faux60.checked= true;
    }
    if (input70) {
        faux70.checked= true;
    }
    if (input80) {
        faux80.checked= true;
    }
    if (input90) {
        faux90.checked= true;
    }


    // Grey out entries
    if (sohValues.length == 0 ) {
        console.log("I'm da bess")
        let test59, test60, test70, test80, test90;


        for (const [index, checkbox] of checkboxes.entries()) {
            const checkboxValue = parseInt(checkbox.value);
            doesValueRangeExist(checkboxValue);

        } 
        function doesValueRangeExist (value){
            if ( value > 0 && value <= 59) {
                test59 = true;
            }
            if ( value >= 60 && value <= 69) {
                test60 = true;
            }
            if ( value >= 70 && value <= 79) {
                test70 = true;
            }
            if ( value >= 80 && value <= 89) {
                test80 = true;
            }
            if ( value >= 90 && value <= 100) {
                test90 = true;
            }
        }
        if (!test59) {
            const checkbox = document.getElementById('faux-59');
            checkbox.disabled = true;
        }

        if (!test90) {
            const checkbox = document.getElementById('faux-90');
            checkbox.disabled = true;
         }
    }

    
}

