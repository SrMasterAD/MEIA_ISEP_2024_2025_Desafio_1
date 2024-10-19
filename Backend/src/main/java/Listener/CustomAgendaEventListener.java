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
import model.*;
import Engine.How;

import java.util.ArrayList;
import java.util.List;

public class CustomAgendaEventListener implements AgendaEventListener {

    private KieSession ks;
    private List<Sintoma> listaFactosEsquerda = new ArrayList<Sintoma>();
    private List<Facto> listaFactosDireita = new ArrayList<Facto>();
    private How how;

    public CustomAgendaEventListener(KieSession ks, How how) {
        this.ks = ks;
        this.how = how;
    }

    @Override
    public void matchCreated(MatchCreatedEvent event) {
        // Not needed for this implementation
    }

    public void adicionarFactoEsquerda(Sintoma sintoma) {
        listaFactosEsquerda.add(sintoma);
    }

    public void limparFactosEsquerda() {
        listaFactosEsquerda = new ArrayList<Sintoma>();
    }

    public List<Sintoma> obterFactosEsquerda() {
        return listaFactosEsquerda;
    }

    public void adicionarFactoDireita(Facto facto) {
        listaFactosDireita = new ArrayList<Facto>();
    }

    public void limparFactosDireita() {
        listaFactosDireita.clear();
    }

    public List<Facto> obterFactosDireita() {
        return listaFactosDireita;
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
        // Not needed for this implementation
    }
}