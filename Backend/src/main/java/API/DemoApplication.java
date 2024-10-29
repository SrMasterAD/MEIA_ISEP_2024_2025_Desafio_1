package API;

import model.*;
import org.kie.api.KieServices;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import Engine.How;
import Engine.MotorDrools;

import java.util.List;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;


@SpringBootApplication
public class DemoApplication {

    public static KieSession ksn;
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
        How.eliminarHistoricoSintomasGeral();
        How.eliminarHistoricoSintomasAtual();
        KieServices ks = KieServices.Factory.get();
        KieContainer kc = ks.getKieClasspathContainer();
        ksn = kc.newKieSession("ksession-rules");
        motor = new MotorDrools(ksn, sintomas);
        motor.start();
    }
    @Configuration
    public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/drools/execute") 
            .allowedOrigins("http://localhost:3000") 
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") 
            .allowedHeaders("*")
            .allowCredentials(true); 
    }
}
}
