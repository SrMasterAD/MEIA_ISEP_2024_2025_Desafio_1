package Engine;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class How {

    // HashMap to store explanations
    // Key: conclusion ID, Value: list of facts (symptoms) that led to the conclusion
    private Map<Integer, List<Object>> mapaJustificacoes;

    public How() {
        this.mapaJustificacoes = new HashMap<>();
    }

    // Method to add an explanation for a conclusion
    public void addExplanation(int conclusionId, List<Object> facts) {
        this.mapaJustificacoes.put(conclusionId, facts);
    }

    // Method to retrieve explanations
    public Map<Integer, List<Object>> getMapaJustificacoes() {
        return this.mapaJustificacoes;
    }

    // Method to print explanations for debugging or display purposes
    public void printExplanations() {
        for (Map.Entry<Integer, List<Object>> entry : mapaJustificacoes.entrySet()) {
            int conclusionId = entry.getKey();
            List<Object> facts = entry.getValue();

            System.out.println("Conclusion ID: " + conclusionId);
            System.out.println("Facts that led to this conclusion:");
            for (Object fact : facts) {
                System.out.println("- " + fact.toString());
            }
            System.out.println();
        }
    }
}