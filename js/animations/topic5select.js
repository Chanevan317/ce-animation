document.addEventListener("DOMContentLoaded", () => { 
    const selects = document.querySelectorAll("select");

    // Function to update the options of other select elements
    const updateOptions = () => {
        const selectedValues = Array.from(selects).map(select => select.value);

        selects.forEach(select => {
            // Save the current selection
            const currentValue = select.value;

            // Clear all options and re-add them dynamically
            const allOptions = [
                { value: "", text: "Select F" },
                { value: "1", text: "F1" },
                { value: "2", text: "F2" },
                { value: "3", text: "F3" },
                { value: "4", text: "F4" },
                { value: "5", text: "F5" },
                { value: "6", text: "F6" },
                { value: "7", text: "F7" },
                { value: "8", text: "F8" },
            ];

            // Rebuild options while excluding selected values
            select.innerHTML = "";
            allOptions.forEach(option => {
                if (!selectedValues.includes(option.value) || option.value === currentValue) {
                    const newOption = document.createElement("option");
                    newOption.value = option.value;
                    newOption.textContent = option.text;
                    select.appendChild(newOption);
                }
            });

            // Restore the current selection
            select.value = currentValue;
        });
    };

    // Attach event listeners to all select elements
    selects.forEach(select => {
        select.addEventListener("change", updateOptions);
    });

    // Event listener for the "Clear Pattern" button
    const clearButton = document.getElementById("clear-pattern");
    clearButton.addEventListener("click", () => {
        selects.forEach(select => {
            select.value = ""; // Clear selection
        });

        // Reset options to default state
        updateOptions();
    });
});
