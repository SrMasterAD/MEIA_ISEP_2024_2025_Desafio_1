package utils;

public class StringUtils {
    public static String removerIdentificador(String questao) {
        if (questao.contains("|")) {
            return questao.substring(questao.indexOf("|") + 1);
        }
        return questao;
    }
}
