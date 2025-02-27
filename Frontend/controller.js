var optionsToSend = [];
var diagnosticsMap = new Map();
var questionsAsked = [];
var currentDiagnosisIndex = 0; 
var question;
var isFirstQuestion = true;
var currentQuestionNumber = 0;

let technology = "prolog";
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
    firstQuestion.valores = ["Irregularidades no motor", "Fumo anormal", "O veículo tem dificuldades ao dar o terceiro contacto de ignição", "Luzes do painel"];
    firstQuestion.multiselect = true;
    loadQuestion(firstQuestion);
}

function loadQuestion(currentQuestion) {
    currentQuestionNumber++;
    let questionTitle = document.getElementById('question-title');
    let optionsContainer = document.getElementById('options-container'); 
    questionsAsked.push(currentQuestion);
    optionsToSend = [];
    questionsAsked[questionsAsked.length - 1].chosenAnswers = [];

    let questionText = currentQuestion.questao.split('|')[1]?.trim() || currentQuestion.questao;

    questionTitle.textContent = currentQuestionNumber + ". " + questionText;
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
    div.classList.add('option', className.replaceAll(" ", "_"));
    div.onclick = onClick;
    div.innerHTML = `<label>${label}</label>`;
    return div;
}

function selectOption(selectedOptionDiv, options, value) {
    const currentlySelected = selectedOptionDiv.classList.contains('selected');

    options.forEach(option => {
        const optionDiv = document.querySelector(`.${option.toLowerCase()}-option`);
        if (optionDiv) {
            optionDiv.classList.remove('selected');
        }
    });

    questionsAsked[questionsAsked.length - 1].chosenAnswers = [];

    if (!currentlySelected) {
        selectedOptionDiv.classList.add('selected');
        questionsAsked[questionsAsked.length - 1].chosenAnswers.push(value);
    } else {
        questionsAsked[questionsAsked.length - 1].chosenAnswers = [];
    }

    toggleNavigationButtons();
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
    showLoadingModal();
    const jsonData =[];

    for (let i = 0; i < questionsAsked.length; i++) {
        for (let j = 0; j < questionsAsked[i].chosenAnswers.length; j++) {
            jsonData.push({
                "evidencia": questionsAsked[i].questao, 
                "valor": questionsAsked[i].chosenAnswers[j] 
            });
        }
    }

    await axios.post('http://localhost:8070/execute', jsonData, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        question = response.data;
        afterQuestion(question);
    })
    .catch(error => {
        console.error(error);
        retryDiagnosis();
    })
    .finally(() => {
        hideLoadingModal();
    });
}

async function executeDroolsQuestion() {
    showLoadingModal();
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
        afterQuestion(question);
    })
    .catch(error => {
        console.error(error);
        retryDiagnosis();
    })
    .finally(() => {
        hideLoadingModal();
    });
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
    for (let i = 0; i < questionsAsked[questionsAsked.length-1].chosenAnswers.length; i++) {
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
        let diagnosis = [];
        if(response.data.questao) {
            diagnosis= response.data;
        }else{
            response.data.forEach(element => {
                const transformedData = {
                    diagnostico: {}
                };
                
                // Extract the name of the diagnostic
                const diagnosticoName = element.diagnostico;
                transformedData.diagnostico[diagnosticoName] = []; // Initialize the array for symptoms
                
                // Iterate over each symptom in the historical symptoms
                element.historicoSintomas.forEach(sintoma => {
                    transformedData.diagnostico[diagnosticoName].push({
                        evidencia: sintoma.evidencia,
                        valor: sintoma.valor,
                        regra: sintoma.regra  // Include the regra here
                    });
                });
                
                // Push the transformed data into the question array
                diagnosis.push(transformedData);
            });
        }
        afterQuestion(diagnosis);
    })
    .catch(error => {
    console.error(error);
    retryDiagnosis();
    });
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
        afterQuestion(question);
    })
    .catch(error => {
    console.error(error);
    retryDiagnosis();
    });
}

