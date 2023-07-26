let firstrun = true;

function updateButtonState() {
    const addToCartButton = document.querySelector('#add_to_cart-heading');
    console.log("addToCartButton", addToCartButton);
    const checkedCheckboxes = document.querySelectorAll('.addtocart-checkbox input:checked');
    const isChecked = checkedCheckboxes.length > 0;
    console.log("isChecked: ", isChecked, "isChecked:", isChecked, "addToCartButton:", addToCartButton);

    if (isChecked) {
        addToCartButton.classList.remove('disabled');
    } else {
        addToCartButton.classList.add('disabled');
    }
}

function groupaddToCartListener() {    
    document.getElementById("add_to_cart-heading").addEventListener("click", () => {
        // Find all checked checkboxes
        const checkboxes = document.querySelectorAll('.card-product-list__col0 input[type="checkbox"]:checked');
        // Store the values of checked checkboxes
        const values = Array.from(checkboxes).map(checkbox => checkbox.value);
        //console.log("values: ", values)
    
        // Click buttons inside divs matching checkbox values
        values.forEach(value => {
            const div = document.getElementById(value);
            if (div) {
            const button = div.querySelector('button');
                if (firstrun && button) {
                    button.click();
                    firstrun = false;
                }
                } else if (button) {
                    // Set the initial delay to 2200 ms
                    let delay = 2200;
                    // If there are more than 3 values, increase the delay
                    if (values.length > 3) {
                        // Set a longer delay based on the index
                        // Adjust the multiplier (e.g., 1000) to control the delay increase
                        delay += index * 1000;
                    }
                    setTimeout(() => {
                        button.click();
                    }, delay);
                }
            }
        });
    });
}

function queryForAddToCart() {
    console.log("queryForAddToCart");
    const addToCartCheckboxes = document.querySelectorAll('.addtocart-checkbox');
    addToCartCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', updateButtonState);
    });
}

groupaddToCartListener();
queryForAddToCart();


  // The magic of MutationObserver to detect when the dom has refreshed from shopify.
const observeInventoryList = document.getElementById('ProductGridContainer');
// Create a new MutationObserver
const observerForList = new MutationObserver(mutationsList => {
  for (let mutation of mutationsList) {

    if (mutation.type === 'childList' || mutation.type === 'characterData' || mutation.type === "attributes") {
        //console.log('group-add-to-cart.js detected changed');
        groupaddToCartListener();
        queryForAddToCart();
        
    }
  }
});

// Start observing the div for changes
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
// we will not disconnect! :)
observerForList.observe(observeInventoryList, { childList: true, characterData: true, subtree: true });