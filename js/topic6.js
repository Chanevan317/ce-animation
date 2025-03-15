const width = 800, height = 450, margin = { top: 30, right: -20, bottom: 30, left: -20 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;
const maxTimeInSeconds = 1; // Maximum time of 1 second on x-axis

// Signal state
let modulatedData = [];
let carrierAmplitude = 0.5; // Initial carrier amplitude
let carrierFrequency = 10; // Initial carrier frequency (10-100 Hz range)
let binarySequence = "1010"; // Default binary data
let bitRate = 4; // Default bit rate in bps (max 10 bps)
let signalType = 'ask'; // Default to ASK

// ASK specific parameters
let askZeroAmplitude = 0; // Amplitude for binary 0 in ASK

// FSK specific parameters
let fskZeroFrequency = 5; // Frequency for binary 0 in FSK

// PSK specific parameters
let pskOnePhase = 180; // Phase for binary 1 in PSK (degrees)
let pskZeroPhase = 0;  // Phase for binary 0 in PSK (degrees)

// Setup SVG
const svg = d3.select("#signal-plot")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("border", "2px solid #F5F5F577");

svg.selectAll("*").remove();
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Setup clipping path
g.append("defs").append("clipPath").attr("id", "clip")
    .append("rect").attr("width", plotWidth).attr("height", plotHeight);

// Setup scales
const xScale = d3.scaleLinear().domain([0, maxTimeInSeconds]).range([0, plotWidth]);
const yScale = d3.scaleLinear().domain([-2.5, 2.5]).range([plotHeight, 0]);

// Setup line generator
const lineGenerator = d3.line()
    .x(d => xScale(d.time))
    .y(d => yScale(d.value))
    .curve(d3.curveBasis);

// Signal paths
const signalContainer = g.append("g").attr("clip-path", "url(#clip)").attr("class", "signal-container");
const modulatedPath = signalContainer.append("path")
    .attr("class", "line modulated-line")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 2);

// Add gridlines - vertical (time divisions)
const timeGridlines = g.append("g")
    .attr("class", "grid time-grid");

function updateTimeGridlines() {
    // Clear existing gridlines
    timeGridlines.selectAll("*").remove();
    
    // Calculate number of divisions based on bit rate
    const numDivisions = bitRate;
    const divisionWidth = maxTimeInSeconds / numDivisions;
    
    // Create array of division points
    const divisions = Array.from({length: numDivisions + 1}, (_, i) => i * divisionWidth);
    
    // Add vertical gridlines
    timeGridlines.selectAll(".time-gridline")
        .data(divisions)
        .enter()
        .append("line")
        .attr("class", "time-gridline")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", 0)
        .attr("y2", plotHeight)
        .attr("stroke", "#e0e0e050")
        .attr("stroke-dasharray", "2,2");
        
    // Add bit position labels (optional)
    timeGridlines.selectAll(".bit-label")
        .data(divisions.slice(0, -1))
        .enter()
        .append("text")
        .attr("class", "bit-label")
        .attr("x", d => xScale(d + divisionWidth/2))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#aaa")
        .text((d, i) => binarySequence.length > i ? binarySequence[i] : "");
}

// Add horizontal gridlines
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

// Draw axes
g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));

g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${plotHeight})`)
    .call(d3.axisBottom(xScale)
        .tickFormat(d => `${d.toFixed(1)}s`));

// Add axis labels
g.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${plotWidth/2},${plotHeight + 35})`)
    .text("Time (seconds)");

