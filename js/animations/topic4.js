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





/* Voltage gain calculation */

document.addEventListener('DOMContentLoaded', () => {
    const vinInput = document.getElementById('vin-display');
    const voutInput = document.getElementById('vout-display');
    const gainDbResult = document.getElementById('gain-db-result');
    const voltageGainResult = document.getElementById('voltage-gain-result');

    function calculateAndDisplay() {
        const vin = parseFloat(vinInput.value);
        const vout = parseFloat(voutInput.value);

        // Validate inputs
        if (!isNaN(vin) && !isNaN(vout) && vin !== 0) {
            const voltageGain = vout / vin;
            const gainDb = 20 * Math.log10(voltageGain);

            // Update results
            voltageGainResult.textContent = voltageGain.toFixed(2);
            gainDbResult.textContent = gainDb.toFixed(2);
        } else {
            // Reset results if inputs are invalid
            voltageGainResult.textContent = '----';
            gainDbResult.textContent = '----';
        }
    }

    // Add event listeners for real-time updates
    vinInput.addEventListener('input', calculateAndDisplay);
    voutInput.addEventListener('input', calculateAndDisplay);
});




/* Power gain calculation */

document.addEventListener('DOMContentLoaded', () => {
    const pinInput = document.getElementById('pin-display');
    const poutInput = document.getElementById('pout-display');
    const powerGainResult = document.getElementById('power-gain-result');
    const powerDbResult = document.getElementById('power-db-result');

    function calculateAndDisplay() {
        const pin = parseFloat(pinInput.value);
        const pout = parseFloat(poutInput.value);

        // Validate inputs
        if (!isNaN(pin) && !isNaN(pout) && pin > 0) {
            const powerGain = pout / pin;
            const gainDb = 10 * Math.log10(powerGain);

            // Update results
            powerGainResult.textContent = powerGain.toFixed(2);
            powerDbResult.textContent = gainDb.toFixed(2);
        } else {
            // Reset results if inputs are invalid
            powerGainResult.textContent = '----';
            powerDbResult.textContent = '----';
        }
    }

    // Add event listeners for real-time updates
    pinInput.addEventListener('input', calculateAndDisplay);
    poutInput.addEventListener('input', calculateAndDisplay);
});



/* Capacitive reactance calculator */

document.addEventListener('DOMContentLoaded', () => {
    const frequencyInput = document.getElementById('f-cap-react-display');
    const frequencyUnit = document.getElementById('f-unit');
    const capacitanceInput = document.getElementById('C-cap-react-display');
    const capacitanceUnit = document.getElementById('C-unit');
    const reactanceResult = document.getElementById('capacitive-reactance-result');

    function calculateReactance() {
        let f = parseFloat(frequencyInput.value);
        let C = parseFloat(capacitanceInput.value);
        const fFactor = parseFloat(frequencyUnit.value); // Frequency unit multiplier (Hz, kHz, MHz)
        const CFactor = parseFloat(capacitanceUnit.value); // Capacitance unit multiplier (pF, nF, µF, mF)

        if (!isNaN(f) && !isNaN(C) && f > 0 && C > 0) {
            f *= fFactor; // Convert to Hz
            C *= CFactor; // Convert to Farads
            const reactance = 1 / (2 * Math.PI * f * C);
            reactanceResult.textContent = reactance.toFixed(2) + " Ω"; // Display result with unit
        } else {
            reactanceResult.textContent = '----';
        }
    }

    // Add event listeners for real-time updates
    frequencyInput.addEventListener('input', calculateReactance);
    frequencyUnit.addEventListener('change', calculateReactance);
    capacitanceInput.addEventListener('input', calculateReactance);
    capacitanceUnit.addEventListener('change', calculateReactance);
});




/* Inductive Reactance */

document.addEventListener('DOMContentLoaded', () => {
    const frequencyInput = document.getElementById('f-ind-react-display');
    const frequencyUnit = document.getElementById('f-ind-unit');
    const inductanceInput = document.getElementById('L-ind-react-display');
    const inductanceUnit = document.getElementById('L-unit');
    const reactanceResult = document.getElementById('inductive-reactance-result');

    function calculateInductiveReactance() {
        let f = parseFloat(frequencyInput.value);
        let L = parseFloat(inductanceInput.value);
        const fFactor = parseFloat(frequencyUnit.value); // Frequency unit multiplier (Hz, kHz, MHz)
        const LFactor = parseFloat(inductanceUnit.value); // Inductance unit multiplier (µH, mH, H)

        if (!isNaN(f) && !isNaN(L) && f > 0 && L > 0) {
            f *= fFactor; // Convert to Hz
            L *= LFactor; // Convert to Henries
            const reactance = 2 * Math.PI * f * L;
            reactanceResult.textContent = reactance.toFixed(2) + " Ω"; // Display result with unit
        } else {
            reactanceResult.textContent = '----';
        }
    }

    // Add event listeners for real-time updates
    frequencyInput.addEventListener('input', calculateInductiveReactance);
    frequencyUnit.addEventListener('change', calculateInductiveReactance);
    inductanceInput.addEventListener('input', calculateInductiveReactance);
    inductanceUnit.addEventListener('change', calculateInductiveReactance);
});




/* Resonance frequency calculation */

