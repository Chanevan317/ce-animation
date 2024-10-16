from flask import Flask, render_template

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<string:style_page>/Css')
def stylesCss(style_page):
    return render_template(f'/css/{style_page}.css')

@app.route('/chapter<int:chapter_number>')
def chapter_page(chapter_number):
    return render_template(f'chapters/chapter{chapter_number}.html')

if __name__ == '__main__':
    app.run(debug=True)
