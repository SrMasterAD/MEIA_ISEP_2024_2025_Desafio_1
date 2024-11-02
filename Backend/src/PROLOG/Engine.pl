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
:- use_module(library(http/http_header)).
:- use_module(library(http/json_convert)).
:- use_module(library(http/http_json)).
:- use_module(library(http/json)).

:- set_prolog_flag(encoding, utf8).

:-op(220,xfx,entao).
:-op(35,xfy,se).
:-op(240,fx,regra).
:-op(600,xfy,e).

:- consult('Regras PROLOG.txt').

:- dynamic sintoma_confirmado/5, sintoma/4, diagnostico/2, diagnostico/1, liga_facto/2, backup_regras/1, sintoma_existente/1, ultimo_facto/1, ignorar/1, regra_atual/1, back_up_ultimo/1, ignorar_regra/0, justifica_criado/0.

cors_enable :-
    format('Access-Control-Allow-Origin: http://localhost:3000~n'),
    format('Access-Control-Allow-Methods: POST, OPTIONS~n'),
    format('Access-Control-Allow-Headers: Content-Type~n').

% SERVER START
iniciar_servidor(PORT) :-
    http_server(http_dispatch, [port(PORT)]).
% Adiciona um novo endpoint /start para adicionar sintomas
:- http_handler('/execute', start_engine_handler, []).

start_engine_handler(Request) :-
option(method(options), Request), !,
cors_enable,
format('~n').  % Responde com um status 200 vazio

% Processa o pedido POST /start
start_engine_handler(Request) :-
    cors_enable,
    http_read_json_dict(Request, DictList),
    limpar_dados,
    criar_sintomas(DictList),
    catch(
        processa_regras,
        reply_sent,
        true
    ).

limpar_dados:-
    retractall(sintoma(_, _, _, _)),
    retractall(sintoma_confirmado(_, _, _, _, _)),
    retractall(diagnostico(_,_)),
    retractall(diagnostico(_)),
    retractall(liga_facto(_,_)),
    retractall(backup_regras(_)),
    retractall(sintoma_existente(_)),
    retractall(ultimo_facto(_)),
    retractall(ignorar(_)),
    retractall(ignorar_regra(_)),
    retractall(justifica_criado(_)),
    retractall(back_up_ultimo(_)).

% Processa a lista de objetos JSON.
criar_sintomas(DictList) :-
        findall(_, (member(Dict, DictList),
                atom_string(EvidenciaAtom, Dict.evidencia),
                atom_string(ValorAtom, Dict.valor),
                assertz(sintoma(EvidenciaAtom, [], ValorAtom, false))), _).

:- http_handler('/nextStep', next_engine_handler, []).


next_engine_handler(Request) :-
option(method(options), Request), !,
cors_enable,
format('~n').  % Responde com um status 200 vazio

next_engine_handler(Request) :-
    cors_enable,
    http_read_json_dict(Request, DictList),
    criar_sintomas(DictList),
    backup_regras(Regras),
    catch(
        verifica_regras(Regras),
        reply_sent,
        true
    ).

processa_regras :-
    findall((ID, LHS, RHS), (regra ID se LHS entao RHS), Regras),
    verifica_regras(Regras).

verifica_regras([Regra | Regras]) :-
    retractall(backup_regras(_)),
    assertz(backup_regras([Regra | Regras])),
    aplica_regra(Regra),
    retractall(ignorar_regra),
    verifica_regras(Regras).

verifica_regras([]):-
    obter_diagnosticos(Resposta).

aplica_regra((ID, LHS, RHS)) :-
    ignorar_regra.

aplica_regra((ID, LHS, RHS)) :-
    retractall(regra_atual(_)),
    assertz(regra_atual(ID)),
    retractall(justifica_criado),
    condicao_compativel(LHS),
    concluir_diagnostico(RHS).

condicao_compativel(_):-
    ignorar_regra.

condicao_compativel([A e B | C]) :-
    verifica_sintoma(A),
    condicao_compativel([B | C]).

condicao_compativel([A]) :-
    verifica_sintoma(A).

%Verificacoes de ignorar sintomas

verifica_sintoma(Sintoma):-
    Sintoma = ignorar(Valor),
    ignorar(Valor),
    assertz(ignorar_regra).

verifica_sintoma(Sintoma):-
    Sintoma = ignorar(Valor),
    \+ ignorar(Valor).

%Verificacoes de sintomas existentes
verifica_sintoma(Sintoma) :-
    Sintoma = sintoma_existente(sintoma(Evidencia, _, Valor, _)),
    (   
        sintoma(Evidencia, _, Valor, _) 
    ->
        true
    ;
        assertz(ignorar_regra)
    ).

