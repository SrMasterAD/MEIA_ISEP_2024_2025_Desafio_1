let selectedAnswer = '';

function selectAnswer(element) {
    // Deselect previously selected answers
    const answers = document.querySelectorAll('#answers-list li');
    answers.forEach(answer => answer.classList.remove('selected'));

    // Mark the clicked answer as selected
    element.classList.add('selected');
    selectedAnswer = element.innerText;
}

function submitAnswer() {
    if (!selectedAnswer) {
        alert('Please select an answer before confirming.');
        return;
    }

    const userAnswer = { answer: selectedAnswer };

    fetch('https://your-backend-api.com/submit-answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userAnswer),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Your answer has been submitted!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('There was an error submitting your answer.');
    });
}