function questionHandler() {
    document.getElementById("next-btn").disabled = true;
    document.getElementById("next-btn").style.backgroundColor = "rgb(85, 85, 85)";

    if(isFirstQuestion){
        for (let i = 0; i < questionsAsked[questionsAsked.length - 1].chosenAnswers.length; i++) {
            if(questionsAsked[questionsAsked.length - 1].chosenAnswers[i] == "Luzes do painel") {
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
        if (!question.hasOwnProperty('historicoSintomas') && !question.hasOwnProperty('diagnostico') && !Array.isArray(question)) {
            loadQuestion(question);
        } else {
            generateDiagnosis(question);
            document.getElementById('retry-btn').style.display = 'inline-block';
        }
    } else {
        alert("Por favor, selecione pelo menos uma opção antes de continuar.");
    }
}

function generateDiagnosis(rawDiagnosis) {
    diagnosticsMap.clear(); // Limpa o mapa antes de preencher

    if(technology != "prolog"){
        rawDiagnosis.historicoSintomas.forEach((item, index) => {
            for (const [diagnostico, regras] of Object.entries(item)) {
                let questionAnswers = [];

                // Percorre cada regra dentro do diagnóstico
                regras.forEach((regraObj) => {
                    for (const [regra, evidenciaValor] of Object.entries(regraObj)) {
                        for (const [evidencia, valor] of Object.entries(evidenciaValor)) {
                            // Adiciona um objeto que inclui regra, evidência e valor
                            questionAnswers.push({
                                regra: regra,
                                evidencia: evidencia,
                                valor: valor
                            });
                        }
                    }
                });

                // Salva no mapa usando a estrutura nova
                let diagnosticData = {
                    diagnosticText: diagnostico,
                    questionAnswers: questionAnswers
                };

                diagnosticsMap.set(index, diagnosticData);
            }
        });
    }else{
        let index = 0; 

        if (Array.isArray(rawDiagnosis) && rawDiagnosis.length > 0) {
            for (const diagnosis of rawDiagnosis) {
                if (!diagnosis.diagnostico) {
                    throw new Error("Diagnosis object is missing 'diagnostico'");
                }
        
                for (const [diagnostico, respostas] of Object.entries(diagnosis.diagnostico)) {
                    let regrasMap = {}; 
        
                    respostas.forEach((respostaObj) => {
                        const { regra, valor } = respostaObj;
                        let evidencia = respostaObj.evidencia;
        
                        evidencia = evidencia.replace(/^\d+\|/, '').trim();
        
                        if (!regrasMap[regra]) {
                            regrasMap[regra] = []; 
                        }
                        regrasMap[regra].push({
                            evidencia: evidencia,
                            valor: valor
                        });
                    });
        
                    let questionAnswers = [];
                    for (const [regra, evidencias] of Object.entries(regrasMap)) {
                        evidencias.forEach(evidenceData => {
                            questionAnswers.push({
                                regra: regra,
                                ...evidenceData 
                            });
                        });
                    }
        
                    let diagnosticData = {
                        diagnosticText: diagnostico,
                        questionAnswers: questionAnswers
                    };
        
                    diagnosticsMap.set(index, diagnosticData);
                    index++; 
                }
            }
        } else {
            throw new Error("No diagnosis data available");
        }
    }

    // Exibe o primeiro diagnóstico
    showDiagnosis([0]);
    toggleResultNavigationButtons();
}

function showDiagnosis(diagnosticKeys) {
    document.getElementById('diagnostic-container').style.display = 'none';
    document.getElementById('diagnosis-container').style.display = 'block';
    document.getElementById('retry-btn').style.display = 'inline-block';
    displayDiagnosis(diagnosticKeys);
}

function displayDiagnosis(diagnosticKeys) {
    const responsesTable = document.getElementById('answered-questions');
    responsesTable.innerHTML = '';

    const diagnosticData = diagnosticsMap.get(diagnosticKeys[0]);
    const { diagnosticText, questionAnswers } = diagnosticData;

    questionAnswers.forEach((qa) => {
        let responseRow = document.createElement('tr');
        responseRow.innerHTML = `
            <td>${qa.regra}</td>
            <td>${qa.evidencia}</td>
            <td>${qa.valor}</td>`;
        responsesTable.appendChild(responseRow);
    });

    const { cleanedText, removedParts } = removePercentagePhrases(diagnosticData.diagnosticText);
    document.getElementById('diagnosis-text').textContent = cleanedText;
    document.getElementById('precision-text').textContent = "";
    if (removedParts.length !== 0) {
        document.getElementById('precision-text').textContent = "Precisão do Diagnóstico: " + removedParts;
    }

    toggleResultNavigationButtons();
}


function retryDiagnosis() {
    questionsAsked = [];
    diagnosticsMap = new Map();
    currentDiagnosisIndex = 0;
    isFirstQuestion = true;
    currentQuestionNumber = 0;
    document.getElementById('diagnostic-container').style.display = 'none';
    document.getElementById('diagnosis-container').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'flex';
    document.getElementById('welcome-screen').style.opacity = 1;
    document.getElementById('retry-btn').style.display = 'none';
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
    const titleFontSize = 16;
    const precisionFontSize = 10;
    const tableStartY = 30; // Fixed start position for the table on each page

    diagnosticsMap.forEach((diagnosticData, index) => {
        // Get cleaned diagnostic text and precision parts
        const { cleanedText, removedParts } = removePercentagePhrases(diagnosticData.diagnosticText);
        
        // Title and diagnostic text
        doc.setFontSize(titleFontSize);
        doc.text(`Diagnóstico: ${cleanedText}`, 10, 20);

        // Precision text, if any
        if (removedParts.length > 0) {
            const precisionText = `Precisão do Diagnóstico: ${removedParts.join(", ")}`;
            doc.setFontSize(precisionFontSize);
            doc.text(precisionText, 10, 27); // Slightly below title
        }

        // Prepare data for the table
        const tableData = diagnosticData.questionAnswers.map((qa) => [
            qa.regra,
            qa.evidencia,
            qa.valor
        ]);

        // Add the table
        doc.autoTable({
            head: [['Regra', 'Evidência', 'Valor']],
            body: tableData,
            startY: tableStartY, // Fixed starting Y position for tables
            styles: { fontSize: 10, cellPadding: 3 },
            theme: 'grid',
            headStyles: { fillColor: [243, 156, 18] }, // Header color for visibility
            alternateRowStyles: { fillColor: [245, 245, 245] } // Light gray for alternating rows
        });

        // Add a new page if more diagnostics are to follow
        if (index < diagnosticsMap.size - 1) {
            doc.addPage();
        }
    });

    // Save the PDF file
    doc.save('Diagnóstico.pdf');
}

function removePercentagePhrases(text) {
    // Use regex to match all text in parentheses containing a % sign
    const removedParts = text.match(/\(.*?%\)/g) || []; // Store matched parts
    const cleanedText = text.replace(/\s*\(.*?%\)\s*/g, ' ').trim(); // Clean the text
    return { cleanedText, removedParts }; // Return both the cleaned text and removed parts
}

function showLoadingModal() {
    document.getElementById('loading-modal').style.display = 'flex';
}

function hideLoadingModal() {
    document.getElementById('loading-modal').style.display = 'none';
}