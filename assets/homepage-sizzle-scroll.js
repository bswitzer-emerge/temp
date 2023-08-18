// Function to handle the scroll event for .sizzle element
const handleSizzleScroll = () => {
    const sizzleDiv = document.querySelector('.sizzle');
    const sizzleRect = sizzleDiv.getBoundingClientRect();

    //console.log(`sizzleDiv: ${sizzleDiv}`);
    //console.log(`sizzleRect: ${sizzleRect.right}`);


    // Check if the element is fully visible in the viewport from right to left
    if (sizzleRect.top >= 0 && sizzleRect.bottom <= window.innerHeight) {
        // Calculate the scroll progress from right to left
        const scrollProgress = -( ((sizzleRect.top / window.innerHeight) * 150) - 100);
        console.log(`scrollProgress: ${scrollProgress}`)
        // Set the right position of the .sizzle element based on the scroll progress
        sizzleDiv.style.right = `${scrollProgress}%`;
    }
};

// Use the Intersection Observer to trigger the handleSizzleScroll function when the .sizzle element is in the viewport
const observerSizzle = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            handleSizzleScroll();
        }
    });
});

// Observe the .sizzle element
observerSizzle.observe(document.querySelector('.sizzle'));

// Add scroll event listener to handle the scrolling when the element is already in the viewport
window.addEventListener('scroll', handleSizzleScroll);