% Verifica se o sintoma existe e é compatível
verifica_sintoma(Sintoma) :-
    regra_atual(ID),
    Sintoma = sintoma(Evidencia, Opcoes, Valor, Multi),
    sintoma(Evidencia, _, Valor, _),
    assertz(sintoma_confirmado(ID, Evidencia, Opcoes, Valor, Multi)),
    SintomaConfirmado = sintoma_confirmado(ID, Evidencia, Opcoes, Valor, Multi),
    (   ultimo_facto(Ultimo) ->
        (Ultimo \= SintomaConfirmado ->
            assertz(liga_facto(SintomaConfirmado, Ultimo)),
            assertz(back_up_ultimo(Ultimo)),
            retract(ultimo_facto(Ultimo))
        ;   
            retract(ultimo_facto(Ultimo)), true)
    ;   
        true
    ),
    assertz(justifica_criado),
    assertz(ultimo_facto(SintomaConfirmado)).

% Retorna falso se houver um valor diferente para a mesma evidência
verifica_sintoma(Sintoma) :-
    Sintoma = sintoma(Evidencia, Opcoes, Valor, _),
    sintoma(Evidencia, _, ValorDiferente, _),
    Valor \= ValorDiferente,
    (   justifica_criado ->
        (   ultimo_facto(SintomaConfirmado) ->
            (   liga_facto(ultimo_facto(SintomaConfirmado), _) ->
                retract(liga_facto(ultimo_facto(SintomaConfirmado), _)),
                retract(ultimo_facto(SintomaConfirmado)),
                back_up_ultimo(Ultimo),
                assertz(ultimo_facto(Ultimo))
            ;   
                retract(ultimo_facto(SintomaConfirmado)),
                back_up_ultimo(Ultimo),
                assertz(ultimo_facto(Ultimo))
            )
        ;   true
        ),
        retract(justifica_criado)
    ;   true
    ),
    assertz(ignorar_regra).

% Caso a evidência ainda não tenha sido perguntada, pede ao utilizador
verifica_sintoma(Sintoma) :-
    Sintoma = sintoma(Evidencia, Opcoes, _, Multi),
    Response = _{questao: Evidencia, valores: Opcoes, multiselect: Multi},
    reply_json_dict(Response),
    throw(reply_sent).
    
% Conclude and assert diagnostics based on rule conditions, with symptoms that led to it
concluir_diagnostico([]).

concluir_diagnostico(_):-
    ignorar_regra.

concluir_diagnostico([ignorar(Valor)]):-
    assertz(ignorar(Valor)).

concluir_diagnostico([Diagnostico]) :-
    assertz(Diagnostico),
    ultimo_facto(Ultimo),
    assertz(liga_facto(Diagnostico, Ultimo)),
    retract(ultimo_facto(Ultimo)),
    justifica_sintoma(Diagnostico, Justifica),
    Diagnostico=diagnostico(TextoDiagnostico),
    assertz(diagnostico(TextoDiagnostico, Justifica)).


justifica_sintoma(Diagnostico, Justifica) :-
    justifica_sintoma_aux(Diagnostico, [], Justifica).
    
justifica_sintoma_aux(Sintoma, JustificaAtual, [Sintoma|JustificaAtual]) :-
    \+ liga_facto(Sintoma, _).

justifica_sintoma_aux(Elemento, JustificaAtual, JustificaCompleta) :-
    (   diagnostico(Elemento) ->                                
        liga_facto(Elemento, SintomaAnterior),                   
        justifica_sintoma_aux(SintomaAnterior, JustificaAtual, JustificaCompleta)
    ;   liga_facto(Elemento, SintomaAnterior),                   
        justifica_sintoma_aux(SintomaAnterior, [Elemento|JustificaAtual], JustificaCompleta)
    ).

obter_diagnosticos(Response) :-
    findall(
        _{diagnostico: TextoDiagnostico, historicoSintomas: ListaSintomasFormatados},
        (   diagnostico(TextoDiagnostico, ListaSintomas),
            formatar_sintomas(ListaSintomas, ListaSintomasFormatados)
        ),
        Response
    ),
    reply_json_dict(Response).

formatar_sintomas([], []).

formatar_sintomas([diagnostico(TextoDiagnostico) | Resto], SintomasFormatados) :-
    formatar_sintomas(Resto, SintomasFormatados).

formatar_sintomas([sintoma_confirmado(ID, Evidencia, Opcoes, Valor, Multi) | Resto], 
    [_{regra: ID, evidencia: Evidencia, opcoes: Opcoes, valor: Valor, multi: Multi} | SintomasFormatados]) :-
    formatar_sintomas(Resto, SintomasFormatados).


set_header(Response) :-
    reply_header([
        content_type('application/json; charset=utf-8')
    ]).
