document.addEventListener('DOMContentLoaded', () => {
    const sectionButtons = document.querySelectorAll('.mode-section-btn'); // Section navigation buttons
    const animations = document.querySelectorAll('.animation'); // Animation sections

    const formulaButtons = document.querySelectorAll('.calculator-mode .mode-btn'); // Formula navigation buttons
    //const formulas = document.querySelectorAll('.formula'); // Formula divs within each section

    // Handle section switching
    sectionButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all section buttons
            sectionButtons.forEach(btn => btn.classList.remove('active-btn'));

            // Add active class to the clicked button
            button.classList.add('active-btn');

            // Show the corresponding animation section
            const targetSectionId = button.id.replace('-btn', '-box');
            animations.forEach(animation => {
                if (animation.id === targetSectionId) {
                    animation.classList.remove('hidden');
                } else {
                    animation.classList.add('hidden');
                }
            });
        });
    });

    // Handle formula switching within each animation section
    formulaButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Find the parent animation section of this button
            const parentAnimation = button.closest('.animation');

            // Remove active class from all buttons within the same parent section
            parentAnimation.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('calculator-active-btn'));

            // Add active class to the clicked button
            button.classList.add('calculator-active-btn');

            // Show the corresponding formula within the same parent section
            const formulasInParent = parentAnimation.querySelectorAll('.formula');
            formulasInParent.forEach((formula, index) => {
                if (index === Array.from(button.parentElement.children).indexOf(button)) {
                    formula.classList.remove('hidden');
                } else {
                    formula.classList.add('hidden');
                }
            });
        });
    });
});
