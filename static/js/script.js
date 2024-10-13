document.getElementById('chapter1Form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    fetch('/chapter1', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Use the data to create or update the animation for the chapter
        animateChapter1(data);
    });
});

function animateChapter1(data) {
    // Example animation logic based on chapter 1 content
    const animationDiv = document.getElementById('animation');
    animationDiv.style.width = `${data.value * 10}px`;
    animationDiv.style.height = `${data.value * 10}px`;
    animationDiv.style.backgroundColor = 'blue';
}
