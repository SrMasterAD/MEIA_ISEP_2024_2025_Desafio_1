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
