package API.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import API.DemoApplication;
import API.DTOs.PerguntaDTO;
import fabrica.FabricaQuestoes;
import model.Sintoma;

@RestController
@CrossOrigin(origins = "http://localhost:3000") 
@RequestMapping("/api/drools")
public class Controller {

    @Autowired
    Controller() {
    }
    @PostMapping("/execute")
    public ResponseEntity<Object> executeDrools(@RequestBody List<Sintoma> resposta) throws InterruptedException {
        DemoApplication.executarMotor(resposta);
        DemoApplication.lockPergunta.lock();
        try{
            DemoApplication.conditionPergunta.await();
        } finally {
            DemoApplication.lockPergunta.unlock();
        }
        if(FabricaQuestoes.novaQuestao) {
            FabricaQuestoes.novaQuestao = false;
            return ResponseEntity.ok(new PerguntaDTO(FabricaQuestoes.questao.questao, FabricaQuestoes.questao.valores));
        } else {
            return ResponseEntity.ok(FabricaQuestoes.diagnostico);
        }
    }
    
    @CrossOrigin(origins = "http://localhost:3000") 
    @PostMapping("/nextStep")
    public ResponseEntity<Object> nextStep(@RequestParam String resposta) throws InterruptedException {
        FabricaQuestoes.resposta = resposta;
        DemoApplication.lockResposta.lock();
        try {
            DemoApplication.conditionResposta.signal();
        } finally {
            DemoApplication.lockResposta.unlock();
        }
        DemoApplication.lockPergunta.lock();
        try{
            DemoApplication.conditionPergunta.await();
        } finally {
            DemoApplication.lockPergunta.unlock();
        }
        if(FabricaQuestoes.novaQuestao) {
            FabricaQuestoes.novaQuestao = false;
            return ResponseEntity.ok(new PerguntaDTO(FabricaQuestoes.questao.questao, FabricaQuestoes.questao.valores));
        } else {
            return ResponseEntity.ok(FabricaQuestoes.diagnostico);
        }
    }
}
