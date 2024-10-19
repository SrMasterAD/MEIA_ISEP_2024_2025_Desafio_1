let currentQuestionIndex = 0;
let diagnosisResults = [];
let currentDiagnosisIndex = 0;

const questions = [
    {
        type: 'multiple',
        question: 'Quais os principais sintomas apresentados pelo seu carro?',
        options: [
            { label: 'Ruído estranho no motor', value: 'motor_ruido' },
            { label: 'Freios desgastados', value: 'freios_desgastados' },
            { label: 'Consumo elevado de combustível', value: 'consumo_alto' },
            { label: 'Bateria descarregando rapidamente', value: 'bateria_fraca' }
        ],
        selectedOptions: []
    },
    {
        type: 'yesno',
        question: 'O carro apresenta falhas ao dar partida?',
        answer: null
    },
    {
        type: 'yesno',
        question: 'Observou vazamento de óleo no motor?',
        answer: null
    }
];

function startDiagnosis() {
    document.getElementById('welcome-screen').style.opacity = 0;
    setTimeout(() => {
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('diagnostic-container').style.display = 'flex';
        loadQuestion();
    }, 500);
}

function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    const questionTitle = document.getElementById('question-title');
    const optionsContainer = document.getElementById('options-container');
    questionTitle.textContent = currentQuestion.question;
    optionsContainer.innerHTML = '';

    if (currentQuestion.type === 'multiple') {
        currentQuestion.options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');
            optionDiv.onclick = () => toggleSelection(optionDiv, option.value);
            optionDiv.innerHTML = `<label>${option.label}</label>`;
            optionsContainer.appendChild(optionDiv);
        });
    } else if (currentQuestion.type === 'yesno') {
        const yesDiv = createYesNoOption('Sim', () => selectYesNo('yes'), 'yes-option');
        const noDiv = createYesNoOption('Não', () => selectYesNo('no'), 'no-option');
        optionsContainer.appendChild(yesDiv);
        optionsContainer.appendChild(noDiv);
    }

    toggleNavigationButtons();
}

function toggleSelection(optionDiv, value) {
    const selected = optionDiv.classList.toggle('selected');
    const currentQuestion = questions[currentQuestionIndex];
    
    if (selected) {
        currentQuestion.selectedOptions.push(value);
    } else {
        const index = currentQuestion.selectedOptions.indexOf(value);
        if (index > -1) {
            currentQuestion.selectedOptions.splice(index, 1);
        }
    }

    toggleNavigationButtons();
}

function createYesNoOption(label, onClick, className) {
    const div = document.createElement('div');
    div.classList.add('option', className);
    div.onclick = onClick;
    div.innerHTML = `<label>${label}</label>`;
    return div;
}

function selectYesNo(answer) {
    const yesDiv = document.querySelector('.yes-option');
    const noDiv = document.querySelector('.no-option');

    if (answer === 'yes') {
        yesDiv.classList.add('selected');
        noDiv.classList.remove('selected');
    } else {
        noDiv.classList.add('selected');
        yesDiv.classList.remove('selected');
    }

    questions[currentQuestionIndex].answer = answer;
    toggleNavigationButtons();
}

function toggleNavigationButtons() {
    const nextButton = document.getElementById('next-btn');
    nextButton.disabled = !isNextButtonEnabled();
    nextButton.textContent = currentQuestionIndex < questions.length - 1 ? 'Próximo →' : 'Finalizar →';

    if (nextButton.disabled) {
        nextButton.style.backgroundColor = '#555';  // Gray out the button when disabled
    } else {
        nextButton.style.backgroundColor = '#f39c12';  // Restore button color when enabled
    }
}

function isNextButtonEnabled() {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type === 'multiple') {
        return currentQuestion.selectedOptions.length > 0;
    } else if (currentQuestion.type === 'yesno') {
        return currentQuestion.answer !== null;
    }
    return false;
}

function nextQuestion() {
    if (isNextButtonEnabled()) {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            generateDiagnosis();
        }
    } else {
        alert("Por favor, selecione pelo menos uma opção antes de continuar.");
    }
}

function generateDiagnosis() {
    // Simulate diagnosis results
    diagnosisResults = [
        "Problema no sistema de ignição.",
        "Falha no alternador e carga da bateria.",
        "Verificar nível de óleo e pressão dos pneus."
    ];

    document.getElementById('diagnosis-text').textContent = diagnosisResults[currentDiagnosisIndex];
    showDiagnosis();
}

function showDiagnosis() {
    document.getElementById('diagnostic-container').style.display = 'none';
    document.getElementById('diagnosis-container').style.display = 'block';
    displayDiagnosis();
}

function displayDiagnosis() {
    const diagnosisText = diagnosisResults[currentDiagnosisIndex];
    document.getElementById('diagnosis-text').textContent = diagnosisText;

    const responsesTable = document.getElementById('answered-questions');
    responsesTable.innerHTML = '';  // Clear previous content

    questions.forEach((question) => {
        let responseRow = document.createElement('tr');
        let answerText = question.type === 'multiple'
            ? question.selectedOptions.join(', ')
            : question.answer;

        responseRow.innerHTML = `
            <td>${question.question}</td>
            <td>${answerText}</td>`;
        responsesTable.appendChild(responseRow);
    });

    toggleResultNavigationButtons();
}

function retryDiagnosis() {
    currentQuestionIndex = 0;
    diagnosisResults = [];
    currentDiagnosisIndex = 0;
    document.getElementById('diagnosis-container').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'flex';
    document.getElementById('welcome-screen').style.opacity = 1;
}

function nextResult() {
    if (currentDiagnosisIndex < diagnosisResults.length - 1) {
        currentDiagnosisIndex++;
        displayDiagnosis();
    }
}

function previousResult() {
    if (currentDiagnosisIndex > 0) {
        currentDiagnosisIndex--;
        displayDiagnosis();
    }
}

function toggleResultNavigationButtons() {
    const previousButton = document.getElementById('previous-result-btn');
    const nextButton = document.getElementById('next-result-btn');
    
    previousButton.disabled = currentDiagnosisIndex === 0;
    nextButton.disabled = currentDiagnosisIndex === diagnosisResults.length - 1;

    if (previousButton.disabled) {
        previousButton.style.color = '#555';  // Gray out when disabled
    } else {
        previousButton.style.color = '#f39c12';  // Restore color when enabled
    }

    if (nextButton.disabled) {
        nextButton.style.color = '#555';  // Gray out when disabled
    } else {
        nextButton.style.color = '#f39c12';  // Restore color when enabled
    }
}

window.onload = () => {
    document.getElementById('diagnostic-container').style.display = 'none';
    document.getElementById('welcome-screen').style.opacity = 1;
};
