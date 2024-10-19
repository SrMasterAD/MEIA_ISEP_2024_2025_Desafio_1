package API.DTOs;

import java.util.List;

public class PerguntaDTO {
    public String questao;
    public List<String> valores;

    public PerguntaDTO(String questao, List<String> valores) {
        this.questao = questao;
        this.valores = valores;
    }
}

