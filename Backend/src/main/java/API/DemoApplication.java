package API;

import Listener.CustomAgendaEventListener;
import model.*;
import org.kie.api.KieServices;
import org.kie.api.runtime.KieSession;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import Engine.MotorDrools;

import java.util.List;
import java.util.Map;

@SpringBootApplication
public class DemoApplication {

    public static KieSession ksn;
    public static CustomAgendaEventListener agendaEventListener;
    public static Map<Integer, Justificacao> mapaJustificacoes;
    public static KieServices ks;
    public static KieSession kSession;
    public static MotorDrools motor;

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    public static void inicializarMotor(){
        motor = new MotorDrools("ksession-rules");
    }

    public static void executarDiagnostico(List<Sintoma> sintomas){
        motor.executarDiagnostico(sintomas);
    }
}
