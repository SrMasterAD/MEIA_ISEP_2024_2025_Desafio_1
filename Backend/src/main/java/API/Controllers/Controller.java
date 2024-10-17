package API.Controllers;

import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static java.lang.Thread.sleep;

import API.DTOs.RespostaDTO;
import API.DTOs.YourRequestModel;
import Engine.MotorDrools;
import fabrica.FabricaQuestoes;

@RestController
@RequestMapping("/api/drools")
public class Controller {

    @Autowired
    private KieContainer kieContainer;

    @PostMapping("/execute")
    public String executeDrools(@RequestBody YourRequestModel request) {
        KieSession kieSession = kieContainer.newKieSession();
        
        // Insert your request data into the session
        kieSession.insert(request);
        
        // Fire all rules
        kieSession.fireAllRules();
        
        // Dispose of the session
        kieSession.dispose();

        return "Rules executed successfully!";
    }

    @PostMapping("/nextStep")
    public ResponseEntity<RespostaDTO> nextStep(@RequestParam String resposta) throws InterruptedException {
        FabricaQuestoes.resposta = resposta;
        FabricaQuestoes.condition.signal();
        if(!FabricaQuestoes.answered) {
            sleep(500);
        }
        return ResponseEntity.ok(new RespostaDTO(FabricaQuestoes.questao.questao, FabricaQuestoes.questao.valores));
    }
}
