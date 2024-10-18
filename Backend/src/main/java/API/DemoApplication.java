package API;

import Listener.CustomAgendaEventListener;
import model.*;
import org.kie.api.KieServices;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import Engine.How;
import Engine.MotorDrools;

import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;


@SpringBootApplication
public class DemoApplication {

    public static KieSession ksn;
    public static How how = new How();
    public static CustomAgendaEventListener agendaEventListener = new CustomAgendaEventListener(ksn, how);
    public static KieServices ks;
    public static KieSession kSession;
    public static MotorDrools motor;
    public static final Lock lockPergunta = new ReentrantLock();
    public static final Condition conditionPergunta = lockPergunta.newCondition();
    public static final Lock lockResposta = new ReentrantLock();
    public static final Condition conditionResposta = lockResposta.newCondition();

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    public static void executarMotor(List<Sintoma> sintomas) {
        KieServices ks = KieServices.Factory.get();
        KieContainer kc = ks.getKieClasspathContainer();
        ksn = kc.newKieSession("ksession-rules");
        motor = new MotorDrools(ksn, agendaEventListener, sintomas);
        motor.start();
    }
}
