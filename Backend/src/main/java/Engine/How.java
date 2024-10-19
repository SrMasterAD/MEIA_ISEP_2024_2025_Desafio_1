package Engine;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import model.Diagnostico;
import model.Facto;
import model.Sintoma;

public class How {

    // HashMap to store explanations
    // Key: conclusion ID, Value: list of facts (symptoms) that led to the conclusion
    private Map<Diagnostico, List<Sintoma>> mapaJustificacoes;

    public How() {
        this.mapaJustificacoes = new HashMap<>();
    }

    // Method to add an explanation for a conclusion
    public void adicionarExplicacao(Diagnostico diagnostico, List<Sintoma> factos) {
        this.mapaJustificacoes.put(diagnostico, factos);
    }

    // Method to retrieve explanations
    public Map<Diagnostico, List<Sintoma>> getMapaJustificacoes() {
        return this.mapaJustificacoes;
    }

    // Method to print explanations for debugging or display purposes
    public void printExplanations() {
        for (Map.Entry<Diagnostico, List<Sintoma>> entry : mapaJustificacoes.entrySet()) {
            Diagnostico diagnostico = entry.getKey();
            List<Sintoma> sintomas = entry.getValue();

            System.out.println("Conclusion ID: " + diagnostico.obterId());
            System.out.println("Facts that led to this conclusion:");
            for (Object fact : sintomas) {
                System.out.println("- " + fact.toString());
            }
            System.out.println();
        }
    }
}