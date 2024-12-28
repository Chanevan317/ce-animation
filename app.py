from flask import Flask, render_template
import os

app = Flask(
    __name__,
    template_folder='frontend',  # Path to your HTML files
    static_folder='frontend',   # Path to your CSS/JS files
    static_url_path='/'         # Serve static files from the root
)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/topic<int:topic_number>')
def topic_page(topic_number):
    return render_template(f'topics/topic{topic_number}.html')

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
