package model;

public class Facto {
    static private int ultimoId = 0;
    private int id;

    public Facto() {
        Facto.ultimoId ++;
        this.id = ultimoId;
    }

    public int obterId() {
        return this.id;
    }

    public String toString() {
        return Integer.toString(id);
    }
}

