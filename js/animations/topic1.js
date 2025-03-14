const width = 800, height = 450, margin = { top: 20, right: -20, bottom: 20, left: -20 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;
const maxPoints = 200;

// Signal state
let timeData = [];
let currentTime = 0;
const timeStep = 0.4;
let modulatingPhase = 0; // Tracks the current phase of the signal
let carrierPhase = 0;    // Tracks the phase of the carrier signal
let signalType = 'original';
let amplitude = 1;
let frequency = 20;
let carrierAmplitude = 1;
let carrierFrequency = 50;
let fmSensitivity = 0;
let pmSensitivity = 0;

// Setup SVG
const svg = d3.select("#signal-plot")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("border", "2px solid #F5F5F577");

svg.selectAll("*").remove();

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Setup clipping path
g.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", plotWidth)
    .attr("height", plotHeight);

// Setup scales
const xScale = d3.scaleLinear().domain([0, maxPoints - 1]).range([0, plotWidth]);
const yScale = d3.scaleLinear().domain([-4, 4]).range([plotHeight, 0]);

// Setup line generator
const lineGenerator = d3.line()
    .x((d, i) => xScale(i))
    .y(d => yScale(d.value))
    .curve(d3.curveBasis);

// Setup axes and signal path
const signalContainer = g.append("g")
    .attr("clip-path", "url(#clip)")
    .attr("class", "signal-container");


// Add gridlines
g.append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(yScale.ticks())
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("x2", plotWidth)
    .attr("y1", d => yScale(d))
    .attr("y2", d => yScale(d))
    .attr("stroke", "#e0e0e030")
    .attr("stroke-dasharray", "2,2");

// Draw y-axis
g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));

const signalPath = signalContainer.append("path")
    .attr("class", "line signal-line")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2);

function generateSignalPoint(time) {
    const t = time * 0.001; // Convert to seconds

    // Update phases smoothly
    modulatingPhase += 2 * Math.PI * frequency * timeStep * 0.001;
    modulatingPhase %= 2 * Math.PI; // Keep within 0 to 2π

    carrierPhase += 2 * Math.PI * carrierFrequency * timeStep * 0.001;
    carrierPhase %= 2 * Math.PI; // Keep within 0 to 2π

    const baseSignal = Math.cos(modulatingPhase);
    const carrierSignal = Math.cos(carrierPhase);

    let value;
    switch (signalType) {
        case 'am':
            const amIndex = amplitude / carrierAmplitude;
            value = carrierAmplitude * carrierSignal * (1 + amIndex * baseSignal);
            break;
        case 'fm':
            const fmIndex = (fmSensitivity * amplitude) / frequency;
            value = carrierAmplitude * Math.cos(carrierPhase + fmIndex * Math.sin(modulatingPhase));
            break;
        case 'pm':
            const pmIndex = pmSensitivity * baseSignal;
            value = carrierAmplitude * Math.cos(carrierPhase + pmIndex);
            break;
        case 'carrier':
            value = carrierAmplitude * carrierSignal;
            break;
        default:
            value = amplitude * baseSignal;
    }

    return { time, value };
}



function initializeSignal() {
    timeData = []; // Clear existing data
    for (let i = 0; i < maxPoints; i++) {
        timeData.push(generateSignalPoint(currentTime));
        currentTime += timeStep;
    }
}

function updateSliderValues() {
    amplitude = parseFloat(document.getElementById("amplitude-slider").value);
    frequency = parseFloat(document.getElementById("frequency-slider").value);
    carrierAmplitude = parseFloat(document.getElementById("carrier-amplitude-slider").value);
    carrierFrequency = parseFloat(document.getElementById("carrier-frequency-slider").value);
    fmSensitivity = parseFloat(document.getElementById("fm-sensitivity-slider").value);
    pmSensitivity = parseFloat(document.getElementById("pm-sensitivity-slider").value);

    // Update display values
    document.getElementById("amplitude-value").textContent = `${amplitude.toFixed(1)} V`;
    document.getElementById("frequency-value").textContent = `${frequency} Hz`;
    document.getElementById("carrier-amplitude-value").textContent = `${carrierAmplitude.toFixed(1)} V`;
    document.getElementById("carrier-frequency-value").textContent = `${carrierFrequency} Hz`;
    document.getElementById("fm-sensitivity-value").textContent = `${fmSensitivity} Hz`;
    document.getElementById("pm-sensitivity-value").textContent = `${pmSensitivity} rad/unit`;


    // Calculate amIndex and fmIndex and display 
    const amIndex = amplitude / carrierAmplitude; 
    const fmIndex = (fmSensitivity *  amplitude) / frequency;
    const pmIndex = pmSensitivity * amplitude;

    // Update Nyquist information
    document.getElementById("am-index-value").textContent = `${amIndex.toFixed(2)}`;
    document.getElementById("fm-index-value").textContent = `${fmIndex.toFixed(2)}`;
    document.getElementById("pm-index-value").textContent = `${pmIndex.toFixed(2)}`;
}

let isAnimating = true; // Animation starts running by default
let animationFrameId; // Stores the animation frame ID

function updateSignal() {
    if (!isAnimating) return; // Stop updating if paused

    updateSliderValues();

    // Remove oldest point and add new point
    timeData.shift();
    timeData.push(generateSignalPoint(currentTime));
    currentTime += timeStep;

    // Update the path
    const colorMap = {
        original: "white",
        carrier: "red",
        am: "orange",
        fm: "yellow",
        pm: "blue"
    };
    signalPath
        .attr("stroke", colorMap[signalType]) // Dynamically set stroke color
        .attr("d", lineGenerator(timeData));

    // Schedule next update
    animationFrameId = requestAnimationFrame(updateSignal);
}

// Add event listeners
document.getElementById("Original-btn").addEventListener("click", () => {
    signalType = 'original';
    initializeSignal();
});

document.getElementById("Carrier-btn").addEventListener("click", () => {
    signalType = 'carrier';
    initializeSignal();
});

document.getElementById("AM-btn").addEventListener("click", () => {
    signalType = 'am';
    initializeSignal();
});

document.getElementById("FM-btn").addEventListener("click", () => {
    signalType = 'fm';
    initializeSignal();
});

document.getElementById("PM-btn").addEventListener("click", () => {
    signalType = 'pm';
    initializeSignal();
});

// Add slider input listeners
['amplitude-slider', 'frequency-slider', 
 'carrier-amplitude-slider', 'carrier-frequency-slider',
  'fm-sensitivity-slider'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener("changes", updateSliderValues);
    }
});

document.getElementById("pause-play-btn").addEventListener("click", function () {
    isAnimating = !isAnimating; // Toggle state
    this.textContent = isAnimating ? "Pause" : "Play"; // Update button text

    if (isAnimating) {
        updateSignal(); // Resume animation
    } else {
        cancelAnimationFrame(animationFrameId); // Stop animation
    }
});

// Initialize and start visualization
initializeSignal();
updateSignal();