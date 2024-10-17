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

