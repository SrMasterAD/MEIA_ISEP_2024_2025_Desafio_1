
:-op(220,xfx,entao).
:-op(35,xfy,se).
:-op(240,fx,regra).
:-op(500,fy,nao).
:-op(600,xfy,e).


regra 1 se [sintoma(_, 'Qual destes sintomas o automóvel apresenta?', ['1','2','3'], '1')] entao [].

regra 2 se [sintoma(_, 'Qual destes sintomas o automóvel apresenta?', ['1','2','3'], '1')
        e   sintoma(_, 'O automóvel tem consumido mais combustível do que o habitual?', ['Sim', 'Nao'], 'Sim')]
        entao [diagnostico(4, 'teste diagonostico 1', [])].

regra 3 se [sintoma(_, 'O automóvel tem consumido mais combustível do que o habitual?', ['Sim', 'Nao'], 'Sim') 
        e   sintoma(_, 'O automóvel tem uma perda de potência acentuada?', ['Sim', 'Nao'], 'Nao')]
        entao [diagnostico(_, 'teste diagonostico 2', [])].

regra 4 se [sintoma(_, 'pergunta?', ['1', '2', '3'], '1')] entao [].

regra 5 se [sintoma(_, 'pergunta?', ['1', '2', '3'], '1')
        e   sintoma(_, 'Qual destes sintomas o automóvel apresenta?', ['1','2','3'], '1')
        e   sintoma(_, 'Qual destes sintomas o automóvel apresenta?', ['1','2','3'], '2')]
        entao [ignorar(1)].

regra 6 se [\+ ignorar(1)
        e   sintoma(_, 'pergunta?', ['1', '2', '3'], '1')
        e   sintoma(_, 'Qual destes sintomas o automóvel apresenta?', ['1','2','3'], '1')]
        entao [].

:- dynamic sintoma/4, diagnostico/3.

sintoma(_, 'Qual destes sintomas o automóvel apresenta?', ['1'], '1').

processa_regras :-
    findall((ID, LHS, RHS), (regra ID se LHS entao RHS), Regras),

    aplica_regras(Regras, []).

aplica_regras([(ID, LHS, RHS) | Regras]) :-
    condicao_compativel(LHS),
    concluir_diagnostico(ID, RHS),
    aplica_regras(Regras).

aplica_regras([], _).

condicao_compativel([A e B | C]) :-
    verifica_sintoma(A),
    condicao_compativel([B | C]).

condicao_compativel([A e B]) :-
    verifica_sintoma(A),
    condicao_compativel([B]).

condicao_compativel([A]) :-
    verifica_sintoma(A).

% Verifica se o sintoma existe e é compatível
verifica_sintoma(Sintoma) :-
    Sintoma = sintoma(ID, Evidencia, Opcoes, Valor),
    sintoma(_, Evidencia, Opcoes, Valor).

% Retorna falso se houver um valor diferente para a mesma evidência
verifica_sintoma(Sintoma) :-
    Sintoma = sintoma(ID, Evidencia, Opcoes, Valor),
    sintoma(_, Evidencia, Opcoes, ValorDiferente),
    Valor \= ValorDiferente,
    !.

% Caso a evidência ainda não tenha sido perguntada, pede ao utilizador
verifica_sintoma(Sintoma) :-
    Sintoma = sintoma(ID, Evidencia, Opcoes, Valor),
    format('~w: ~n', [Evidencia]), % Print the question
    read(NovoValor),              % Read user input
    cria_sintoma(Evidencia, Opcoes, NovoValor). % Create the symptom with user input

cria_sintoma(Evidencia, Opcoes, Opcao) :-
    assertz(sintoma(_, Evidencia, Opcoes, Opcao)).

% Conclude and assert diagnostics based on rule conditions, with symptoms that led to it
concluir_diagnostico(_, [], _).

concluir_diagnostico(ID, [diagnostico()], SintomasConfirmados) :-
    assertz(diagnostico(ID, Diagnostico, SintomasConfirmados)),
    format('~w ', [Diagnostico]),
    retract(SintomasConfirmados).
