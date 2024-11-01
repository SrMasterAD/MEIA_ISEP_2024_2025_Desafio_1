package Engine;

import java.util.AbstractMap;
import java.util.AbstractMap.SimpleEntry;
import java.util.ArrayList;
import java.util.List;

import model.Diagnostico;
import model.Sintoma;

public class How {

    private static  List<AbstractMap.SimpleEntry<String,Sintoma>> historicoSintomasAtual = new ArrayList<>();
    private static  List<AbstractMap.SimpleEntry<Diagnostico, List<AbstractMap.SimpleEntry<String,Sintoma>>>> historicoSintomasGeral 
    = new ArrayList<>();

    public static void adicionarExplicacao(Diagnostico diagnostico) {
        historicoSintomasGeral.add(new AbstractMap.SimpleEntry<Diagnostico, List<AbstractMap.SimpleEntry<String,Sintoma>>>(diagnostico, historicoSintomasAtual));
        eliminarHistoricoSintomasAtual();
    }

    public static  List<SimpleEntry<Diagnostico, List<SimpleEntry<String, Sintoma>>>> obterHistoricoSintomasGeral() {
        return historicoSintomasGeral;
    }

    public static void eliminarHistoricoSintomasGeral() {
        historicoSintomasGeral = new ArrayList<>();
    }

    public static void adicionarSintomaHistorico(Sintoma sintoma, String regraString) {
        if(historicoSintomasGeral.isEmpty()) {
            AbstractMap.SimpleEntry<String,Sintoma> regraSintoma = new AbstractMap.SimpleEntry<String,Sintoma>(regraString, sintoma);
            historicoSintomasAtual.add(regraSintoma);
            return;
        }

        List<SimpleEntry<String, Sintoma>> temporario = new ArrayList<>();

        if(historicoSintomasAtual.isEmpty()) {
            List<SimpleEntry<String, Sintoma>> listaSintomasAnterior = 
            historicoSintomasGeral.get(historicoSintomasGeral.size()-1).getValue();

            for(SimpleEntry<String, Sintoma> s : listaSintomasAnterior) {
                if(s.getValue().getEvidencia().equals(sintoma.getEvidencia())) {
                    temporario.add(s);
                    historicoSintomasAtual = new ArrayList<>(temporario);
                    return;
                } else {
                    temporario.add(s);
                }
            }
            historicoSintomasAtual = new ArrayList<>();
            historicoSintomasAtual.add(new AbstractMap.SimpleEntry<String,Sintoma>(regraString, sintoma));
            return;
        }

        historicoSintomasAtual.add(new AbstractMap.SimpleEntry<String,Sintoma>(regraString, sintoma));
    }

    public static void eliminarHistoricoSintomasAtual() {
        historicoSintomasAtual = new ArrayList<>();
    }

    public static List<SimpleEntry<String,Sintoma>> obterHistoricoSintomasAtual() {
        return historicoSintomasAtual;
    }
}