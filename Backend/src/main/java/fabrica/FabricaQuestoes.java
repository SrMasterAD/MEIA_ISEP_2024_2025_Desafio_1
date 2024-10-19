package fabrica;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.kie.api.runtime.ClassObjectFilter;

import model.Diagnostico;
import model.Sintoma;
import API.DemoApplication;
import API.DTOs.DiagnosticoDTO;
import API.DTOs.PerguntaDTO;
import Engine.How;

public class FabricaQuestoes {

    public static PerguntaDTO questao;
    public static boolean novaQuestao=false;
    public static String resposta;
    public static boolean answered=false;
    public static DiagnosticoDTO diagnostico;

    public static boolean answer(String sintomaString, List<String> possiveisValores, String valor) throws InterruptedException {
        boolean evidenciaVerificada = false;
        List<Sintoma> sin = How.obterHistoricoSintomas();
        Collection<Sintoma> sintomas = (Collection<Sintoma>) DemoApplication.ksn.getObjects(new ClassObjectFilter(Sintoma.class));
        for (Sintoma s : sintomas) {
            if (s.getEvidencia().compareTo(sintomaString) == 0) {
                if(s.getValor().compareTo(valor) == 0){
                    How.adicionarSintomaHistorico(s);
                    return true;
                }
                evidenciaVerificada = true;
            }
        }
        if(evidenciaVerificada){
            return false;
        }
        questao = new PerguntaDTO(sintomaString, possiveisValores);
        novaQuestao = true;

        DemoApplication.lockPergunta.lock();
        try{
            DemoApplication.conditionPergunta.signal();
        } finally {
            DemoApplication.lockPergunta.unlock();
        }
        

        DemoApplication.lockResposta.lock();
        try{
            DemoApplication.conditionResposta.await();
        } finally {
            DemoApplication.lockResposta.unlock();
        }


        Sintoma s = new Sintoma(sintomaString, possiveisValores, resposta);
        DemoApplication.ksn.insert(s);

        if(resposta.compareTo(valor) == 0){
            How.adicionarSintomaHistorico(s);
            return true;
        } else {
            return false;
        }
    }

    public static void darDiagnostico() {
        DemoApplication.lockPergunta.lock();
        try{
            DemoApplication.conditionPergunta.signal();
        } finally {
            DemoApplication.lockPergunta.unlock();
        }
    }

}
