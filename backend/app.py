from flask import Flask, render_template, jsonify
import os
import json

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend', static_url_path='/')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<string:style_page>/Css')
def stylesCss(style_page):
    return render_template(f'/css/{style_page}.css')

@app.route('/topic<int:topic_number>')
def topic_page(topic_number):
    return render_template(f'topics/topic{topic_number}.html')

@app.route('/api/signal-data')
def get_signal_data():
    # Adjust the path to locate the JSON file correctly
    file_path = os.path.join(os.path.dirname(__file__), 'signal_data.json')
    with open(file_path, 'r') as file:
        data = json.load(file)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
