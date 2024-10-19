package Engine;

import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.rule.Row;
import org.kie.api.runtime.rule.ViewChangedEventListener;

import model.*;
import API.DTOs.*;

import java.util.List;

import fabrica.FabricaQuestoes;

public class MotorDrools extends Thread{
    private KieSession ksn;
    private List<Sintoma> sintomas;

    public MotorDrools(KieSession ksn, List<Sintoma> sintomas) {
        this.ksn = ksn;
        this.sintomas = sintomas;
    }
    @Override
    public void run() {

        for (Sintoma sintoma : this.sintomas) {
            ksn.insert(sintoma);
        }

        ViewChangedEventListener listener = new ViewChangedEventListener() {

                @Override
                public void rowDeleted(Row row) {
                }

                @Override
                public void rowInserted(Row row) {
                    Diagnostico diagnostico = (Diagnostico) row.get("$diagnostico");
                    How.adicionarExplicacao(diagnostico);
                }

                @Override
                public void rowUpdated(Row row) {
                }

            };
            
            ksn.openLiveQuery("obterDiagnosticos", null, listener);

        ksn.fireAllRules();

        ksn.dispose();
        DiagnosticoDTO diagnosticoDTO = new DiagnosticoDTO(How.getMapaJustificacoes());
        FabricaQuestoes.diagnostico = diagnosticoDTO;
        FabricaQuestoes.darDiagnostico();
    }
}