g.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(-35,${plotHeight/2})rotate(-90)`)
    .text("Amplitude (V)");

// Function to get binary value at specific time
function getBinaryValueAtTime(time) {
    const bitDuration = maxTimeInSeconds / bitRate; // Duration of one bit in seconds
    const bitPosition = Math.floor(time / bitDuration);
    
    // Return 0 if beyond the length of the binary sequence
    if (bitPosition >= binarySequence.length) return 0;
    
    return binarySequence[bitPosition] === '1' ? 1 : 0;
}

// Function to generate modulated signals based on binary data
function generateModulatedSignal() {
    modulatedData = [];
    // Dynamically adjust points based on frequency to maintain resolution
    const points = Math.max(1000, carrierFrequency * 100); 
    const timeStep = maxTimeInSeconds / points;
    
    for (let i = 0; i <= points; i++) {
        const time = i * timeStep;
        const currentBit = getBinaryValueAtTime(time);
        
        let value = 0;
        
        switch (signalType) {
            case 'ask':
                const askAmplitude = currentBit === 1 ? carrierAmplitude : askZeroAmplitude;
                value = askAmplitude * Math.cos(2 * Math.PI * carrierFrequency * time);
                break;
                
            case 'fsk':
                const fskFreq = currentBit === 1 ? carrierFrequency : fskZeroFrequency;
                value = carrierAmplitude * Math.cos(2 * Math.PI * fskFreq * time);
                break;
                
            case 'psk':
                const phaseShift = currentBit === 1 ? 
                    (pskOnePhase * Math.PI / 180) : 
                    (pskZeroPhase * Math.PI / 180);
                value = carrierAmplitude * Math.cos(2 * Math.PI * carrierFrequency * time + phaseShift);
                break;
        }
        
        // Only apply smoothing for lower frequencies or remove smoothing entirely
        // if (carrierFrequency < 50) {
        //     const smoothingFactor = 0.2 * (50 / (carrierFrequency + 10));
        //     value = previousValue * (1 - smoothingFactor) + value * smoothingFactor;
        //     previousValue = value;
        // }
        
        modulatedData.push({ time, value });
    }
    
    return modulatedData;
}

// Function to toggle control sections based on modulation type
function updateControlVisibility() {
    document.getElementById("ask-control").classList.toggle("hidden", signalType !== "ask");
    document.getElementById("fsk-control").classList.toggle("hidden", signalType !== "fsk");
    document.getElementById("psk-control").classList.toggle("hidden", signalType !== "psk");
}

// Function to update max length of binary sequence based on bit rate
function updateMaxBinaryLength() {
    const maxLength = bitRate;
    const input = document.getElementById("binary-sequence");
    
    // Trim if needed
    if (binarySequence.length > maxLength) {
        binarySequence = binarySequence.substring(0, maxLength);
        input.value = binarySequence;
    }
    
    // Update max attribute
    input.setAttribute("maxlength", maxLength);
    
    // Update helper text
    //document.getElementById("binary-length-info").textContent = `Max ${maxLength} bits`;
}

// Function to change modulation type and update controls
function setSignalType(type) {
    signalType = type;
    
    // Update control visibility
    updateControlVisibility();
    
    // Update the modulated signal
    updateVisualization();
}

// Combined update function
function updateVisualization() {
    const modulated = generateModulatedSignal();

    const colorMap = {
        ask: "orange",
        fsk: "yellow",
        psk: "cyan"
    };

    modulatedPath
        .attr("stroke", colorMap[signalType] || "white") // Set color based on type
        .attr("d", lineGenerator(modulated));

    updateTimeGridlines();
}


// Event listeners for buttons
document.getElementById("ASK-btn").addEventListener("click", () => {
    setSignalType('ask');
});

document.getElementById("FSK-btn").addEventListener("click", () => {
    setSignalType('fsk');
});

document.getElementById("PSK-btn").addEventListener("click", () => {
    setSignalType('psk');
});

// Handle carrier amplitude slider changes
document.getElementById("carrier-amplitude-slider").addEventListener("input", function() {
    carrierAmplitude = parseFloat(this.value);
    document.getElementById("carrier-amplitude-value").textContent = `${carrierAmplitude.toFixed(1)} V`;
    updateVisualization();
});

// Handle carrier frequency slider changes
document.getElementById("carrier-frequency-slider").addEventListener("input", function() {
    carrierFrequency = parseInt(this.value);
    document.getElementById("carrier-frequency-value").textContent = `${carrierFrequency} Hz`;
    updateVisualization();
});

// Handle bit rate slider changes
document.getElementById("bit-rate-slider").addEventListener("input", function() {
    bitRate = parseInt(this.value);
    document.getElementById("bit-rate-value").textContent = `${bitRate} bps`;
    
    // Update max binary length
    updateMaxBinaryLength();
    
    // Update visualization
    updateVisualization();
});

// Handle binary sequence input changes
document.getElementById("binary-sequence").addEventListener("input", function() {
    // Filter to only allow 0s and 1s
    this.value = this.value.replace(/[^01]/g, '');
    
    // Enforce max length
    if (this.value.length > bitRate) {
        this.value = this.value.substring(0, bitRate);
    }
    
    // Use default if empty
    binarySequence = this.value || "1010";
    
    // Update visualization
    updateVisualization();
});

// Random binary sequence generator
document.getElementById("generate-binary").addEventListener("click", function() {
    const length = bitRate; // Use current bitRate as length
    let randomSequence = '';
    
    for (let i = 0; i < length; i++) {
        randomSequence += Math.random() > 0.5 ? '1' : '0';
    }
    
    document.getElementById("binary-sequence").value = randomSequence;
    binarySequence = randomSequence;
    
    // Update visualization
    updateVisualization();
});

// ASK: Handle binary 0 amplitude slider
document.getElementById("ask-amplitude-slider").addEventListener("input", function() {
    askZeroAmplitude = parseFloat(this.value);
    document.getElementById("ask-amplitude-value").textContent = `${askZeroAmplitude.toFixed(1)} V`;
    if (signalType === 'ask') updateVisualization();
});

// FSK: Handle binary 0 frequency slider
document.getElementById("fsk-freq-slider").addEventListener("input", function() {
    fskZeroFrequency = parseInt(this.value);
    document.getElementById("fsk-freq-value").textContent = `${fskZeroFrequency} Hz`;
    if (signalType === 'fsk') updateVisualization();
});

// PSK: Handle binary 1 phase slider
document.getElementById("psk-pos-phase-slider").addEventListener("input", function() {
    pskOnePhase = parseInt(this.value);
    document.getElementById("psk-pos-phase-value").textContent = `${pskOnePhase}°`;
    if (signalType === 'psk') updateVisualization();
});

// PSK: Handle binary 0 phase slider
document.getElementById("psk-neg-phase-slider").addEventListener("input", function() {
    pskZeroPhase = parseInt(this.value);
    document.getElementById("psk-neg-phase-value").textContent = `${pskZeroPhase}°`;
    if (signalType === 'psk') updateVisualization();
});

// Initialize
updateControlVisibility();
updateMaxBinaryLength();
updateVisualization();  