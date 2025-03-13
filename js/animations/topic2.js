const width = 800, height = 450, margin = { top: 20, right: -20, bottom: 20, left: -20 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;

// Default values for signal parameters
const defaultValues = {
    amplitude: 2,       
    frequency: 10,
    samplingFrequency: 15,
};

// Sampling and display parameters
const samplingRate = 10000; // 10kHz sampling rate
const timeWindow = 0.1; // 100ms window
const numPoints = Math.floor(samplingRate * timeWindow);

// Signal state
let amplitude = 2;
let frequency = 10;
let samplingFrequency = 10;
let timeData = [];
let sampledPoints = [];
let reset = false;
let signalData = [];
let sampled = false;
let isDrawingMode = false;

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
const xScale = d3.scaleLinear().domain([0, timeWindow]).range([0, plotWidth]);
const yScale = d3.scaleLinear().domain([-4.5, 4.5]).range([plotHeight, 0]);

// Setup line generator
const lineGenerator = d3.line()
    .x(d => xScale(d.time))
    .y(d => yScale(d.value));       

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

// Draw x-axis at y = 0
g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(d3.axisBottom(xScale));

// Draw y-axis
g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));

const signalPath = signalContainer.append("path")
    .attr("class", "line signal-line")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2);

const drawingArea = signalContainer.append("rect")
    .attr("width", plotWidth)
    .attr("height", plotHeight)
    .attr("fill", "transparent")

const sampledPath = signalContainer.append("path")
    .attr("class", "line sampled-line")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 2);

const sampledPointsGroup = signalContainer.append("g")
    .attr("class", "sampled-points");

function generateSignalPoints() {
    const timeStep = 1 / samplingRate;
    timeData = Array.from({ length: numPoints }, (_, i) => {
        const t = i * timeStep;
        return {
            time: t,
            value: amplitude * Math.sin(2 * Math.PI * frequency * t)    
        };
    });
    signalPath.attr("d", lineGenerator(timeData));
}

function sampleSignal() {
    // Determine which signal to sample
    let signalToSample = timeData;

    // If there are drawn points, use those
    if (signalData.length > 0) {
        // Convert signalData to the same format as timeData if it's not already
        signalToSample = signalData.map(point => ({
            time: point.x,
            value: point.y
        }));
    }

    if (isDrawingMode) {
        alert("Please generate signal before sampling");
        return;
    }

    // Ensure we have signal data to sample
    if (signalToSample.length === 0) {
        alert("No signal data available to sample");
        return;
    }

    if (samplingFrequency > 0) {
        // Set the reset variable to false
        reset = false;

        // Calculate sampling period
        const samplingPeriod = 1 / samplingFrequency;

        // Clear sampled points
        sampledPointsGroup.selectAll("*").remove();
        sampledPath.attr("d", "");
        
        // Find points closest to the sampling intervals
        sampledPoints = [];
        let currentTime = 0;
        
        while (currentTime <= timeWindow) {
            // Find the point in signalToSample closest to our desired sampling time
            const closestPoint = signalToSample.reduce((closest, current) => {
                if (!closest) return current;
                return Math.abs(current.time - currentTime) < Math.abs(closest.time - currentTime) 
                    ? current 
                    : closest;
            }, signalToSample[0]); // Provide initial value
            
            if (closestPoint) {
                sampledPoints.push(closestPoint);
            }
            currentTime += samplingPeriod;
        }

        // Remove old elements
        sampledPointsGroup.selectAll("*").remove();

        // Add vertical lines and points
        sampledPoints.forEach((point, index) => {
            // Add vertical line 
            sampledPointsGroup
                .append("line")
                .attr("x1", xScale(point.time))
                .attr("x2", xScale(point.time))
                .attr("y1", yScale(0))
                .attr("y2", yScale(0)) // Start at y = 0
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "3,3")
                .transition()
                .delay(index * 50) // Delay for staggered effect
                .duration(300) // Duration of the transition
                .attr("y2", yScale(point.value)); // Animate to the correct y position

            // Add points with transition
            sampledPointsGroup
                .append("circle")
                .attr("cx", xScale(point.time))
                .attr("cy", yScale(0)) // Start at y = 0
                .attr("r", 0) // Start with radius 0
                .attr("fill", "yellow")
                .transition()
                .delay(index * 50) // Delay for staggered effect
                .duration(300) // Duration of the transition
                .attr("cy", yScale(point.value)) // Animate to the correct y position
                .attr("r", 4); // Grow to final radius
        });

        isDrawingMode = false;
        sampled = true;
    } else {
        // Clear all sampled points and lines when sampling frequency is 0
        sampledPointsGroup.selectAll("*").remove();
        sampledPath.attr("d", "");
    }
}

