package model;

import java.util.List;

public class Sintoma extends Facto{

    private String evidencia;
    private List<String> possiveisValores;
    private String valor;

    public Sintoma() {
    }
    
    public Sintoma(String evidencia, List<String> possiveisValores, String valor) {
        this.evidencia = evidencia;
        this.possiveisValores = possiveisValores;
        this.valor = valor;
    }

    public String getEvidencia() {
        return evidencia;
    }

    public List<String> getPossiveisValores() {
        return this.possiveisValores;
    }

    public String getValor() {
        return valor;
    }

}


