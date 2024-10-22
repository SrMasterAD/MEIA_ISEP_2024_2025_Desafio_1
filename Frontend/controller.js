

var optionsToSend = [];
var chosenAnswers = [];
var currentDiagnosisIndex;
var question;

function startDiagnosis() {
    startEngine();
    document.getElementById('welcome-screen').style.opacity = 0;
    setTimeout(() => {
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('diagnostic-container').style.display = 'flex';
    }, 500);
}

function startEngine(){

    let firstQuestion = {};

    firstQuestion.pergunta = "Quais são os sintomas que o seu automóvel apresenta?";
    firstQuestion.possiveisValores = ["Problemas no motor", "Fumo anormal", "O veículo não consegue dar o terceiro contacto de ignição", "Luzes no painel"];
    loadQuestion(firstQuestion);
}

function loadQuestion(currentQuestion) {

    let questionTitle = document.getElementById('question-title');
    let optionsContainer = document.getElementById('options-container'); 

    optionsToSend = [];
    chosenAnswers = [];

    questionTitle.textContent = currentQuestion.pergunta;
    optionsContainer.innerHTML = '';

    if (currentQuestion.possiveisValores.length > 2) {

        currentQuestion.possiveisValores.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');
            optionDiv.onclick = () => toggleSelection(optionDiv, option, questionTitle);
            optionDiv.innerHTML = `<label>${option}</label>`;
            optionsContainer.appendChild(optionDiv);
            optionsToSend.push(option);
        });
    } else if (currentQuestion.possiveisValores.length === 2) {
        const yesDiv = createYesNoOption('Sim', () => selectYesNo('yes'), 'yes-option');
        const noDiv = createYesNoOption('Não', () => selectYesNo('no'), 'no-option');
        optionsContainer.appendChild(yesDiv);
        optionsContainer.appendChild(noDiv);
    }

    toggleNavigationButtons();
}

function toggleSelection(optionDiv, value, currentQuestion) {
    const selected = optionDiv.classList.toggle('selected');
    
    if (selected) {
        chosenAnswers.push(value);
    } else {
        chosenAnswers = chosenAnswers.filter(item => item !== value);
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

    toggleNavigationButtons();
}

function toggleNavigationButtons() {
    const nextButton = document.getElementById('next-btn');
    nextButton.disabled = !isNextButtonEnabled();

    if (nextButton.disabled) {
        nextButton.style.backgroundColor = '#555';
    } else {
        nextButton.style.backgroundColor = '#f39c12';
    }
}

function isNextButtonEnabled() {
    return chosenAnswers.length > 0;
}

function nextQuestion() {

    const questionTitle = document.getElementById('question-title');

    const jsonData =[
        {
            "evidencia" : "Qa",
            "possiveisValores" : ["Fumo anormal","O veículo não consegue dar o terceiro contacto de ignição", "Luzes no painel", "???"],
            "valor" : "Fumo anormal"
        }
    ]

    axios.post('http://localhost:8080/api/drools/execute', jsonData, {
        headers: {
            'Content-Type': 'application/json'
        }
        })
        .then(response => {
            question=response;
        })
        .catch(error => {
        console.error(error);
    });

    if (isNextButtonEnabled()) {
        if (!("diagonostico" in question)) {
            loadQuestion(question);
        } else {
            generateDiagnosis();
        }
    } else {
        alert("Por favor, selecione pelo menos uma opção antes de continuar.");
    }
}

function generateDiagnosis() {
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
    responsesTable.innerHTML = '';

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
        previousButton.style.color = '#555';
    } else {
        previousButton.style.color = '#f39c12';
    }

    if (nextButton.disabled) {
        nextButton.style.color = '#555';
    } else {
        nextButton.style.color = '#f39c12';
    }
}

window.onload = () => {
    document.getElementById('diagnostic-container').style.display = 'none';
    document.getElementById('welcome-screen').style.opacity = 1;
};