function reconstructSignal() {
    let signalToReconstruct = timeData;

    // Use drawn points if available
    if (signalData.length > 0) {
        signalToReconstruct = signalData.map(point => ({
            time: point.x,
            value: point.y
        }));
    }

    // Check if signal was sampled
    if (!sampledPoints || sampledPoints.length === 0 || !sampled) {
        alert("Please sample the signal first before reconstruction");
        return;
    }

    // Time points for reconstruction
    const reconstructedPoints = [];
    const T = 1 / samplingFrequency; // Sampling period

    // Normalize time points if needed
    const normalizedSignal = signalToReconstruct.map((point) => ({
        time: point.time,
        value: point.value
    }));

    for (let i = 0; i < normalizedSignal.length; i++) {
        const t = normalizedSignal[i].time;
        let reconstructedValue = 0;

        sampledPoints.forEach((sample) => {
            const tk = sample.time;
            const sincArg = (t - tk) / T;

            const sincValue = Math.abs(sincArg) < 1e-10
                ? 1
                : Math.sin(Math.PI * sincArg) / (Math.PI * sincArg);

            reconstructedValue += sample.value * sincValue;
        });

        reconstructedPoints.push({ time: t, value: reconstructedValue });
    }

    // Generate path
    const reconstructedPath = lineGenerator(reconstructedPoints);
    sampledPath
        .attr("d", reconstructedPath)
        .attr("stroke", "yellow")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // Animate path
    const totalLength = sampledPath.node().getTotalLength();
    sampledPath
        .attr("stroke-dasharray", totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    return reconstructedPoints;
}

const drawnBtn = document.getElementById("draw-btn");
drawnBtn.addEventListener("click", function() {
    if (drawnBtn.textContent.includes('Draw your signal')) {
        // Clear the default signal
        signalPath.attr("d", "");
        timeData = []; // Clear the time data
        signalData = []; // Clear any existing points

        // Enter drawing mode
        isDrawingMode = true;

        // clear samples
        sampledPointsGroup.selectAll("*").remove();
        sampledPath.attr("d", "");

        // Change the pointer
        drawingArea.style("cursor", "crosshair");
    } else {
        // Exit drawing mode
        isDrawingMode = false;
        signalPath.attr("d", "");
        svg.selectAll(".point").remove();

        // Default cursor
        drawingArea.style("cursor", "");

        // Regenerate the Default signal
        generateSignalPoints();
    }
});

// Draw the signal
function drawSignal() {
    // Sort points by x-coordinate
    signalData.sort((a, b) => a.x - b.x);

    // Add boundary points
    if (signalData.length > 0) {
        const firstPoint = signalData[0];
        const lastPoint = signalData[signalData.length - 1];
        const timeZero = { x: 0, y: firstPoint.y }; // Point at time = 0
        const timeEnd = { x: d3.max(timeData, d => d.time), y: lastPoint.y }; // Point at the end of the axis

        // Insert boundary points if they are not already there
        if (firstPoint.x > 0) {
            signalData.unshift(timeZero);
        }
        if (lastPoint.x < timeEnd.x) {
            signalData.push(timeEnd);
        }
    }

    // Update path
    signalPath.attr("d", lineGenerator(signalData.map(p => ({ time: p.x, value: p.y }))));

    // Update points
    const points = signalContainer.selectAll(".point").data(signalData, d => d.x);

    // Remove exiting points
    points.exit().remove();

    // Add and update points
    points.enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 3)
        .attr("fill", "red")
        .merge(points)
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.y));

    // Reset sampled flag
    sampled = false;
}



// Cubic Spline Interpolation Function
function smoothDrawnSignal() {
    // Check if there are enough points to interpolate
    if (signalData.length < 2) {
        alert("Not enough points to generate a smooth signal");
        return;
    }

    // Sort points by x-coordinate to ensure correct interpolation
    signalData.sort((a, b) => a.x - b.x);

    // Use cubic spline interpolation
    const xs = signalData.map(point => point.x);
    const ys = signalData.map(point => point.y);

    // Create a cubic spline interpolator
    const spline = d3.interpolateBasis(ys);

    // Generate more points for a smoother curve
    const smoothPoints = [];
    const numInterpolatedPoints = 100; // Adjust for desired smoothness

    for (let i = 0; i <= numInterpolatedPoints; i++) {
        const t = i / numInterpolatedPoints;
        const interpX = xs[0] + t * (xs[xs.length - 1] - xs[0]);
        const interpY = spline(t);

        smoothPoints.push({
            time: interpX,
            value: interpY
        });
    }

    // Update the signal path with smooth interpolated points
    signalPath.attr("d", lineGenerator(smoothPoints));

    // Remove existing points
    svg.selectAll(".point").remove();

    // Optionally, update signalData with the smooth points
    signalData = smoothPoints.map(point => ({
        x: point.time,
        y: point.value
    }));

    // Exit drawing mode
    isDrawingMode = false;
    drawingArea.style("cursor", "");
}

