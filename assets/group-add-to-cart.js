function updateButtonState() {
 
    const checkedCheckboxes = document.querySelectorAll('.addtocart-checkbox input:checked');
    const isChecked = checkedCheckboxes.length > 0;
    console.log("isChecked: ", isChecked)

    if (isChecked) {
      addToCartButton.classList.remove('disabled');
    } else {
      addToCartButton.classList.add('disabled');
    }
  }

  const addToCartCheckboxes = document.querySelectorAll('.addtocart-checkbox');
  const addToCartButton = document.querySelector('#add_to_cart-heading');

  addToCartCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', updateButtonState);
  });


  document.getElementById("add_to_cart-heading").addEventListener("click", () => {
    // Find all checked checkboxes
    const checkboxes = document.querySelectorAll('.card-product-list__col0 input[type="checkbox"]:checked');
    // Store the values of checked checkboxes
    const values = Array.from(checkboxes).map(checkbox => checkbox.value);

    console.log("values: ", values)

    // Click buttons inside divs matching checkbox values
    values.forEach(value => {
      const div = document.getElementById(value);
      if (div) {
        const button = div.querySelector('button');
        if (button) {
          console.log("hit")
          button.click();
        }
      }
    });
  });