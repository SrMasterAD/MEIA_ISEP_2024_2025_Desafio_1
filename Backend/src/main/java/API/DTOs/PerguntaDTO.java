package API.DTOs;

import java.util.List;
import utils.*;
public class PerguntaDTO {
    public String questao;
    public List<String> valores;
    public boolean multiselect;

    public PerguntaDTO(String questao, List<String> valores, boolean multiselect) {
        this.questao = StringUtils.removerIdentificador(questao);
        this.valores = valores;
        this.multiselect = multiselect;
    }
}

