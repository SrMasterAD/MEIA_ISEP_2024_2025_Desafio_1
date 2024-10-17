package API.DTOs;
import java.util.List;

public class DiagnosticoDTO {
    public String diagnostico;
    public String regra;
    public List<String> sintomas;

    public DiagnosticoDTO(String diagnostico, String regra, List<String> sintoma) {
        this.diagnostico = diagnostico;
        this.regra = regra;
        this.sintomas = sintoma;
    }
}
