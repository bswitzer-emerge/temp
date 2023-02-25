const openButton = document.querySelector(".register-for-access-button");
const modal = document.querySelector(".register-for-access-modal");
const closeButton = document.querySelector(".close-button");
console.log(modal, "Test")



openButton.addEventListener("click", function(event) {
    event.preventDefault();
    modal.classList.add("show");
  });
  
  closeButton.addEventListener("click", function() {
    modal.classList.remove("show");
  });