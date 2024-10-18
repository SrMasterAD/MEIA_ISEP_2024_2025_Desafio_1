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

public class MotorDrools extends Thread{
    private KieSession ksn;
    private List<DiagnosticoDTO> diagnosticos;
    private CustomAgendaEventListener customAgendaEventListener;
    private List<Sintoma> sintomas;

    public MotorDrools(KieSession ksn, CustomAgendaEventListener customAgendaEventListener, List<Sintoma> sintomas) {
        this.customAgendaEventListener = customAgendaEventListener;
        this.ksn = ksn;
        this.diagnosticos = new ArrayList<>();
        this.sintomas = sintomas;
    }
    @Override
    public void run() {

        for (Sintoma sintoma : this.sintomas) {
            ksn.insert(sintoma);
        }

        ksn.addEventListener(customAgendaEventListener);

        ksn.fireAllRules();

        ksn.dispose();
    }
}