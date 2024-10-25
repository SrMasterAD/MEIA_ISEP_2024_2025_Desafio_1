var optionsToSend = [];
var diagnosticsMap = new Map();
var questionsAsked = [];
var currentDiagnosisIndex = 0; 
var question;
var isFirstQuestion = true;

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

    firstQuestion.questao = "Quais são os sintomas que o seu automóvel apresenta?";
    firstQuestion.valores = ["Irregularidades no motor", "Fumo anormal", "O veículo não consegue dar o terceiro contacto de ignição", "Luzes no painel"];
    firstQuestion.multiselect = true;
    loadQuestion(firstQuestion);
}

function loadQuestion(currentQuestion) {
    let questionTitle = document.getElementById('question-title');
    let optionsContainer = document.getElementById('options-container'); 
    questionsAsked.push(currentQuestion);
    optionsToSend = [];
    questionsAsked[questionsAsked.length - 1].chosenAnswers = [];

    //get last question of question questionsAsked

    questionTitle.textContent = currentQuestion.questao;
    optionsContainer.innerHTML = '';
    if (currentQuestion.multiselect) {
        currentQuestion.valores.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');
            optionDiv.onclick = () => toggleSelection(optionDiv, option, questionTitle);
            optionDiv.innerHTML = `<label>${option}</label>`;
            optionsContainer.appendChild(optionDiv);
            optionsToSend.push(option);
        });
    } else if(currentQuestion.multiselect == false) {
        currentQuestion.valores.forEach(option => {
            const optionDiv = createOption(option, () => selectOption(optionDiv, currentQuestion.valores, option), `${option.toLowerCase()}-option`);
            optionsContainer.appendChild(optionDiv);
            optionsToSend.push(option);
        });
    } else {
        console.log("Consulte um especialista.");
    }

    toggleNavigationButtons();
}

function createOption(label, onClick, className) {
    const div = document.createElement('div');
    div.classList.add('option', className);
    div.onclick = onClick;
    div.innerHTML = `<label>${label}</label>`;
    return div;
}

function selectOption(selectedOptionDiv, options, value) {
    const currentlySelected = selectedOptionDiv.classList.contains('selected');

    // Remove 'selected' class from all options
    options.forEach(option => {
        const optionDiv = document.querySelector(`.${option.toLowerCase()}-option`);
        if (optionDiv) {
            optionDiv.classList.remove('selected');
            questionsAsked[questionsAsked.length - 1].chosenAnswers = [];
        }
    });

    // If the clicked option wasn't already selected, select it
    if (!currentlySelected) {
        selectedOptionDiv.classList.add('selected');
    }
    questionsAsked[questionsAsked.length - 1].chosenAnswers.push(value);

    toggleNavigationButtons(); // Assuming you have a navigation button toggle
}

