package Engine;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import model.Diagnostico;
import model.Sintoma;

public class How {

    private static List<Sintoma> historicoSintomas = new ArrayList<Sintoma>();
    private static Map<Diagnostico, List<Sintoma>> mapaJustificacoes = new HashMap<>();

    // Method to add an explanation for a conclusion
    public static void adicionarExplicacao(Diagnostico diagnostico) {
        mapaJustificacoes.put(diagnostico, historicoSintomas);
        eliminarHistoricoSintomas();
    }

    // Method to retrieve explanations
    public static Map<Diagnostico, List<Sintoma>> getMapaJustificacoes() {
        return mapaJustificacoes;
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

    public static void adicionarSintomaHistorico(Sintoma sintoma) {
        historicoSintomas.add(sintoma);
    }

    public static void eliminarHistoricoSintomas() {
        historicoSintomas = new ArrayList<Sintoma>();
    }

    public static List<Sintoma> obterHistoricoSintomas() {
        return historicoSintomas;
    }
}