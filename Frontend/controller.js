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
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('diagnostic-container').style.display = 'flex';
    loadQuestion();
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
            optionDiv.classList.add('btn', 'btn-outline-light');
            optionDiv.onclick = () => toggleSelection(optionDiv, option.value);
            optionDiv.innerHTML = `<label>${option.label}</label>`;
            optionsContainer.appendChild(optionDiv);
        });
    } else if (currentQuestion.type === 'yesno') {
        const yesDiv = createYesNoOption('Sim', () => selectYesNo('yes'), 'btn-outline-success');
        const noDiv = createYesNoOption('Não', () => selectYesNo('no'), 'btn-outline-danger');
        optionsContainer.appendChild(yesDiv);
        optionsContainer.appendChild(noDiv);
    }

    toggleNavigationButtons();
}

function toggleSelection(optionDiv, value) {
    const selected = optionDiv.classList.toggle('active');
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

function createYesNoOption(label, onClick, btnClass) {
    const btn = document.createElement('div');
    btn.classList.add('btn', btnClass);
    btn.onclick = onClick;
    btn.innerHTML = `<label>${label}</label>`;
    return btn;
}

function selectYesNo(answer) {
    const yesDiv = document.querySelector('.btn-outline-success');
    const noDiv = document.querySelector('.btn-outline-danger');

    if (answer === 'yes') {
        yesDiv.classList.add('active');
        noDiv.classList.remove('active');
    } else {
        noDiv.classList.add('active');
        yesDiv.classList.remove('active');
    }

    questions[currentQuestionIndex].answer = answer;
    toggleNavigationButtons();
}

function toggleNavigationButtons() {
    const nextButton = document.getElementById('next-btn');
    nextButton.disabled = !isNextButtonEnabled();
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
        alert("Por favor, selecione uma opção.");
    }
}

function generateDiagnosis() {
    diagnosisResults = [
        "Problema no sistema de ignição.",
        "Falha no alternador e carga da bateria.",
        "Verificar nível de óleo e pressão dos pneus."
    ];

    document.getElementById('diagnosis-text').textContent = diagnosisResults[currentDiagnosisIndex];
    document.getElementById('diagnostic-container').style.display = 'none';
    document.getElementById('diagnosis-container').style.display = 'flex';
    displayDiagnosis();
}

function displayDiagnosis() {
    const diagnosisText = diagnosisResults[currentDiagnosisIndex];
    document.getElementById('diagnosis-text').textContent = diagnosisText;

    const responsesTable = document.getElementById('answered-questions');
    responsesTable.innerHTML = '';

    questions.forEach((question) => {
        const answer = question.type === 'multiple' ? question.selectedOptions.join(', ') : question.answer;
        const row = `<tr><td>${question.question}</td><td>${answer}</td></tr>`;
        responsesTable.insertAdjacentHTML('beforeend', row);
    });
}

function retryDiagnosis() {
    currentQuestionIndex = 0;
    diagnosisResults = [];
    currentDiagnosisIndex = 0;
    questions.forEach(q => {
        q.selectedOptions = [];
        q.answer = null;
    });

    document.getElementById('diagnosis-container').style.display = 'none';
    document.getElementById('diagnostic-container').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'flex';
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