package Listener;

import org.kie.api.runtime.KieSession;
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
import API.DemoApplication;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

public class CustomAgendaEventListener implements AgendaEventListener {

    private KieSession ks;
    private List<Facto> listaFactosEsquerda = new ArrayList<Facto>();
    private List<Facto> listaFactosDireita = new ArrayList<Facto>();

    public CustomAgendaEventListener(KieSession ks) {
        this.ks = ks;
    }

    @Override
    public void matchCreated(MatchCreatedEvent event) {
        /* 
        // Check if all required facts are present
        if (event.getMatch().getRule().getName().equals("Sintoma ausente")) {
            // A required fact is missing, try to insert it
            Sintoma novoSintoma = sintomaSupplier.get();
            if (novoSintoma != null) {
                ks.insert(novoSintoma);
                ks.fireAllRules();
            }
        }
        */
    }

    public void adicionarFactoEsquerda(Facto facto) {
        listaFactosDireita.add(facto);
    }

    public void limparFactosEsquerda() {
        listaFactosEsquerda.clear();
    }
    @Override
    public void matchCancelled(MatchCancelledEvent event) {
        // Not needed for this implementation
    }

    @Override
    public void beforeMatchFired(BeforeMatchFiredEvent event) {
        // Not needed for this implementation
    }

    @Override
    public void agendaGroupPopped(AgendaGroupPoppedEvent event) {
        // Not needed for this implementation
    }

    @Override
    public void agendaGroupPushed(AgendaGroupPushedEvent event) {
        // Not needed for this implementation
    }

    @Override
    public void beforeRuleFlowGroupActivated(RuleFlowGroupActivatedEvent event) {
        // Not needed for this implementation
    }

    @Override
    public void afterRuleFlowGroupActivated(RuleFlowGroupActivatedEvent event) {
        // Not needed for this implementation
    }

    @Override
    public void beforeRuleFlowGroupDeactivated(RuleFlowGroupDeactivatedEvent event) {
        // Not needed for this implementation
    }

    @Override
    public void afterRuleFlowGroupDeactivated(RuleFlowGroupDeactivatedEvent event) {
        // Not needed for this implementation
    }

    @Override
    public void afterMatchFired(AfterMatchFiredEvent evento) {

        Rule rule = evento.getMatch().getRule();
        String ruleName = rule.getName();
        List <Object> list = evento.getMatch().getObjects();
        for (Object e : list) {
            if (e instanceof Facto) {
                listaFactosEsquerda.add((Facto)e);
            }
        }

        for (Facto facto: listaFactosDireita) {
            Justificacao j = new Justificacao(ruleName, listaFactosEsquerda, facto);
            int id = facto.obterId();
            DemoApplication.mapaJustificacoes.put(id, j);
        }

        }
}