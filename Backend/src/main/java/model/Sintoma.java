package model;

import java.util.List;

public class Sintoma extends Facto{

    private String evidencia;
    private List<String> possiveisValores;
    private String valor;

    public Sintoma(String evidencia, List<String> possiveisValores, String valor) {
        this.evidencia = evidencia;
        this.possiveisValores = possiveisValores;
        this.valor = valor;
    }

    public String obterSintoma() {
        return evidencia;
    }

    public List<String> obterPossiveisValores() {
        return this.possiveisValores;
    }

    public String obterValor() {
        return valor;
    }

}


