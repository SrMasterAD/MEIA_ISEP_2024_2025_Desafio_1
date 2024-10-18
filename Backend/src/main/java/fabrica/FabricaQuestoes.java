package fabrica;

import java.util.Collection;
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
    private static final Lock lock = new ReentrantLock();
    public static final Condition condition = lock.newCondition();

    public static boolean answer(String sintomaString, String valor) throws InterruptedException {
        Collection<Sintoma> sintomas = (Collection<Sintoma>) DemoApplication.ksn.getObjects(new ClassObjectFilter(Sintoma.class));
        boolean questaoEncontrada = false;
        Sintoma sintoma = null;
        for (Sintoma s: sintomas) {
            if (s.getSintoma().compareTo(sintomaString) == 0) {
                questaoEncontrada = true;
                sintoma = s;
                break;
            }
        }
        if (questaoEncontrada) {
            if (sintoma.getSintoma().compareTo(valor) == 0) {
                DemoApplication.agendaEventListener.adicionarFactoEsquerda(sintoma);
                return true;
            } else {
                DemoApplication.agendaEventListener.limparFactosEsquerda();
                return false;
            }
        }
        questao = new PerguntaDTO(sintomaString, sintoma.getPossiveisValores());
        novaQuestao = true; // FIXME: wait controller
        lock.lock();
        condition.await();

        Sintoma s = new Sintoma(sintomaString, sintoma.getPossiveisValores(), resposta);
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
