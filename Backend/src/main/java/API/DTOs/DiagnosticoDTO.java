package API.DTOs;

import java.util.AbstractMap.SimpleEntry;
import java.util.LinkedHashSet;
import java.util.List;

import utils.StringUtils;
import model.Diagnostico;
import model.Sintoma;

public class DiagnosticoDTO {
    public LinkedHashSet<SimpleEntry<String, LinkedHashSet<SimpleEntry<String,SimpleEntry<String,String>>>>> historicoSintomas = new LinkedHashSet<>();

    public DiagnosticoDTO(List<SimpleEntry<Diagnostico, List<SimpleEntry<String, Sintoma>>>> historicoSintomas) {
        for(SimpleEntry<Diagnostico, List<SimpleEntry<String, Sintoma>>> diagnostico : historicoSintomas) {
            LinkedHashSet<SimpleEntry<String,SimpleEntry<String,String>>> sintomas = new LinkedHashSet<>();
            for(SimpleEntry<String,Sintoma> sintoma : diagnostico.getValue()) {
                SimpleEntry<String,String> parEvidenciaValor = new SimpleEntry<String,String>(StringUtils.removerIdentificador(sintoma.getValue().getEvidencia()), sintoma.getValue().getValor());
                SimpleEntry<String,SimpleEntry<String,String>> parRegraSintoma = new SimpleEntry<String,SimpleEntry<String,String>>("Regra: "+sintoma.getKey(), parEvidenciaValor);
                sintomas.add(parRegraSintoma);
            }
            this.historicoSintomas.add(new SimpleEntry<String, LinkedHashSet<SimpleEntry<String,SimpleEntry<String,String>>>>(diagnostico.getKey().toString(), sintomas));
        }
    }
}
