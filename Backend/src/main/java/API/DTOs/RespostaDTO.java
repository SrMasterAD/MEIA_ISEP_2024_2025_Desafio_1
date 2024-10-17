package API.DTOs;

import java.util.List;

public class RespostaDTO {
    public String questao;
    public List<String> valores;

    public RespostaDTO(String questao, List<String> valores) {
        this.questao = questao;
        this.valores = valores;
    }
}

class DiagnosisDTO {
    public String diagnostico;
    public String regra;
    public List<String> sintomas;

    public DiagnosisDTO(String diagnostico, String regra, List<String> sintoma) {
        this.diagnostico = diagnostico;
        this.regra = regra;
        this.sintomas = sintoma;
    }
}
