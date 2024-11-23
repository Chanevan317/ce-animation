from flask import Flask, render_template, jsonify, request
from data_processing import process_signal
import os
import json

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend', static_url_path='/')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/topic<int:topic_number>')
def topic_page(topic_number):
    return render_template(f'topics/topic{topic_number}.html')

@app.route('/api/signal-data', methods=['POST'])
def get_signal_data():
    return process_signal()

if __name__ == '__main__':
    app.run(debug=True)
