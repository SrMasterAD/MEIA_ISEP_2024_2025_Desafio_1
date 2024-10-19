package Engine;

import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.rule.Row;
import org.kie.api.runtime.rule.ViewChangedEventListener;

import model.*;
import API.DemoApplication;
import API.DTOs.*;

import java.util.List;

import Listener.CustomAgendaEventListener;
import fabrica.FabricaQuestoes;

public class MotorDrools extends Thread{
    private KieSession ksn;
    private CustomAgendaEventListener customAgendaEventListener;
    private List<Sintoma> sintomas;

    public MotorDrools(KieSession ksn, CustomAgendaEventListener customAgendaEventListener, List<Sintoma> sintomas) {
        this.customAgendaEventListener = customAgendaEventListener;
        this.ksn = ksn;
        this.sintomas = sintomas;
    }
    @Override
    public void run() {

        for (Sintoma sintoma : this.sintomas) {
            ksn.insert(sintoma);
        }

        ksn.addEventListener(customAgendaEventListener);

        ViewChangedEventListener listener = new ViewChangedEventListener() {

                @Override
                public void rowDeleted(Row row) {
                }

                @Override
                public void rowInserted(Row row) {
                    Diagnostico diagnostico = (Diagnostico) row.get("$diagnostico");
                    DemoApplication.how.adicionarExplicacao(diagnostico, customAgendaEventListener.obterFactosEsquerda());
                    customAgendaEventListener.limparFactosEsquerda();
                }

                @Override
                public void rowUpdated(Row row) {
                }

            };
            
            ksn.openLiveQuery("obterDiagnosticos", null, listener);

        ksn.fireAllRules();

        ksn.dispose();
        DiagnosticoDTO diagnosticoDTO = new DiagnosticoDTO(DemoApplication.how.getMapaJustificacoes());
        FabricaQuestoes.diagnostico = diagnosticoDTO;
        FabricaQuestoes.darDiagnostico();
    }
}