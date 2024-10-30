% Import de Bibliotecas HTTP
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_client)).
:- use_module(library(http/http_server)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_parameters)).
:- use_module(library(http/http_open)).
:- use_module(library(http/http_cors)).
:- use_module(library(date)).
:- use_module(library(random)).
:- use_module(library(socket)).

:- use_module(library(http/json_convert)).
:- use_module(library(http/http_json)).
:- use_module(library(http/json)).

:- set_prolog_flag(encoding, utf8).

:-op(220,xfx,entao).
:-op(35,xfy,se).
:-op(240,fx,regra).
:-op(600,xfy,e).

:- consult('Regras 1-33.txt').

% Declara sintoma/2 como dinâmico
:- dynamic sintoma/3, diagnostico/2, diagnostico/1, liga_facto/2, backup_regras/1, ultimo_facto/1.

% SERVER START
iniciar_servidor(PORT) :-
    http_server(http_dispatch, [port(PORT)]).

% Adiciona um novo endpoint /start para adicionar sintomas
:- http_handler('/execute', start_engine_handler, []).

% Processa o pedido POST /start
start_engine_handler(Request) :-
    http_read_json_dict(Request, DictList),
    retractall(sintoma(_, _)),
    criar_sintomas(DictList),
    catch(
        processa_regras,
        reply_sent,
        true
    ).

% Processa a lista de objetos JSON.
criar_sintomas(DictList) :-
        findall(_, (member(Dict, DictList),
                atom_string(EvidenciaAtom, Dict.evidencia),
                atom_string(ValorAtom, Dict.valor),
                assertz(sintoma(EvidenciaAtom, [], ValorAtom))), _).

:- http_handler('/nextStep', next_engine_handler, []).

next_engine_handler(Request) :-
    http_read_json_dict(Request, DictList),
    criar_sintomas(DictList),
    backup_regras(Regras),
    verifica_regras(Regras).

processa_regras :-
    findall((ID, LHS, RHS), (regra ID se LHS entao RHS), Regras),
    verifica_regras(Regras).

verifica_regras([Regra | Regras]) :-
    retractall(backup_regras(_)),
    assertz(backup_regras([Regra | Regras])),
    aplica_regra(Regra),
    verifica_regras(Regras).

verifica_regras([]):-
    obter_diagnosticos(Resposta).

aplica_regra((_, [\+ ignorar(X) | _], _)) :-
    ignorar(X), !.

aplica_regra((ID, LHS, RHS)) :-
    condicao_compativel(LHS),
    concluir_diagnostico(RHS).

condicao_compativel([A e B | C]) :-
    verifica_sintoma(A),
    condicao_compativel([B | C]).

condicao_compativel([A e B]) :-
    verifica_sintoma(A),
    condicao_compativel([B]).

condicao_compativel([A]) :-
    verifica_sintoma(A).

verifica_sintoma(Sintoma):-
    Sintoma = ignorar(Valor),
    ignorar(ValorDiferente),
    ValorDiferente \= Valor.

% Verifica se o sintoma existe e é compatível
verifica_sintoma(Sintoma) :-
    Sintoma = sintoma(Evidencia, Opcoes, Valor),
    sintoma(Evidencia, _, Valor),
    (   ultimo_facto(Ultimo) ->
        (Ultimo \= Sintoma ->
            assertz(liga_facto(Sintoma, Ultimo)),
            retract(ultimo_facto(Ultimo))
        ;   retract(ultimo_facto(Ultimo)), true)
    ;   true
    ),
    assertz(ultimo_facto(sintoma(Evidencia, Opcoes, Valor))).

% Retorna falso se houver um valor diferente para a mesma evidência
verifica_sintoma(Sintoma) :-
    Sintoma = sintoma(Evidencia, Opcoes, Valor),
    sintoma(Evidencia, _, ValorDiferente),
    Valor \= ValorDiferente,
    !.

% Caso a evidência ainda não tenha sido perguntada, pede ao utilizador
verifica_sintoma(Sintoma) :-
    Sintoma = sintoma(Evidencia, Opcoes, _),
    Response = _{evidencia: Evidencia, opcoes: Opcoes},
    reply_json_dict(Response),
    throw(reply_sent).

% Conclude and assert diagnostics based on rule conditions, with symptoms that led to it
concluir_diagnostico([]).

concluir_diagnostico([ignorar(Valor)]):-
    assertz(ignorar(Valor)).

concluir_diagnostico([diagnostico(_)]) :-
    Diagonostico = diagnostico(TextoDiagnostico),
    assertz(liga_facto(Diagnostico, ultimo_facto(Ultimo))),
    retract(Ultimo),
    justifica_sintoma(Diagnostico, Justifica),
    assertz(diagnostico(Diagnostico, Justifica)).


justifica_sintoma(Diagnostico, Justifica) :-
    justifica_sintoma_aux(Diagnostico, [], JustificaReverse),
    reverse(JustificaReverse, Justifica).

justifica_sintoma_aux(Sintoma, JustificaAtual, [Sintoma|JustificaAtual]) :-
    \+ liga_facto(Sintoma, _).

justifica_sintoma_aux(Elemento, JustificaAtual, JustificaCompleta) :-
    liga_facto(Elemento, SintomaAnterior),
    justifica_sintoma_aux(SintomaAnterior, [Elemento|JustificaAtual], JustificaCompleta).

obter_diagnosticos(Response) :-
    findall(
        _{
            diagnostico: TextoDiagnostico,
            sintomas_historico: ListaSintomasFormatados
        },
        (   diagnostico(TextoDiagnostico, ListaSintomas),
            formatar_sintomas(ListaSintomas, ListaSintomasFormatados)
        ),
        Response
    ),
    reply_json_dict(Response).

formatar_sintomas([], []).

formatar_sintomas([sintoma(Evidencia, Opcoes, Valor) | Resto], [_{evidencia: Evidencia, opcoes: Opcoes, valor: Valor} | SintomasFormatados]) :-
    formatar_sintomas(Resto, SintomasFormatados).

set_header(Response) :-
    reply_header([
        content_type('application/json; charset=utf-8')
    ]).
