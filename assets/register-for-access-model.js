const openButton = document.querySelector(".register-for-access-button");
const modal = document.querySelector(".register-for-access-modal");
const closeButton = document.querySelector(".close-button");
console.log(modal, "Test")



openButton.addEventListener("click", function(event) {
    event.preventDefault();
    modal.classList.add("show");
    //modal isn't attached to document query as it doesn't exist yet
    initializeClickHandler();
  });
  
  closeButton.addEventListener("click", function() {
    modal.classList.remove("show");
  });


function initializeClickHandler() {
    const parentDiv = document.querySelector('.register-for-access-modal.show');
    parentDiv.addEventListener('click', (event) => {
        // Ignore the click event if it originated from a child element
        if (event.target !== event.currentTarget) {
        event.stopPropagation();
        return;
        }
        // Perform the desired action for clicking on the parent div
        console.log("test");
        modal.classList.remove("show");
    });
}

  