function resetSignal() {
    // Set the reset variable to true
    reset = true;

    signalData = [];
    timeData = [];

    // Reset slider values to defaults
    const amplitudeSlider = document.getElementById("amplitude-slider");
    const frequencySlider = document.getElementById("frequency-slider");
    const fsSlider = document.getElementById("fs-slider");
    
    // Set slider values
    amplitudeSlider.value = defaultValues.amplitude;
    frequencySlider.value = defaultValues.frequency;
    fsSlider.value = defaultValues.samplingFrequency;
    
    // Update variables
    amplitude = defaultValues.amplitude;
    frequency = defaultValues.frequency;
    samplingFrequency = defaultValues.samplingFrequency;
    
    // Update display values
    document.getElementById("amplitude-value").textContent = `${amplitude.toFixed(1)} V`;
    document.getElementById("frequency-value").textContent = `${frequency} Hz`;
    document.getElementById("fs-value").textContent = `${samplingFrequency} Hz`;
    
    // Clear everything
    sampledPointsGroup.selectAll("*").remove();
    sampledPath.attr("d", "");
    signalPath.attr("d", "");
    svg.selectAll(".point").remove();
    document.getElementById("draw-btn").innerHTML = 'Draw your signal';
    document.getElementById('baseband').classList.remove("hidden");
    document.getElementById('drawn').classList.add('hidden');   

    generateSignalPoints();
}

// Update slider values
function updateSliderValues() {
    amplitude = parseFloat(document.getElementById("amplitude-slider").value);
    frequency = parseFloat(document.getElementById("frequency-slider").value);
    samplingFrequency = parseFloat(document.getElementById("fs-slider").value);

    // Clear sampled points
    sampledPointsGroup.selectAll("*").remove();
    sampledPath.attr("d", "");
    reset = true;

    // Update display values
    document.getElementById("amplitude-value").textContent = `${amplitude.toFixed(1)} V`;
    document.getElementById("frequency-value").textContent = `${frequency} Hz`;
    document.getElementById("fs-value").textContent = `${samplingFrequency} Hz`;

    // Nyquist rate and condition
    const nyquistRate = 2 * frequency; // Nyquist rate = 2 × f_m
    const samplingRatio = samplingFrequency / frequency; // f_s / f_m

    // Update Nyquist information
    document.getElementById("nyquist-rate").textContent = `Nyquist Rate: 2 x fₘ = ${nyquistRate.toFixed(2)} Hz`;
    document.getElementById("sampling-criteria").textContent = `Sampling Frequency fₛ = ${samplingRatio.toFixed(2)} x fₘ`;

    const nyquistStatus = samplingFrequency >= nyquistRate
        ? "Nyquist Criterion Satisfied: fₛ ≥ 2fₘ"
        : "Nyquist Criterion NOT Satisfied: fₛ < 2fₘ";

    document.getElementById("nyquist-status").textContent = nyquistStatus;
    document.getElementById("nyquist-status").style.color = samplingFrequency >= nyquistRate ? "green" : "red";

    if (!drawnSignalMode) generateSignalPoints(); 
}

// Event listeners
document.getElementById("amplitude-slider").addEventListener("input", updateSliderValues);
document.getElementById("frequency-slider").addEventListener("input", updateSliderValues);
document.getElementById("fs-slider").addEventListener("input", updateSliderValues);

document.getElementById("sample-btn").addEventListener("click", sampleSignal);
document.getElementById("reconstruct-btn").addEventListener("click", reconstructSignal);

drawingArea.on("click", function(event) {
    // Only allow drawing if in drawing mode
    if (!isDrawingMode) return;

    const coords = d3.pointer(event);
    const x = xScale.invert(coords[0]);
    const y = yScale.invert(coords[1]);

    // Prevent duplicate x coordinates
    const existingPointIndex = signalData.findIndex(point => point.x === x);
    if (existingPointIndex !== -1) {
        signalData.splice(existingPointIndex, 1);
    }

    // Add new point
    signalData.push({x, y});
    drawSignal();
});

document.getElementById("Generate-btn").addEventListener("click", smoothDrawnSignal);
// Clear drawn signal
d3.select("#clear-btn").on("click", () => {
    signalData = [];
    timeData = [];
    signalPath.attr("d", "");
    svg.selectAll(".point").remove();
    sampledPointsGroup.selectAll("*").remove();
    sampledPath.attr("d", "");
    isDrawingMode = true;
    drawingArea.style("cursor", "crosshair");
    drawSignal();
});

// Show and hide original signal section
const drawBtn = document.getElementById('draw-btn');
const baseband = document.getElementById('baseband');
const nyquist = document.getElementById('nyquist');
const drawHelp = document.getElementById('draw-help');
const drawn = document.getElementById('drawn');
let drawnSignalMode = false;
drawBtn.addEventListener('click', () => {
    if (drawn.classList.contains("hidden")) {
        drawn.classList.remove('hidden');
        baseband.classList.add('hidden');
        drawHelp.classList.remove('hidden');
        nyquist.classList.add('hidden');
        drawBtn.innerHTML = 'Default signal';
        svg.selectAll(".point").remove();
        drawnSignalMode = true;
        sampled = false;
    } else {
        baseband.classList.remove("hidden");
        drawn.classList.add('hidden');
        nyquist.classList.remove("hidden");
        drawHelp.classList.add('hidden');
        drawBtn.innerHTML = 'Draw your signal';
        svg.selectAll(".point").remove();
        sampledPointsGroup.selectAll("*").remove();
        sampledPath.attr("d", "");
        drawnSignalMode = false;
        sampled = false;
        resetSignal();
    }
});


// Initialize the visualization
generateSignalPoints();