var optionsToSend = [];
var diagnosticsMap = new Map();
var questionsAsked = [];
var currentDiagnosisIndex = 0; 
var question;
var isFirstQuestion = true;

let technology = "drools";
window.addEventListener('DOMContentLoaded',function () {
    document.getElementById("language-select").addEventListener("change", (event) => {
        technology = event.target.value;
    });
});

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
    firstQuestion.valores = ["Irregularidades no motor", "Fumo anormal", "O veículo tem dificuldades ao dar o terceiro contacto de ignição", "Luzes no painel"];
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
    switch(technology) {
        case "prolog":
            await executePrologQuestion();
            break;
        default:
            await executeDroolsQuestion();
            break;
    }
}

async function executePrologQuestion() {
    const jsonData =[];

    for (let i = 0; i < questionsAsked.length; i++) {
        for (let j = 0; j < questionsAsked[i].chosenAnswers.length; j++) {
            jsonData.push({
                "evidencia": questionsAsked[i].questao, 
                "valor": questionsAsked[i].chosenAnswers[j] 
            });
        }
    }

    await axios.post('http://localhost:8070/api/prolog/execute', jsonData, {
        headers: {
            'Content-Type': 'application/json'
        }
        })
        .then(response => {
            question.questao = response.data.questao;
            question.valores = response.data.possiveisValores;
        })
        .catch(error => {
        console.error(error);
    });

    afterQuestion(question);
}

async function executeDroolsQuestion() {
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

    //TODO

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
    switch(technology) {
        case "prolog":
            nextQuestionProlog();
            break;
        default:
            nextQuestionDrools();
            break;
    }
}

async function nextQuestionProlog() {

    const jsonData =[];
    for (let i = 0; j < questionsAsked[questionsAsked.length-1].chosenAnswers.length; i++) {
        jsonData.push({
            "evidencia": questionsAsked[questionsAsked.length-1].questao, 
            "valor": questionsAsked[questionsAsked.length-1].chosenAnswers[i] 
        });
    }

    await axios.post('http://localhost:8070/nextStep', jsonData, {
        headers: {
            'Content-Type': 'application/json'
        }
        })
    .then(response => {
        question.questao = response.data.questao;
        question.valores = response.data.opcoes;
    })
    .catch(error => {
    console.error(error);
    });

    afterQuestion(question);
}

async function nextQuestionDrools() {

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

    // Show the diagnosis container with only the first diagnostic key
    showDiagnosis([0]); // Display the diagnosis container and start with the first diagnosis
    toggleResultNavigationButtons(); // Ensure the navigation buttons are updated
}

function showDiagnosis(diagnosticKeys) {
    document.getElementById('diagnostic-container').style.display = 'none';
    document.getElementById('diagnosis-container').style.display = 'block';
    displayDiagnosis(diagnosticKeys);
}

function displayDiagnosis(diagnosticKeys) {
    const responsesTable = document.getElementById('answered-questions');
    responsesTable.innerHTML = ''; 

    const diagnosticData = diagnosticsMap.get(diagnosticKeys[0]);  // Only use the first (current) index
    const { diagnosticText, questionAnswers } = diagnosticData;

    questionAnswers.forEach((qa) => {
        let question = Object.keys(qa)[0];
        let answer = qa[question];

        let responseRow = document.createElement('tr');
        responseRow.innerHTML = `
            <td>${question}</td>
            <td>${answer}</td>`;
        responsesTable.appendChild(responseRow);
    });

    const { cleanedText, removedParts } = removePercentagePhrases(diagnosticData.diagnosticText);
    document.getElementById('diagnosis-text').textContent = cleanedText;
    document.getElementById('precision-text').textContent = removedParts;

    toggleResultNavigationButtons();
}

function retryDiagnosis() {
    questionsAsked = [];
    diagnosticsMap = new Map();
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

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    diagnosticsMap.forEach((diagnosticData, index) => {
        const { cleanedText, removedParts } = removePercentagePhrases(diagnosticData.diagnosticText);

        const title = `Diagnóstico: ${cleanedText}`;
        doc.setFontSize(18);
        doc.text(title, 10, 10);

        const precision = `\nPrecisão do Diagnóstico: ${removedParts}`;
        doc.setFontSize(10);
        doc.text(precision, 10, 10);

        // Prepare question-answer pairs for this diagnostic
        let data = [];
        diagnosticData.questionAnswers.forEach(qa => {
            const question = Object.keys(qa)[0];
            const answer = qa[question];
            data.push([question, answer]);
        });

        // Add question-answer pairs as a table
        doc.autoTable({
            head: [['Pergunta', 'Resposta']],
            body: data,
            startY: 20,
            styles: { fontSize: 10, cellPadding: 3 },
        });

        // Add a new page if there are more diagnostics to add
        if (index < diagnosticsMap.size - 1) {
            doc.addPage();
        }
    });

    doc.save('Diagnóstico.pdf');
}

function removePercentagePhrases(text) {
    // Use regex to match all text in parentheses containing a % sign
    const removedParts = text.match(/\(.*?%\)/g) || []; // Store matched parts
    const cleanedText = text.replace(/\s*\(.*?%\)\s*/g, ' ').trim(); // Clean the text
    return { cleanedText, removedParts }; // Return both the cleaned text and removed parts
}