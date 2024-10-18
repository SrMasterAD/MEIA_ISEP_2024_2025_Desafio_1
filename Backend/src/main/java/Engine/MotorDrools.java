package Engine;

import org.kie.api.KieServices;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.rule.AgendaFilter;
import model.*;
import API.DTOs.*;
import java.util.ArrayList;
import java.util.List;

import Listener.CustomAgendaEventListener;

public class MotorDrools {
    private KieSession ksn;
    private List<DiagnosticoDTO> diagnosticos;
    private CustomAgendaEventListener customAgendaEventListener;

    public MotorDrools(KieSession ksn, CustomAgendaEventListener customAgendaEventListener) {
        this.customAgendaEventListener = customAgendaEventListener;
        this.ksn = ksn;
        this.diagnosticos = new ArrayList<>();
    }

    public List<DiagnosticoDTO> executarDiagnostico(List<Sintoma> sintomas) {

        for (Sintoma sintoma : sintomas) {
            ksn.insert(sintoma);
        }

        ksn.addEventListener(customAgendaEventListener);

        ksn.fireAllRules(new AgendaFilter() {
            @Override
            public boolean accept(org.kie.api.runtime.rule.Match match) {
                return true;
            }
        });

        ksn.dispose();

        return diagnosticos;
    }


}