let modulationType = 'Original';  // Default to original signal
let time = 0;

function setup() {
    createCanvas(800, 400);
    textAlign(CENTER, CENTER);
}

function draw() {
    background(255);
    
    // Draw the two devices
    fill(200);
    ellipse(150, height / 2, 50, 50);  // Left device
    ellipse(width - 150, height / 2, 50, 50);  // Right device
    
    // Draw signal transmission (Original/AM/FM)
    drawSignal();
    
    // Label the devices
    fill(0);
    textSize(16);
    text('Sender', 150, height / 2 + 50);
    text('Receiver', width - 150, height / 2 + 50);
}

function drawSignal() {
    stroke(0);
    noFill();
    beginShape();
    
    for (let x = 150; x <= width - 150; x += 5) {
        let y;
        if (modulationType === 'Original') {
            // Original signal: Pure sine wave
            y = sin(x * 0.05 + time) * 50;
        } else if (modulationType === 'AM') {
            // Amplitude Modulation: Amplitude varies with time
            y = sin(x * 0.05 + time) * sin(x * 0.01) * 50;
        } else if (modulationType === 'FM') {
            // Frequency Modulation: Frequency varies with time
            y = sin(x * 0.05 + time * cos(x * 0.01)) * 50;
        }
        vertex(x, height / 2 + y);
    }
    endShape();
    
    time += 0.05;  // Increment time for animation
}

// Function to set the modulation type
function setModulation(type) {
    modulationType = type;
}
