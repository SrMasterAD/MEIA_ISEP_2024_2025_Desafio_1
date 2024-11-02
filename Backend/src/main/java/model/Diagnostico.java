package model;

import java.io.UnsupportedEncodingException;

public class Diagnostico extends Facto{

    private String descricao;

    public Diagnostico(String descricao) {
        this.descricao = descricao;
    }

    public String obterDescricao() {
        return descricao;
    }

    public void formatarEncodingUTF8() {
        try {
            descricao = new String(descricao.getBytes(), "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }
    
    @Override
    public String toString() {
        return descricao;
    }

}
