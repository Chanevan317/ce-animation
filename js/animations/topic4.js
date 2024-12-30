// Select all buttons with the class 'btn'
const buttons = document.querySelectorAll('.mode-btn');
const formulaBox = document.querySelectorAll('.animation');

// Add click event listener to each button
buttons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove 'active' class from all buttons
        buttons.forEach(btn => btn.classList.remove('active-btn'));
        
        // Add 'active' class to the clicked button
        button.classList.add('active-btn');


        if (button.id === 'myElement') {
            buttons.forEach(btn => btn.classList.remove('hidden'));
            
        } else {
            console.log('The element does not have the ID "myElement".');
        }
    });
});
