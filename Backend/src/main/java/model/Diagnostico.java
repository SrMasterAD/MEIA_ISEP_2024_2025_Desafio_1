package model;

public class Diagnostico extends Facto{

    private String descricao;

    public Diagnostico(String descricao) {
        this.descricao = descricao;
    }

    public String obterDescricao() {
        return descricao;
    }

}
