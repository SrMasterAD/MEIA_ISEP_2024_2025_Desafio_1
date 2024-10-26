package fabrica;

import java.util.Collection;
import java.io.UnsupportedEncodingException;
import java.util.List;

import org.kie.api.runtime.ClassObjectFilter;

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

    public static boolean answer(String sintomaString, List<String> possiveisValores, String valor, boolean multiselect) throws InterruptedException {

        try {
            String sintomaStrUTF8 = new String(sintomaString.getBytes(), "UTF-8");
            String valorUTF8 = new String(valor.getBytes(), "UTF-8");
            // map all values of possiveisValores to utf8 strings and store in a new list
            List<String> possiveisValoresUTF8 = possiveisValores.stream().map(s -> {
                try {
                    return new String(s.getBytes(), "UTF-8");
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                    return s;
                }
            }).toList();

            boolean evidenciaVerificada = false;
            Collection<Sintoma> sintomas = (Collection<Sintoma>) DemoApplication.ksn.getObjects(new ClassObjectFilter(Sintoma.class));
            for (Sintoma s : sintomas) {
                if (s.getEvidencia().compareTo(sintomaStrUTF8) == 0) {
                    if(s.getValor().compareTo(valorUTF8) == 0){
                        How.adicionarSintomaHistorico(s);
                        return true;
                    }
                    evidenciaVerificada = true;
                }
            }
            if(evidenciaVerificada){
                return false;
            }
            questao = new PerguntaDTO(sintomaStrUTF8, possiveisValoresUTF8, multiselect);
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

            String resposta = FabricaQuestoes.resposta;
            String[] respostas = resposta.split(",");
            boolean respostaValida = false;
            for (String r : respostas) {
                Sintoma s = new Sintoma(sintomaStrUTF8, possiveisValoresUTF8, r);
                DemoApplication.ksn.insert(s);
                if(r.compareTo(valorUTF8) == 0) {
                    How.adicionarSintomaHistorico(s);
                    respostaValida = true;
                }
            }
            return respostaValida;
        } catch (Exception e) {
            e.printStackTrace();
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
