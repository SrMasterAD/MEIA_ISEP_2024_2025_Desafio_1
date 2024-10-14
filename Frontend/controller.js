function startDiagnosis() {
    document.getElementById('welcome-screen').style.opacity = 0;
    setTimeout(() => {
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('diagnostic-container').style.display = 'flex';
    }, 500);
}

function toggleSelection(element) {
    element.classList.toggle('selected');
}

function confirmSelection() {
    const selectedOptions = document.querySelectorAll('.option.selected');
    const diagnosisText = document.getElementById('diagnosis-text');
    const diagnosisContainer = document.getElementById('diagnosis-container');

    if (selectedOptions.length > 0) {
        let selectedSymptoms = [];
        selectedOptions.forEach(option => {
            selectedSymptoms.push(option.querySelector('label').textContent);
        });

        let diagnosis = "Com base nos sintomas selecionados: " + selectedSymptoms.join(', ') + ", é recomendável verificar os seguintes itens:\n\n";
        diagnosis += "- Verifique a qualidade do óleo do motor.\n";
        diagnosis += "- Inspecione os freios e as pastilhas.\n";
        diagnosis += "- Calibre os pneus.\n";
        diagnosis += "- Considere uma revisão geral.";

        diagnosisText.textContent = diagnosis;
        diagnosisContainer.style.display = 'block';
        document.getElementById('diagnostic-container').style.display = 'none'; 
    } else {
        alert('Por favor, selecione pelo menos uma opção.');
    }
}
function restartDiagnosis() {

    document.getElementById('diagnosis-container').style.display = 'none';


    document.getElementById('diagnostic-container').style.display = 'flex';

    const selectedOptions = document.querySelectorAll('.option.selected');
    selectedOptions.forEach(option => {
        option.classList.remove('selected');
    });

    document.getElementById('diagnosis-text').textContent = 'Aguardando confirmação...';
}

window.onload = () => {
    document.getElementById('diagnostic-container').style.display = 'none';
    document.getElementById('welcome-screen').style.opacity = 1;
};