package API.DTOs;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import utils.StringUtils;
import model.Diagnostico;
import model.Sintoma;

public class DiagnosticoDTO {
    public Map<String, List<AbstractMap.SimpleEntry<String, String>>> diagnostico;

    public DiagnosticoDTO(List<AbstractMap.SimpleEntry<Diagnostico, List<Sintoma>>> historicoSintomas) {
        Map<String, List<AbstractMap.SimpleEntry<String, String>>> diagnosticos = new HashMap<>();

        for (AbstractMap.SimpleEntry<Diagnostico, List<Sintoma>> entry : historicoSintomas) {
            List<AbstractMap.SimpleEntry<String, String>> sintomas = new ArrayList<>();
            for (Sintoma sintoma : entry.getValue()) {
                sintomas.add(new AbstractMap.SimpleEntry<String, String>
                (StringUtils.removerIdentificador(sintoma.getEvidencia()) , sintoma.getValor()));
            }
            diagnosticos.put(entry.getKey().obterDescricao(), sintomas);
        }

        this.diagnostico = diagnosticos;
    }

}
