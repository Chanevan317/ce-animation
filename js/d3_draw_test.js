// Modify the reconstructSignal function similarly
function reconstructSignal() {
    // Determine which signal to reconstruct
    let signalToReconstruct = timeData;

    // If there are drawn points, use those
    if (signalData.length > 0) {
        // Convert signalData to the same format as timeData if it's not already
        signalToReconstruct = signalData.map(point => ({
            time: point.x,
            value: point.y
        }));
    }

    // Check if signal has been sampled first
    if (!sampledPoints || sampledPoints.length === 0 && !sampled) {
        alert("Please sample the signal first before reconstruction");
        return;
    }

    // Check if signals have been reset
    if (reset) {
        alert("Please sample the signal first before reconstruction");
        return;
    }

    // Time points for reconstruction (use same time points as original signal)
    const reconstructedPoints = [];
    const T = 1 / samplingFrequency; // Sampling period

    // Use the same time points as the original signal for reconstruction
    for (let i = 0; i < signalToReconstruct.length; i++) {
        const t = signalToReconstruct[i].time;
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