document.addEventListener('DOMContentLoaded', () => {
    const cInput = document.getElementById('C-cap-resonance-display');
    const cUnitSelect = document.getElementById('C-res-freq-unit');
    const lInput = document.getElementById('L-ind-resonance-display');
    const lUnitSelect = document.getElementById('L-res-freq-unit');
    const resonanceFreqResult = document.getElementById('resonance-freq-result');

    function calculateResonantFrequency() {
        const C = parseFloat(cInput.value) * parseFloat(cUnitSelect.value);
        const L = parseFloat(lInput.value) * parseFloat(lUnitSelect.value);

        if (!isNaN(C) && !isNaN(L) && C > 0 && L > 0) {
            const fr = 1 / (2 * Math.PI * Math.sqrt(L * C));
            resonanceFreqResult.textContent = fr.toFixed(2) + ' Hz';
        } else {
            resonanceFreqResult.textContent = '----';
        }
    }

    // Event listeners for real-time calculation
    cInput.addEventListener('input', calculateResonantFrequency);
    cUnitSelect.addEventListener('change', calculateResonantFrequency);
    lInput.addEventListener('input', calculateResonantFrequency);
    lUnitSelect.addEventListener('change', calculateResonantFrequency);
});




/* Bandwidth calculation */

document.addEventListener('DOMContentLoaded', () => {
    const RInput = document.getElementById('R-BW-display');
    const RUnit = document.getElementById('R-BW-unit');
    const LInput = document.getElementById('L-BW-display');
    const LUnit = document.getElementById('L-BW-unit');
    const BWResult = document.getElementById('BW-result');

    function calculateBandwidth() {
        const R = parseFloat(RInput.value) * parseFloat(RUnit.value);
        const L = parseFloat(LInput.value) * parseFloat(LUnit.value);

        if (!isNaN(R) && !isNaN(L) && L > 0) {
            const BW = R / (2 * Math.PI * L);
            BWResult.textContent = BW.toFixed(2) + ' Hz';
        } else {
            BWResult.textContent = '----';
        }
    }

    RInput.addEventListener('input', calculateBandwidth);
    RUnit.addEventListener('change', calculateBandwidth);
    LInput.addEventListener('input', calculateBandwidth);
    LUnit.addEventListener('change', calculateBandwidth);
});




/* Quality factor calculation */

document.addEventListener("DOMContentLoaded", function () {
    function calculateQFactor() {
        // Get input values
        let RInput = document.getElementById("R-Q-display").value;
        let LInput = document.getElementById("L-Q-display").value;
        let CInput = document.getElementById("C-Q-resonance-display").value;

        // Return early if any input is empty
        if (RInput === "" || LInput === "" || CInput === "") {
            document.getElementById("Q-result").textContent = "----";
            return;
        }

        let R = parseFloat(RInput);
        let L = parseFloat(LInput);
        let C = parseFloat(CInput);

        let RUnit = parseFloat(document.getElementById("R-Q-unit").value);
        let LUnit = parseFloat(document.getElementById("L-Q-unit").value);
        let CUnit = parseFloat(document.getElementById("C-Q-unit").value);

        // Convert to base units
        R *= RUnit; // Ω
        L *= LUnit; // H
        C *= CUnit; // F

        // Check for invalid inputs
        if (R <= 0 || L <= 0 || C <= 0) {
            document.getElementById("Q-result").textContent = "Invalid";
            return;
        }

        // Calculate Quality Factor: Q = (1/R) * sqrt(L/C)
        let Q = (1 / R) * Math.sqrt(L / C);

        // Display result
        document.getElementById("Q-result").textContent = Q.toFixed(4);
    }

    // Attach event listeners
    document.getElementById("R-Q-display").addEventListener("input", calculateQFactor);
    document.getElementById("L-Q-display").addEventListener("input", calculateQFactor);
    document.getElementById("C-Q-resonance-display").addEventListener("input", calculateQFactor);
    document.getElementById("R-Q-unit").addEventListener("change", calculateQFactor);
    document.getElementById("L-Q-unit").addEventListener("change", calculateQFactor);
    document.getElementById("C-Q-unit").addEventListener("change", calculateQFactor);
});




/* Cutoff frequency calculation */

document.addEventListener("DOMContentLoaded", function () {
    function calculateCutoffFrequency() {
        let CInput = document.getElementById("C-cutoff-display").value;
        let LInput = document.getElementById("L-cutoff-display").value;

        // Return early if any input is empty
        if (CInput === "" || LInput === "") {
            document.getElementById("cutoff-result").textContent = "----";
            return;
        }

        let C_value = parseFloat(CInput);
        let C_unit = parseFloat(document.getElementById("C-cutoff-unit").value);
        let L_value = parseFloat(LInput);
        let L_unit = parseFloat(document.getElementById("L-cutoff-unit").value);

        // Convert capacitance and inductance to base units
        let C = C_value * C_unit;
        let L = L_value * L_unit;

        let cutoffFrequency = 0;

        if (C > 0 && L > 0) {
            cutoffFrequency = 1 / (2 * Math.PI * Math.sqrt(L * C));
        }

        // Display the result
        document.getElementById("cutoff-result").textContent = cutoffFrequency > 0
            ? cutoffFrequency.toFixed(2) + " Hz"
            : "Invalid Input";
    }

    // Add event listeners
    document.getElementById("C-cutoff-display").addEventListener("input", calculateCutoffFrequency);
    document.getElementById("C-cutoff-unit").addEventListener("change", calculateCutoffFrequency);
    document.getElementById("L-cutoff-display").addEventListener("input", calculateCutoffFrequency);
    document.getElementById("L-cutoff-unit").addEventListener("change", calculateCutoffFrequency);
});