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



const filteredValues = [];
let lowValue;
let highValue;


function setSOHlistener() {
    //console.log("setSOHlistener")
    // Iterate over each checkbox and assign an event listener
    const sohCheckboxes =  document.querySelectorAll('#state-of-health-checkboxes input[type="checkbox"]');
    sohCheckboxes.forEach(function(sohCheckbox) {
        sohCheckbox.addEventListener('change', function() {
        // Check if the checkbox is checked
            highLowCheck(this.id); // assertain the range based on which check box 
            console.log("this.checked", this.checked);
            if (this.checked) {
                checkTheBoxes(true);
            } else {
                checkTheBoxes(false);
            //console.log('Checkbox ' + this.id + ' is unchecked.');
            }
        });
    });
}

function highLowCheck(id) {
  if (id === "faux-59") {
    lowValue = 0;
    highValue = 59;
  } else if (id === "faux-60") {
    lowValue = 60;
    highValue = 69;
  } else if (id === "faux-70") {
    lowValue = 70;
    highValue = 79;
  } else if (id === "faux-80") {
    lowValue = 80;
    highValue = 89;
  } else if (id === "faux-90") {
    lowValue = 90;
    highValue = 100;
  }
}


// apply the filter to actual code
function checkTheBoxes(checkMe) {

    console.log(`checkTheBoxes() lowValue ${lowValue}, highValue ${highValue}`)
    const checkboxes = document.querySelectorAll('#soh-health-form-items input[type="checkbox"]');

    filteredValues.length = 0; // Clear the array
    
    // Go through entire list of checkboxes
    for (const [index, checkbox] of checkboxes.entries()) {
        const checkboxValue = parseInt(checkbox.value);

        if (checkboxValue >= lowValue && checkboxValue <= highValue) {
            // Perform the desired action, e.g., check the checkbox
            if (checkMe) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
            filteredValues.push(checkboxValue);
        } else {
            filteredValues.push(checkboxValue);
        }
    } 
}


// Page loading!
function onPageLoadSoh() {
    const urlParams = new URLSearchParams(window.location.href);
    const sohValues = urlParams.getAll("filter.p.m.custom.soh");
  
    const checkboxStates = {
      "faux-59": false,
      "faux-60": false,
      "faux-70": false,
      "faux-80": false,
      "faux-90": false
    };
  
    for (const value of sohValues) {
      const intValue = parseInt(value);
      if (intValue > 0 && intValue <= 59) {
        checkboxStates["faux-59"] = true;
      } else if (intValue >= 60 && intValue <= 69) {
        checkboxStates["faux-60"] = true;
      } else if (intValue >= 70 && intValue <= 79) {
        checkboxStates["faux-70"] = true;
      } else if (intValue >= 80 && intValue <= 89) {
        checkboxStates["faux-80"] = true;
      } else if (intValue >= 90 && intValue <= 100) {
        checkboxStates["faux-90"] = true;
      }
    }
  
    for (const checkboxId in checkboxStates) {
      const checkbox = document.getElementById(checkboxId);
      checkbox.checked = checkboxStates[checkboxId];
    }
  
    disableEnable();
}

function disableEnable() {
  const checkboxes = document.querySelectorAll('#soh-health-form-items input[type="checkbox"]');
  let test59 = false, test60 = false, test70 = false, test80 = false, test90 = false;

  for (const checkbox of checkboxes) {
    const checkboxValue = parseInt(checkbox.value);
    doesValueRangeExist(checkboxValue, checkbox.disabled);
  }

  function doesValueRangeExist(value, disabled) {
    if (value > 0 && value <= 59 && !disabled) {
      test59 = true;
    } else if (value >= 60 && value <= 69 && !disabled) {
      test60 = true;
    } else if (value >= 70 && value <= 79 && !disabled) {
      test70 = true;
    } else if (value >= 80 && value <= 89 && !disabled) {
      test80 = true;
    } else if (value >= 90 && value <= 100 && !disabled) {
      test90 = true;
    }
  }

  const disableEnableCheckboxes = (testValue, checkboxId) => {
    const checkbox = document.getElementById(checkboxId);
    checkbox.disabled = !testValue;
  };

  disableEnableCheckboxes(test59, 'faux-59');
  disableEnableCheckboxes(test60, 'faux-60');
  disableEnableCheckboxes(test70, 'faux-70');
  disableEnableCheckboxes(test80, 'faux-80');
  disableEnableCheckboxes(test90, 'faux-90');

  const areAnyBoxesChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
  if (areAnyBoxesChecked) {
    if (detectCheckedCheckboxes(0, 59)) {
      document.getElementById('faux-59').checked = true;
    }
    if (detectCheckedCheckboxes(60, 69)) {
      document.getElementById('faux-60').checked = true;
    }
    if (detectCheckedCheckboxes(70, 79)) {
      document.getElementById('faux-70').checked = true;
    }
    if (detectCheckedCheckboxes(80, 89)) {
      document.getElementById('faux-80').checked = true;
    }
  }
}

const detectCheckedCheckboxes = (val1, val2) => {
  const checkboxes = document.querySelectorAll('#soh-health-form-items input[type="checkbox"]');
  return Array.from(checkboxes).some(checkbox => {
    const value = parseInt(checkbox.value);
    return value >= val1 && value <= val2 && checkbox.checked && !checkbox.disabled;
  });
};


// The magic of MutationObserver to detect when the dom has refreshed from shopify.
const observeMe = document.getElementById('FacetsWrapperDesktop');
// Create a new MutationObserver
const observer = new MutationObserver(mutationsList => {
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
        console.log('Content changed:');
        disableEnable();
        setSOHlistener(); // reset the listener on change
    }
  }
});

// Start observing the div for changes
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
// we will not disconnect! :)
observer.observe(observeMe, { childList: true, characterData: true, subtree: true });


setSOHlistener(); // init the listener, this will be reinited.
onPageLoadSoh(); // fire this on first run to make sure the values are reflected.
