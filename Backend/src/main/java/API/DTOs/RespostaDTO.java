package API.DTOs;

import java.util.List;

public class RespostaDTO {
    public String evidencia;
    public List<String> possiveisValores;
    public String valor;

    public RespostaDTO(String evidencia, List<String> possiveisValores, String valor) {
        this.evidencia = evidencia;
        this.possiveisValores = possiveisValores;
        this.valor = valor;
    }
}