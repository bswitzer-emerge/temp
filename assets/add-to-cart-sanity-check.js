/* 
When the cart is clicked on a collections page, it will not show the item as add to cart. A second click will do this properly as the shopify logic is to check inventory only at the mouse click. Exmaple: User clicks the cart and there's 1 item in stock, thus it adds to cart but does not check again after the initial click. A second click will check the inventory _then_ and only then, will it see that items are out of stock.

This script forces the out of stock state after an item is added to the cart since all items have an inventory of 1

Since the entire DOM is blown out when filters are clicked, it uses observerCarts to listen for DOM changes to attach addToCartListener() to items after a filter change.
*/


function addToCartListener() {
    const forms = document.querySelectorAll('.card-product-list__col7 form[data-type="add-to-cart-form"]');

    // Iterate over each form and attach the event listener
    forms.forEach(form => {
      form.addEventListener('submit', event => {
    
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
