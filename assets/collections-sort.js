
let ul = document.querySelector('#product-grid');
let lis = Array.from(ul.children);

let titleList = document.querySelector('#title-sort')
let priceList = document.querySelector('#price-sort')
let sohList = document.querySelector('#soh-sort'); 
let genTypeList = document.querySelector('#gen_type-sort')
let batterySizeList = document.querySelector('#battery_size-sort');

function smartInit() {
    titleList = document.querySelector('#title-sort')
    priceList = document.querySelector('#price-sort')
    sohList = document.querySelector('#soh-sort'); 
    genTypeList = document.querySelector('#gen_type-sort')
    batterySizeList = document.querySelector('#battery_size-sort');
}

let titleOrder = 'asc';
let priceOrder = 'asc';
let sohSortOrder = 'asc';
let genTypeOrder = 'asc';
let batterySizeOrder = 'asc';
let locationOrder = 'asc';

let sortingInProgress = false; // Track sorting state


titleList.addEventListener('click', () => {
  if (!sortingInProgress) { // Check if sorting is in progress
    removeHighlighted();
    titleList.classList.add("highlighted")
    sortNumerical(titleOrder, "title");
  }
}); 

priceList.addEventListener('click', () => {
  if (!sortingInProgress) {
    removeHighlighted();
    priceList.classList.add("highlighted")
    sortNumerical(priceOrder, "price");
  }
});

sohList.addEventListener('click', () => {
  if (!sortingInProgress) {
    removeHighlighted();
    sohList.classList.add("highlighted")
    sortNumerical(sohSortOrder, "soh");
  }
});

genTypeList.addEventListener('click', () => {
  if (!sortingInProgress) {
    removeHighlighted();
    genTypeList.classList.add("highlighted");
    sortAlphabetical(genTypeOrder, "gen_type");
  }
});

batterySizeList.addEventListener('click', () => {
  if (!sortingInProgress) {
    removeHighlighted();
    batterySizeList.classList.add("highlighted");
    sortAlphabetical(batterySizeOrder, "battery_size");
  }
});

// Sorting
function sortAlphabetical(sort, whichData) {
  sortingInProgress = true; // Set sorting in progress
  if (window[sort] === 'asc') {
    lis.sort((a, b) => a.dataset[whichData].localeCompare(b.dataset[whichData]));
    window[sort] = 'desc';
  } else {
    window[sort] = 'asc';
    lis.sort((a, b) => b.dataset[whichData].localeCompare(a.dataset[whichData]));
  }
  console.log(window[sort], whichData);
  lis.forEach(li => ul.appendChild(li));
  sortingInProgress = false; // Reset sorting state
}

function sortNumerical(sort, whichData) {
  sortingInProgress = true; // Set sorting in progress
  if (window[sort] === 'asc') {
    lis.sort((a, b) => a.dataset[whichData] - b.dataset[whichData]);
    window[sort] = 'desc';
  } else {
    lis.sort((a, b) => b.dataset[whichData] - a.dataset[whichData]);
    window[sort] = 'asc';
  }
  console.log(window[sort], whichData);
  lis.forEach(li => ul.appendChild(li));
  sortingInProgress = false; // Reset sorting state
}


// Remove classes
function removeHighlighted() {
  const findClass = document.querySelectorAll(".highlighted")
  findClass.forEach(el => {
    el.classList.remove('highlighted');
  });
  ul = document.querySelector('#product-grid');
    lis = Array.from(ul.children);
}




// The magic of MutationObserver to detect when the DOM has refreshed from Shopify.
const observeCardProductListTop = document.querySelector(".product-grid-container")
console.log("observeCardProductListTop", observeCardProductListTop);
if (observeCardProductListTop) {
  // Create a new MutationObserver
  const observerCarts = new MutationObserver(mutationsList => {
    for (let mutation of mutationsList) {
      if (
        mutation.type === 'childList' ||
        mutation.type === 'characterData' ||
        mutation.type === 'attributes'
      ) {
        console.log("this shit done changed")
        smartInit();
    }
    }
  });

  // Start observing the div for changes
  observerCarts.observe(observeCardProductListTop, {
    childList: true,
    characterData: true,
    subtree: true,
  });
} else {
  console.error("Element with ID 'product-grid' not found.");
}
