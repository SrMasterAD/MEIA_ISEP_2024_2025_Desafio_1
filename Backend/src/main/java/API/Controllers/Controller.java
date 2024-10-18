package API.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static java.lang.Thread.sleep;

import java.util.List;

import API.DemoApplication;
import API.DTOs.PerguntaDTO;
import fabrica.FabricaQuestoes;
import model.Sintoma;

@RestController
@RequestMapping("/api/drools")
public class Controller {

    @Autowired
    Controller() {
    }
    @PostMapping("/execute")
    public String executeDrools(@RequestBody List<Sintoma> resposta) {
        DemoApplication.inicializarMotor();
        DemoApplication.executarDiagnostico(resposta);
        
        return "Rules executed successfully!";
    }

    @PostMapping("/nextStep")
    public ResponseEntity<PerguntaDTO> nextStep(@RequestParam String resposta) throws InterruptedException {
        FabricaQuestoes.resposta = resposta;
        FabricaQuestoes.condition.signal();
        if(!FabricaQuestoes.answered) {
            sleep(500);
        }
        return ResponseEntity.ok(new PerguntaDTO(FabricaQuestoes.questao.questao, FabricaQuestoes.questao.valores));
    }
}
