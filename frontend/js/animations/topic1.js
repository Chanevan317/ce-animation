const width = 800, height = 400, margin = { top: 20, right: 30, bottom: 30, left: 40 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;
const maxPoints = 200;

// Signal state
let timeData = [];
let currentTime = 0;
const timeStep = 0.5;
let signalType = 'original';
let amplitude = 1;
let frequency = 50;
let amAmplitude = 1;
let fmFrequency = 50;

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
const signalContainer = g.append("g").attr("clip-path", "url(#clip)");

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
    const baseSignal = Math.sin(2 * Math.PI * frequency * t);
    
    let value;
    switch (signalType) {
        case 'am':
            const amModulation = amAmplitude * Math.sin(2 * Math.PI * (frequency * 0.1) * t);
            value = amplitude * baseSignal * (1 + amModulation);
            break;
        case 'fm':
            const fmModulation = 2 * Math.sin(2 * Math.PI * fmFrequency * t);
            value = amplitude * Math.sin(2 * Math.PI * frequency * t + fmModulation);
            break;
        default: // original signal
            value = amplitude * baseSignal;
    }
    
    return { time, value };
}

function initializeSignal() {
    for (let i = 0; i < maxPoints; i++) {
        timeData.push(generateSignalPoint(currentTime));
        currentTime += timeStep;
    }
}

function updateSliderValues() {
    amplitude = parseFloat(document.getElementById("amplitude-slider").value);
    frequency = parseFloat(document.getElementById("frequency-slider").value);
    amAmplitude = parseFloat(document.getElementById("am-amplitude-slider").value);
    fmFrequency = parseFloat(document.getElementById("fm-frequency-slider").value);

    // Update display values
    document.getElementById("amplitude-value").textContent = `${amplitude.toFixed(1)} V`;
    document.getElementById("frequency-value").textContent = `${frequency} Hz`;
    document.getElementById("am-amplitude-value").textContent = `${amAmplitude.toFixed(1)} V`;
    document.getElementById("fm-frequency-value").textContent = `${fmFrequency} Hz`;
}

function updateSignal() {
    updateSliderValues();

    // Remove oldest point and add new point
    timeData.shift();
    timeData.push(generateSignalPoint(currentTime));
    currentTime += timeStep;

    // Update the path
    signalPath.attr("d", lineGenerator(timeData));

    // Schedule next update
    requestAnimationFrame(updateSignal);
}

// Add event listeners
document.getElementById("Original-btn").addEventListener("click", () => {
    signalType = 'original';
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

// Add slider input listeners
['amplitude-slider', 'frequency-slider', 
 'am-amplitude-slider', 'fm-frequency-slider'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener("change", updateSliderValues);
    }
});

// Initialize and start visualization
initializeSignal();
updateSignal();