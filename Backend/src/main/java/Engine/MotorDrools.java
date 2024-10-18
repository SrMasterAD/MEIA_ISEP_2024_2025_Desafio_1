package Engine;

import org.drools.core.facttemplates.Fact;
import org.kie.api.KieServices;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.rule.AgendaFilter;
import org.springframework.context.annotation.Bean;
import org.kie.api.event.rule.AfterMatchFiredEvent;
import org.kie.api.event.rule.AgendaEventListener;
import org.kie.api.event.rule.AgendaGroupPoppedEvent;
import org.kie.api.event.rule.AgendaGroupPushedEvent;
import org.kie.api.event.rule.BeforeMatchFiredEvent;
import org.kie.api.event.rule.MatchCancelledEvent;
import org.kie.api.event.rule.MatchCreatedEvent;
import org.kie.api.event.rule.RuleFlowGroupActivatedEvent;
import org.kie.api.event.rule.RuleFlowGroupDeactivatedEvent;
import org.kie.api.definition.rule.Rule;
import model.*;
import API.DTOs.*;
import java.util.ArrayList;
import java.util.List;

import Listener.CustomAgendaEventListener;

public class MotorDrools {
    private KieSession ksn;
    private List<DiagnosticoDTO> diagnosticos;

    public MotorDrools(String stringKs) {
        KieServices ks = KieServices.Factory.get();
        KieContainer kc = ks.getKieClasspathContainer();
        this.ksn = kc.newKieSession(stringKs);
        this.diagnosticos = new ArrayList<>();
    }

    public List<DiagnosticoDTO> executarDiagnostico(List<Sintoma> sintomas) {

        for (Sintoma sintoma : sintomas) {
            ksn.insert(sintoma);
        }

        ksn.addEventListener(new CustomAgendaEventListener());

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