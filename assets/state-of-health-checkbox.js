/* 
    This script is for the state of health filter 
    on the collections

    Idea:
    Make a virtualized form, to simulate checkboxes ranges. Really we're hiding the real form and making an interface for it.

    Problem I had:
    When shopify’s form is interacted with, it wipes the DOM where the form lives and shits out a new form, this means if you change the form with JS values are lost. That’s been the issue from the get go. Simply listening to form changes meant it’d see the change, make the changes only to be wiped.

    Solution: 
    Using the MutationObserver now I can see when the form has been actually changed then run my logic against the form to enable and disable my custom check boxes. 

    Logic:

    Step 1: On page load make sure to disable the inputs if there’s no items within the checkbox ranges
    Step 2: on the change trigger the immediate disabling (there’s a latency before it refreshes the form, and destroys the changes). This way the user can see the disabled/enabled inputs. This has to work with the all the filters.
    Step 3: On the mutation (or when the form is reloaded), re-run all that same logic! 

*/

const newInputs =  document.querySelectorAll('#state-of-health-checkboxes input[type="checkbox"]');

const filteredValues = [];

onPageLoadSoh(); // fire this on first run to make sure the values are reflected.

//timer for keyup

let lowValue;
let highValue;

// Iterate over each checkbox and assign an event listener
// this is done to see changes in real time
newInputs.forEach(function(newInput) {
    newInput.addEventListener('change', function() {
    // Check if the checkbox is checked

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


// apply the filter to actual code
// This is the code that interacts with the real form. It is hidden in the  _card-product-list.scss under #soh-health-form-items display none
function checkTheBoxes(switcher) {

    //console.log(`checkTheBoxes() lowValue ${lowValue}, highValue ${highValue}`)
    filteredValues.length = 0; // Clear the array
    
    // Get the real form and go through entire list of checkboxes
    const checkboxes = document.querySelectorAll('#soh-health-form-items input[type="checkbox"]');

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


    // On the page load, this will check if any filters are set 
    if (sohValues.length == 0 ) {
        console.log("I'm da bess")
        disableEnable();
    }
    
}


// Check to see if any battereies exist within the range. It creates a fresh array and then checks any batteries that exist within a check box's range are still active. if none are, then they will be greyed out.
// find #soh-health-form-items, .soh-list +  show-more-button  and display block to see this in action.


function disableEnable() {
    let test59, test60, test70, test80, test90;
        const checkboxes2 = document.querySelectorAll('#soh-health-form-items input[type="checkbox"]');

        for (const [index, checkbox] of checkboxes2.entries()) {
            const checkboxValue = parseInt(checkbox.value);

           // console.log("disabled", checkbox.disabled)
            doesValueRangeExist(checkboxValue, checkbox.disabled);

        } 
        function doesValueRangeExist (value, disabled){
            if ( value > 0 && value <= 59 && disabled == false ) {
                test59 = true;
            }
            if ( value >= 60 && value <= 69 && disabled == false ) {
                test60 = true;
            }
            if ( value >= 70 && value <= 79 && disabled == false ) {
                test70 = true;
            }
            if ( value >= 80 && value <= 89 && disabled == false ) {
                test80 = true;
            }
            if ( value >= 90 && value <= 100 && disabled == false ) {
                test90 = true;
            }
        }

        // Stupid brute force: Just go down the list and check if each variable is false,to disable inputs, then if not enable them.
        if (!test59) {
            const checkbox = document.getElementById('faux-59');
            checkbox.disabled = true;
        } else {
            const checkbox = document.getElementById('faux-59');
            checkbox.disabled = false;
        }
        if (!test60) {
            const checkbox = document.getElementById('faux-60');
            checkbox.disabled = true;
        } else {
            const checkbox = document.getElementById('faux-60');
            checkbox.disabled = false;
        }
        if (!test70) {
            const checkbox = document.getElementById('faux-70');
            checkbox.disabled = true;
        } else {
            const checkbox = document.getElementById('faux-60');
            checkbox.disabled = false;
        }
        if (!test80) {
            const checkbox = document.getElementById('faux-80');
            checkbox.disabled = true;
        } else {
            const checkbox = document.getElementById('faux-80');
            checkbox.disabled = false;
        }
        if (!test90) {
            const checkbox = document.getElementById('faux-90');
            checkbox.disabled = true;
         } else {
            const checkbox = document.getElementById('faux-90');
            checkbox.disabled = false;
        }
        //end brute force
}


// The magic of MutationObserver to detect when the dom has refreshed from shopify.
const div = document.getElementById('FacetsWrapperDesktop');
// Create a new MutationObserver
const observer = new MutationObserver(mutationsList => {
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
      console.log('Content changed:');
      disableEnable();
    }
  }
});

// Start observing the div for changes
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
// we will not disconnect! :)
observer.observe(div, { childList: true, characterData: true, subtree: true });
