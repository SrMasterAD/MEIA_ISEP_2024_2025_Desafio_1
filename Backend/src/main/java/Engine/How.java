package Engine;

import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;

import model.Diagnostico;
import model.Sintoma;

public class How {

    private static List<Sintoma> historicoSintomasAtual = new ArrayList<Sintoma>();
    private static List<AbstractMap.SimpleEntry<Diagnostico, List<Sintoma>>> historicoSintomasGeral 
    = new ArrayList<AbstractMap.SimpleEntry<Diagnostico, List<Sintoma>>>();

    public static void adicionarExplicacao(Diagnostico diagnostico) {
        historicoSintomasGeral.add(new AbstractMap.SimpleEntry<Diagnostico,
         List<Sintoma>>(diagnostico, historicoSintomasAtual));
        eliminarHistoricoSintomasAtual();
    }

    public static  List<AbstractMap.SimpleEntry<Diagnostico, List<Sintoma>>> obterHistoricoSintomasGeral() {
        return historicoSintomasGeral;
    }

    public static void eliminarHistoricoSintomasGeral() {
        historicoSintomasGeral = new ArrayList<AbstractMap.SimpleEntry<Diagnostico, List<Sintoma>>>();
    }

    public static void adicionarSintomaHistorico(Sintoma sintoma) {
        if(historicoSintomasGeral.isEmpty()) {
            historicoSintomasAtual.add(sintoma);
            return;
        }

        List<Sintoma> temporario = new ArrayList<Sintoma>();

        if(historicoSintomasAtual.isEmpty()) {
            List<Sintoma> listaSintomasAnterior = 
            historicoSintomasGeral.get(historicoSintomasGeral.size()-1).getValue();

            for(Sintoma s : listaSintomasAnterior) {
                if(s.getEvidencia().equals(sintoma.getEvidencia())) {
                    temporario.add(sintoma);
                    historicoSintomasAtual = new ArrayList<Sintoma>(temporario);
                    return;
                } else {
                    temporario.add(s);
                }
            }
            historicoSintomasAtual = new ArrayList<Sintoma>();
            historicoSintomasAtual.add(sintoma);
            return;
        }

        historicoSintomasAtual.add(sintoma);
    }

    public static void eliminarHistoricoSintomasAtual() {
        historicoSintomasAtual = new ArrayList<Sintoma>();
    }

    public static List<Sintoma> obterHistoricoSintomasAtual() {
        return historicoSintomasAtual;
    }
}