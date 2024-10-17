package model;

public class Sintoma extends Facto{

    private String evidencia;
    private String valor;

    public Sintoma(String evidencia, String valor) {
        this.evidencia = evidencia;
        this.valor = valor;
    }

    public String obterEvidencia() {
        return evidencia;
    }

    public String obterValor() {
        return valor;
    }

}