function toggleSelection(optionDiv, value, currentQuestion) {
    const selected = optionDiv.classList.toggle('selected');
    
    if (selected) {
        questionsAsked[questionsAsked.length - 1].chosenAnswers.push(value);
    } else {
        questionsAsked[questionsAsked.length - 1].chosenAnswers = questionsAsked[questionsAsked.length - 1].chosenAnswers.filter(item => item !== value);
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
    return questionsAsked[questionsAsked.length - 1].chosenAnswers.length > 0;
}

async function executeQuestion() {
    const jsonData =[];
    
    for (let i = 0; i < questionsAsked.length; i++) {
        for (let j = 0; j < questionsAsked[i].chosenAnswers.length; j++) {
            jsonData.push({
                "evidencia": questionsAsked[i].questao, 
                "possiveisValores": questionsAsked[i].valores, 
                "valor": questionsAsked[i].chosenAnswers[j] 
            });
        }
    }

    await axios.post('http://localhost:8080/api/drools/execute', jsonData, {
        headers: {
            'Content-Type': 'application/json'
        }
        })
        .then(response => {
            question=response.data;
        })
        .catch(error => {
        console.error(error);
    });

    afterQuestion(question);
}

async function nextQuestion() {

    let resposta = "";
    for (let i = 0; i < questionsAsked[questionsAsked.length - 1].chosenAnswers.length; i++) {
        resposta += questionsAsked[questionsAsked.length - 1].chosenAnswers[i];
        if(i != questionsAsked[questionsAsked.length - 1].chosenAnswers.length - 1) {
            resposta += ",";
        }
    }

    await axios.post(`http://localhost:8080/api/drools/nextStep?resposta=${encodeURIComponent(resposta)}`, null, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => {
        question=response.data;
    })
    .catch(error => {
    console.error(error);
    });

    afterQuestion(question);
}

function questionHandler() {
    if(isFirstQuestion){
        for (let i = 0; i < questionsAsked[questionsAsked.length - 1].chosenAnswers.length; i++) {
            if(questionsAsked[questionsAsked.length - 1].chosenAnswers[i] == "Luzes no painel") {
                perguntarLuzesDoPainel();
                return;
            }
        }
        executeQuestion();
        isFirstQuestion = false;
    } else {
        nextQuestion(question);
    }
}

function perguntarLuzesDoPainel() {
    let pergunta = {};

    pergunta.questao = "Qual é a luz que observa?";
    pergunta.valores = ["Luz de óleo","Luz do motor"];
    pergunta.multiselect = true;
    loadQuestion(pergunta);
}

function afterQuestion(question) {
    if (isNextButtonEnabled()) {
        console.log(question);
        if (!question.hasOwnProperty('diagnostico') || !question.diagnostico) {
            loadQuestion(question);
        } else {
            generateDiagnosis(question);
        }
    } else {
        alert("Por favor, selecione pelo menos uma opção antes de continuar.");
    }
}

function generateDiagnosis(rawDiagnosis) {
    let diagnosticos = Object.keys(rawDiagnosis.diagnostico);

    diagnosticos.forEach((diagnostico, index) => {
        let questionAnswers = rawDiagnosis.diagnostico[diagnostico];
        let diagnosticData = {
            diagnosticText: diagnostico,
            questionAnswers: questionAnswers
        };
        
        diagnosticsMap.set(index, diagnosticData);
    });

    let diagnosticTexts = diagnosticos.join(', ');
    document.getElementById('diagnosis-text').textContent = diagnosticTexts;

    showDiagnosis(Array.from(diagnosticsMap.keys()));
}

function showDiagnosis(diagnosticKeys) {
    document.getElementById('diagnostic-container').style.display = 'none';
    document.getElementById('diagnosis-container').style.display = 'block';
    displayDiagnosis(diagnosticKeys);
}

function displayDiagnosis(diagnosticKeys) {
    const responsesTable = document.getElementById('answered-questions');
    responsesTable.innerHTML = ''; 

    diagnosticKeys.forEach(key => {
        let diagnosticData = diagnosticsMap.get(key);
        let { diagnosticText, questionAnswers } = diagnosticData;

        questionAnswers.forEach((qa) => {
            let question = Object.keys(qa)[0];
            let answer = qa[question];

            let responseRow = document.createElement('tr');
            responseRow.innerHTML = `
                <td>${question}</td>
                <td>${answer}</td>`;
            responsesTable.appendChild(responseRow);
        });
    });

    toggleResultNavigationButtons();
}


function retryDiagnosis() {
    currentDiagnosisIndex = 0;
    isFirstQuestion = true;
    document.getElementById('diagnosis-container').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'flex';
    document.getElementById('welcome-screen').style.opacity = 1;
}

function nextResult() {
    const totalDiagnostics = diagnosticsMap.size;
    if (currentDiagnosisIndex < totalDiagnostics - 1) {
        currentDiagnosisIndex++;
        displayDiagnosis([currentDiagnosisIndex]);
    }
}

function previousResult() {
    if (currentDiagnosisIndex > 0) {
        currentDiagnosisIndex--;
        displayDiagnosis([currentDiagnosisIndex]);
    }
}

function toggleResultNavigationButtons() {
    const previousButton = document.getElementById('previous-result-btn');
    const nextButton = document.getElementById('next-result-btn');
    const totalDiagnostics = diagnosticsMap.size;

    previousButton.disabled = currentDiagnosisIndex === 0;
    nextButton.disabled = currentDiagnosisIndex === totalDiagnostics - 1;

    previousButton.style.color = previousButton.disabled ? '#555' : '#f39c12';
    nextButton.style.color = nextButton.disabled ? '#555' : '#f39c12';
}

window.onload = () => {
    document.getElementById('diagnostic-container').style.display = 'none';
    document.getElementById('welcome-screen').style.opacity = 1;
};
