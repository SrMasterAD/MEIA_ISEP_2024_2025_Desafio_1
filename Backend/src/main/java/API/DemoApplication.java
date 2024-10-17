package API;

import Listener.CustomAgendaEventListener;
import model.*;
import org.kie.api.KieServices;
import org.kie.api.runtime.KieSession;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Map;

@SpringBootApplication
public class DemoApplication {

    public static KieSession KS;
    public static CustomAgendaEventListener agendaEventListener;
    public static Map<Integer, Justificacao> mapaJustificacoes;
    public static KieServices ks;
    public static KieSession kSession;

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
