from flask import request, jsonify
import numpy as np

def process_signal():
    try:
        params = request.json
        speed = float(params['speed'])
        amplitude = float(params['amplitude'])
        frequency = float(params['frequency'])
        am_amplitude = float(params['am_amplitude'])
        fm_frequency = float(params['fm_frequency'])
        
        print(f"Received parameters: {params}")

        duration = 2  # seconds
        sampling_rate = 1000  # Hz
        time = np.linspace(0, duration, int(duration * sampling_rate), endpoint=False)

        original_signal = amplitude * np.sin(2 * np.pi * frequency * time)
        modulating_signal = np.sin(2 * np.pi * speed * time)
        am_signal = (1 + am_amplitude * modulating_signal) * np.sin(2 * np.pi * frequency * time)
        instantaneous_frequency = frequency + fm_frequency * modulating_signal
        fm_signal = np.sin(2 * np.pi * np.cumsum(instantaneous_frequency) / sampling_rate)

        # Check for NaN values
        if np.any(np.isnan(original_signal)) or np.any(np.isnan(am_signal)) or np.any(np.isnan(fm_signal)):
            return jsonify({'error': 'Generated signals contain NaN values'}), 400

        print({
            'time': time.tolist(),
            'original': original_signal.tolist(),
            'am': am_signal.tolist(),
            'fm': fm_signal.tolist()
        })

        return jsonify({
            'time': time.tolist(),
            'original': original_signal.tolist(),
            'am': am_signal.tolist(),
            'fm': fm_signal.tolist()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400  # Return JSON error response