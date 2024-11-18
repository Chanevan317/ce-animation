from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

@app.route('/process-signal', methods=['POST'])
def process_signal():
    # Parse incoming JSON data
    params = request.json
    speed = float(params['speed'])
    amplitude = float(params['amplitude'])
    frequency = float(params['frequency'])
    am_amplitude = float(params['am_amplitude'])
    fm_frequency = float(params['fm_frequency'])

    # Signal parameters
    duration = 2  # seconds
    sampling_rate = 1000  # Hz
    time = np.linspace(0, duration, int(duration * sampling_rate), endpoint=False)

    # Generate Original Signal
    original_signal = amplitude * np.sin(2 * np.pi * frequency * time)

    # Generate AM Signal
    modulating_signal = np.sin(2 * np.pi * speed * time)
    am_signal = (1 + am_amplitude * modulating_signal) * np.sin(2 * np.pi * frequency * time)

    # Generate FM Signal
    instantaneous_frequency = frequency + fm_frequency * modulating_signal
    fm_signal = np.sin(2 * np.pi * np.cumsum(instantaneous_frequency) / sampling_rate)

    # Return data as JSON
    return jsonify({
        'time': time.tolist(),
        'original': original_signal.tolist(),
        'am': am_signal.tolist(),
        'fm': fm_signal.tolist()
    })

if __name__ == '__main__':
    app.run(debug=True)
