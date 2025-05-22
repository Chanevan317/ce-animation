const width = 800, height = 450, margin = { top: 20, right: -20, bottom: 20, left: -20 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;

// Sampling and display parameters
const samplingRate = 10000; // 10kHz sampling rate
const timeWindow = 0.1; // 100ms window
const numPoints = Math.floor(samplingRate * timeWindow);

// Signal state
let amplitude = 2;
let frequency = 10;
let stepSize = 0.5;
let noiseLevel = 0.1;
let timeData = [];
let isNoiseMode = false;

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

// Add quantized signal path
const quantizedPath = signalContainer.append("path")
    .attr("class", "line quantized-line")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 2);

// Add reconstructed signal path
const reconstructedPath = signalContainer.append("path")
    .attr("class", "line reconstructed-line")
    .attr("fill", "none")
    .attr("stroke", "yellow")
    .attr("stroke-width", 2);

function quantizeValue(value) {
    return Math.round(value / stepSize) * stepSize;
}

function generateSignalPoints() {
    const timeStep = 0.001;
    const numPoints = Math.floor(0.1 / timeStep);
    
    timeData = Array.from({ length: numPoints }, (_, i) => {
        const t = i * timeStep;
        const originalValue = amplitude * Math.sin(2 * Math.PI * frequency * t);
        const noise = isNoiseMode ? (Math.random() - 0.5) * 2 * noiseLevel : 0;
        const signalWithNoise = originalValue + noise;
        const quantizedValue = quantizeValue(originalValue);
        
        return {
            time: t,
            value: isNoiseMode ? signalWithNoise : originalValue,
            quantizedValue: quantizedValue
        };
    });
    
    signalPath.attr("d", lineGenerator.y(d => yScale(d.value))(timeData));
    if (!isNoiseMode) {
        quantizedPath.attr("d", lineGenerator.y(d => yScale(d.quantizedValue))(timeData));
    } else {
        quantizedPath.attr("d", null); // Hide quantized signal in noise mode
    }
}

function updateQuantizationLevels() {
    g.selectAll(".quantization-level").remove();
    
    if (!isNoiseMode) {
        const levels = [];
        const [yMin, yMax] = yScale.domain();
        for (let level = Math.ceil(yMin / stepSize) * stepSize; level <= yMax; level += stepSize) {
            levels.push(level);
        }
        
        g.selectAll(".quantization-level")
            .data(levels)
            .enter()
            .append("line")
            .attr("class", "quantization-level")
            .attr("x1", 0)
            .attr("x2", plotWidth)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .attr("stroke", "#00000020")
            .attr("stroke-dasharray", "2,2");
    }
}

function reconstructSignal() {
    
    const reconstructedData = timeData.map((d, i, arr) => {
        let reconstructedValue;

        if (isNoiseMode) {
            // In noise mode, apply a simple moving average filter to reduce noise
            const windowSize = 5; // Number of points for averaging
            const start = Math.max(0, i - Math.floor(windowSize / 2));
            const end = Math.min(arr.length, i + Math.floor(windowSize / 2) + 1);
            const window = arr.slice(start, end);
            reconstructedValue = d3.mean(window, point => point.value);
        } else {
            // In step size mode, use linear interpolation between quantized values
            if (i === 0 || i === arr.length - 1) {
                reconstructedValue = d.quantizedValue;
            } else {
                const prev = arr[i - 1].quantizedValue;
                const next = arr[i + 1].quantizedValue;
                reconstructedValue = (prev + next) / 2;
            }
        }

        return {
            time: d.time,
            value: reconstructedValue,
        };
    });

    // Generate the reconstructed path
    const pathData = lineGenerator.y(d => yScale(d.value))(reconstructedData);
    reconstructedPath
        .attr("d", pathData)
        .attr("stroke", "yellow")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // Animate the path
    const totalLength = reconstructedPath.node().getTotalLength();
    reconstructedPath
        .attr("stroke-dasharray", totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500) // Set the animation duration
        .ease(d3.easeLinear) // Use linear easing for smooth animation
        .attr("stroke-dashoffset", 0); // Animate stroke-dashoffset to reveal the path
}

function updateSliderValues() {
    amplitude = parseFloat(document.getElementById("amplitude-slider").value);
    frequency = parseFloat(document.getElementById("frequency-slider").value);
    stepSize = parseFloat(document.getElementById("step-slider").value);
    noiseDB = parseFloat(document.getElementById("noise-slider").value);
    noiseLevel = Math.pow(10, noiseDB / 20);

    document.getElementById("amplitude-value").textContent = `${amplitude.toFixed(1)} V`;
    document.getElementById("frequency-value").textContent = `${frequency} Hz`;
    document.getElementById("step-value").textContent = `${stepSize.toFixed(2)} V`;
    document.getElementById("noise-value").textContent = `${noiseDB.toFixed(1)} dB`;

    if (!isNoiseMode) {
        document.getElementById("quantization-levels").textContent = `Quantization Levels: ${Math.ceil((amplitude - -amplitude) / stepSize)}`;
    }

    reconstructedPath.attr("d", null);  

    updateQuantizationLevels();
    generateSignalPoints();
}

function toggleMode() {
    isNoiseMode = !isNoiseMode;
    const stepBox = document.getElementById("step-box");
    const noiseBox = document.getElementById("noise-box");
    const stepInfo = document.getElementById("step-info");
    const noiseInfo = document.getElementById("noise-info");
    const modeBtn = document.getElementById("mode-btn");
    
    if (isNoiseMode) {
        noiseBox.classList.remove("hidden");
        stepBox.classList.add("hidden");
        noiseInfo.classList.remove("hidden");
        stepInfo.classList.add("hidden");
        modeBtn.textContent = 'Step Size Mode';
    } else {
        stepBox.classList.remove("hidden");
        noiseBox.classList.add("hidden");
        stepInfo.classList.remove("hidden");
        noiseInfo.classList.add("hidden");
        modeBtn.textContent = 'Noise Mode';
    }
    
    reconstructedPath.attr("d", null); 

    updateQuantizationLevels();
    generateSignalPoints();
}

// Event listeners
document.getElementById("amplitude-slider").addEventListener("input", updateSliderValues);
document.getElementById("frequency-slider").addEventListener("input", updateSliderValues);
document.getElementById("step-slider").addEventListener("input", updateSliderValues);
document.getElementById("noise-slider").addEventListener("input", updateSliderValues);
document.getElementById("mode-btn").addEventListener("click", toggleMode);
document.getElementById("reconstruct-btn").addEventListener("click", reconstructSignal);

// Initialize the visualization
generateSignalPoints();
updateQuantizationLevels();
