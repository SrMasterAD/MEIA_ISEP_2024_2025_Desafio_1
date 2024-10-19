package API.DTOs;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import model.Diagnostico;
import model.Sintoma;

public class DiagnosticoDTO {
    public Map<String, List<AbstractMap.SimpleEntry<String, String>>> diagnostico;

    public DiagnosticoDTO(Map<Diagnostico, List<Sintoma>> map) {
        Map<String, List<AbstractMap.SimpleEntry<String, String>>> diagnosticos = new HashMap<>();
        // obter todas as keys de todo o mapa
        for (Diagnostico key : map.keySet()) {
            // obter todos os valores de cada key
            List<Sintoma> value = map.get(key);
            // criar um novo DiagnosticoDTO
            List<AbstractMap.SimpleEntry<String, String>> entry = new ArrayList<>();
            for (Sintoma sintoma : value) {
                entry.add(new AbstractMap.SimpleEntry<String, String>(sintoma.getEvidencia(), sintoma.getValor()));
            }
            diagnosticos.put(key.obterDescricao(), entry);
        }
        this.diagnostico = diagnosticos;
    }

}
