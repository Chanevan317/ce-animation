from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chapter1')
def chapter1():
    return render_template('chapters/chapter1.html')

@app.route('/chapter2')
def chapter2():
    return render_template('chapters/chapter2.html')

# More chapters...
@app.route('/chapter3')
def chapter3():
    return render_template('chapters/chapter3.html')

@app.route('/chapter4')
def chapter4():
    return render_template('chapters/chapter4.html')

@app.route('/chapter5')
def chapter5():
    return render_template('chapters/chapter5.html')

@app.route('/chapter6')
def chapter6():
    return render_template('chapters/chapter6.html')

@app.route('/chapter7')
def chapter7():
    return render_template('chapters/chapter7.html')

@app.route('/chapter8')
def chapter8():
    return render_template('chapters/chapter8.html')

@app.route('/chapter9')
def chapter9():
    return render_template('chapters/chapter9.html')

@app.route('/chapter10')
def chapter10():
    return render_template('chapters/chapter10.html')

@app.route('/chapter11')
def chapter11():
    return render_template('chapters/chapter11.html')

if __name__ == '__main__':
    app.run(debug=True)
