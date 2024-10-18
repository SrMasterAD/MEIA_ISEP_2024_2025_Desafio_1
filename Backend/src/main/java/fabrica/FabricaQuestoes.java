package fabrica;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.kie.api.runtime.ClassObjectFilter;

import model.Sintoma;
import API.DemoApplication;
import API.DTOs.PerguntaDTO;

public class FabricaQuestoes {

    public static PerguntaDTO questao;
    public static boolean novaQuestao=false;
    public static String resposta;
    public static boolean answered=false;

    public static boolean answer(String sintomaString, List<String> possiveisValores, String valor) throws InterruptedException {
        Collection<Sintoma> sintomas = (Collection<Sintoma>) DemoApplication.ksn.getObjects(new ClassObjectFilter(Sintoma.class));
        for (Sintoma s : sintomas) {
            if (s.getEvidencia().compareTo(sintomaString) == 0) {
                if (s.getValor().equals(valor)) {
                    DemoApplication.agendaEventListener.adicionarFactoEsquerda(s);
                    return true;
                } else {
                    DemoApplication.agendaEventListener.limparFactosEsquerda();
                    return false;
                }
            }
        }
        questao = new PerguntaDTO(sintomaString, possiveisValores);
        novaQuestao = true; // FIXME: wait controller

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
            DemoApplication.agendaEventListener.adicionarFactoEsquerda(s);
            return true;
        } else {
            DemoApplication.agendaEventListener.limparFactosEsquerda();
            return false;
        }
    }

}
