const heading = document.querySelector('#drawer-target');
const filterDrawer = document.querySelector('.filter-drawer');
const filterDrawerBib = document.querySelector('.filter-drawer-bib');
const filterDrawerClose = document.querySelector('#filter-drawer-close-svg');


// Function to toggle the "open" class on the filter drawer
const toggleFilterDrawer = () => {
  filterDrawer.classList.toggle('open');
  filterDrawerBib.classList.toggle('open')
};

// Add event listener to the heading to trigger the toggle function
heading.addEventListener('click', toggleFilterDrawer);
filterDrawerBib.addEventListener('click', toggleFilterDrawer);
