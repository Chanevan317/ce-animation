const width = 800, height = 400, margin = { top: 20, right: 30, bottom: 30, left: 40 };

// Add state variables for signal type
let signalType = 'original'; // can be 'original', 'am', or 'fm'

const svg = d3.select("#signal-plot")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("border", "2px solid #F5F5F577");

const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;

// Clear any existing content
svg.selectAll("*").remove();

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create a clip path to hide signals outside the plot area
g.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", plotWidth)
    .attr("height", plotHeight);

// Configuration for continuous data
const maxPoints = 200;  // Number of points to show
let timeData = [];
let currentTime = 0;
const timeStep = 30;    // Time between points in ms

// Signal parameters
const signalFreq = 1;    // Base signal frequency
const amFreq = 0.2;     // AM modulation frequency
const fmFreq = 0.3;     // FM modulation frequency
const amplitude = 1;    // Base amplitude

// Scales
const xScale = d3.scaleLinear()
    .domain([0, maxPoints - 1])
    .range([0, plotWidth]);

const yScale = d3.scaleLinear()
    .domain([-2, 2])   // Fixed domain for consistent view
    .range([plotHeight, 0]);

// Line generator
const lineGenerator = d3.line()
    .x((d, i) => xScale(i))
    .y(d => yScale(d.value))
    .curve(d3.curveBasis);

// Create a container for the signal with clipping
const signalContainer = g.append("g")
    .attr("clip-path", "url(#clip)");

// Add axes
g.append("g")
    .attr("transform", `translate(0,${plotHeight})`)
    .call(d3.axisBottom(xScale));

g.append("g")
    .call(d3.axisLeft(yScale));

// Add gridlines
g.append("g")
    .attr("class", "grid")
    .attr("opacity", 0.1)
    .call(d3.axisLeft(yScale)
        .tickSize(-plotWidth)
        .tickFormat("")
    );

// Create path for the signal
const signalPath = signalContainer.append("path")
    .attr("class", "line signal-line")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2);

// Function to generate new signal point
function generateSignalPoint(time) {
    const t = time * 0.001; // Convert to seconds
    const baseSignal = Math.sin(2 * Math.PI * signalFreq * t);
    
    let value;
    switch(signalType) {
        case 'am':
            // AM signal: carrier * (1 + modulation)
            const amModulation = 0.5 * Math.sin(2 * Math.PI * amFreq * t);
            value = amplitude * baseSignal * (1 + amModulation);
            break;
            
        case 'fm':
            // FM signal: frequency modulation
            const fmModulation = 2 * Math.sin(2 * Math.PI * fmFreq * t);
            value = amplitude * Math.sin(2 * Math.PI * signalFreq * t + fmModulation);
            break;
            
        default: // 'original'
            value = amplitude * baseSignal;
    }
    
    return {
        time: time,
        value: value
    };
}

// Initialize data array
for (let i = 0; i < maxPoints; i++) {
    timeData.push(generateSignalPoint(currentTime));
    currentTime += timeStep;
}

// Function to update the signal
function updateSignal() {
    // Remove oldest point and add new point
    timeData.shift();
    timeData.push(generateSignalPoint(currentTime));
    currentTime += timeStep;

    // Update the path
    signalPath.attr("d", lineGenerator(timeData));

    // Request next frame
    requestAnimationFrame(updateSignal);
}

// Initialize the buttons using D3
document.addEventListener('DOMContentLoaded', function() {
    // Add button click handlers using D3
    d3.select("#Original-btn").on("click", function() {
        signalType = 'original';
    });

    d3.select("#AM-btn").on("click", function() {
        signalType = 'am';
    });

    d3.select("#FM-btn").on("click", function() {
        signalType = 'fm';
    });

    // Start the animation
    updateSignal();
});