package model;

import java.util.ArrayList;
import java.util.List;

public class Justificacao {
    private String regra;
    private List<Facto> listaSintomas;
    private Facto diagnostico;

    public Justificacao(String regra, List<Facto> listaSintoma, Facto diagnostico) {
        this.regra = regra;
        this.listaSintomas = new ArrayList<Facto>(listaSintoma);
        this.diagnostico = diagnostico;
    }

    public String obterRegra() {
        return this.regra;
    }

    public List<Facto> obterListaSintomas() {
        return this.listaSintomas;
    }

    public Facto obterDiagnostico() {
        return this.diagnostico;
    }
}