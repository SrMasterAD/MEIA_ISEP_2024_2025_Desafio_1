package API.DTOs;
import java.io.UnsupportedEncodingException;
import java.util.AbstractMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashSet;


import utils.StringUtils;
import model.Diagnostico;
import model.Sintoma;

public class DiagnosticoDTO {
    public Map<String, LinkedHashSet<AbstractMap.SimpleEntry<String, String>>> diagnostico;

    public DiagnosticoDTO(List<AbstractMap.SimpleEntry<Diagnostico, List<Sintoma>>> historicoSintomas) {
        Map<String, LinkedHashSet<AbstractMap.SimpleEntry<String, String>>> diagnosticos = new HashMap<>();

        for (AbstractMap.SimpleEntry<Diagnostico, List<Sintoma>> entry : historicoSintomas) {
            LinkedHashSet<AbstractMap.SimpleEntry<String, String>> sintomas = new LinkedHashSet<>();
            for (Sintoma sintoma : entry.getValue()) {
                sintomas.add(new AbstractMap.SimpleEntry<String, String>
                (StringUtils.removerIdentificador(sintoma.getEvidencia()) , sintoma.getValor()));
            }
            try {
                diagnosticos.put(new String(entry.getKey().obterDescricao().getBytes(),"UTF-8"),sintomas);
            } catch (UnsupportedEncodingException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

        this.diagnostico = diagnosticos;
    }
}
