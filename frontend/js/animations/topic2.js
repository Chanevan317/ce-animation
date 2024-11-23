const width = 800, height = 420, margin = { top: 20, right: 30, bottom: 30, left: 40 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;

// Default values for signal parameters
const defaultValues = {
    amplitude: 2,
    frequency: 10,
    samplingFrequency: 10,
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
const yScale = d3.scaleLinear().domain([-4.9, 4.9]).range([plotHeight, 0]);

// Setup line generator
const lineGenerator = d3.line()
    .x(d => xScale(d.time))
    .y(d => yScale(d.value));       

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
    if (samplingFrequency > 0 && timeData.length > 0) {
        // Calculate sampling period
        const samplingPeriod = 1 / samplingFrequency;
        
        // Find points closest to the sampling intervals
        sampledPoints = [];
        let currentTime = 0;
        
        while (currentTime <= timeWindow) {
            // Find the point in timeData closest to our desired sampling time
            const closestPoint = timeData.reduce((closest, current) => {
                if (!closest) return current;
                return Math.abs(current.time - currentTime) < Math.abs(closest.time - currentTime) 
                    ? current 
                    : closest;
            }, timeData[0]); // Provide initial value
            
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

    } else {
        // Clear all sampled points and lines when sampling frequency is 0
        sampledPointsGroup.selectAll("*").remove();
        sampledPath.attr("d", "");
    }
}

function reconstructSignal() {
    // Check if signal has been sampled first
    if (!sampledPoints || sampledPoints.length === 0) {
        alert("Please sample the signal first before reconstruction");
        return;
    }

    // Check if we have the original signal data
    if (!timeData || timeData.length === 0) {
        alert("No signal data available for reconstruction");
        return;
    }

    // Time points for reconstruction (use same time points as original signal)
    const reconstructedPoints = [];
    const T = 1 / samplingFrequency; // Sampling period

    // Use the same time points as the original signal for reconstruction
    for (let i = 0; i < timeData.length; i++) {
        const t = timeData[i].time;
        let reconstructedValue = 0;

        // Sum the contribution of each sampled point using sinc interpolation
        sampledPoints.forEach((sample) => {
            // Time of this sample
            const tk = sample.time;
            
            // Sinc function
            const sincArg = (t - tk) / T;
            const sincValue = Math.abs(sincArg) < 0.000001 ? 
                1 : Math.sin(Math.PI * sincArg) / (Math.PI * sincArg);
            
            reconstructedValue += sample.value * sincValue;
        });

        reconstructedPoints.push({
            time: t,
            value: reconstructedValue
        });
    }

    // Generate the reconstruction path
    const reconstructedPath = lineGenerator(reconstructedPoints);

    // Apply the reconstructed path
    sampledPath
        .attr("d", reconstructedPath)
        .attr("stroke", "yellow")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // Animate the path using stroke-dasharray and stroke-dashoffset
    const totalLength = sampledPath.node().getTotalLength();

    sampledPath
        .attr("stroke-dasharray", totalLength) // Total path length
        .attr("stroke-dashoffset", totalLength) // Start hidden
        .transition()
        .duration(1500) // Duration of the animation
        .ease(d3.easeLinear) // Linear easing for smooth transition
        .attr("stroke-dashoffset", 0); // Animate to fully visible

    return reconstructedPoints;
}

function resetSignal() {
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
    document.getElementById("am-amplitude-value").textContent = `${samplingFrequency} Hz`;
    
    // Clear sampled points
    sampledPointsGroup.selectAll("*").remove();
    sampledPath.attr("d", "");
    
    // Regenerate signal with default values
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

    // Update display values
    document.getElementById("amplitude-value").textContent = `${amplitude.toFixed(1)} V`;
    document.getElementById("frequency-value").textContent = `${frequency} Hz`;
    document.getElementById("am-amplitude-value").textContent = `${samplingFrequency} Hz`;

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

    generateSignalPoints();
}

// Event listeners
document.getElementById("amplitude-slider").addEventListener("input", updateSliderValues);
document.getElementById("frequency-slider").addEventListener("input", updateSliderValues);
document.getElementById("fs-slider").addEventListener("input", updateSliderValues);

document.getElementById("reset-btn").addEventListener("click", resetSignal);
document.getElementById("sample-btn").addEventListener("click", sampleSignal);
document.getElementById("reconstruct-btn").addEventListener("click", reconstructSignal);

// Initialize the visualization
generateSignalPoints();