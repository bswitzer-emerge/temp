
function addToCartListener() {
    const forms = document.querySelectorAll('.card-product-list__col7 form[data-type="add-to-cart-form"]');

    // Iterate over each form and attach the event listener
    forms.forEach(form => {
      form.addEventListener('submit', event => {
    
        // Perform your desired actions here
        console.log('Form submitted:', form.id);
    


        const inputId = event.target.querySelector("button");
        console.log('Input ID:', inputId);
        const checkBox = document.querySelector(`#group-${inputId.getAttribute("data-id")}`);
        console.log('checkBox', checkBox);

        setTimeout(function() {
            // first handle the cart message
            const soldout = event.target.querySelector('.sold-out-message');
            soldout.classList.remove('hidden');
        
            const span = event.target.querySelector('span');
            span.classList.add('hidden');
        
            // Add the aria-disabled="true" attribute to the button
            const button = event.target.querySelector('button[name="add"]');
            button.setAttribute('aria-disabled', 'true');

            //next the first column
            checkBox.classList.add("facet-checkbox--disabled");
            const myInput = checkBox.querySelector('input[type="checkbox"]');
            myInput.setAttribute("disabled", 'true');
            
        }, 2400);
        
    
    
      });
    });
}

addToCartListener();


// The magic of MutationObserver to detect when the DOM has refreshed from Shopify.
const observeCartList = document.getElementById('product-grid');
if (observeCartList) {
  // Create a new MutationObserver
  const observerCarts = new MutationObserver(mutationsList => {
    for (let mutation of mutationsList) {
      if (
        mutation.type === 'childList' ||
        mutation.type === 'characterData' ||
        mutation.type === 'attributes'
      ) {
        addToCartListener();
      }
    }
  });

  // Start observing the div for changes
  observerCarts.observe(observeCartList, {
    childList: true,
    characterData: true,
    subtree: true,
  });
} else {
  console.error("Element with ID 'product-grid' not found.");
}
